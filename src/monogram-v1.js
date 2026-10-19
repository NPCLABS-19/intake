import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// One geometry, one camera and one timeline: the revealed material cannot drift.
export async function createMonogram(stage, {assetMode=false}={}) {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width: 768px)').matches;
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'default',preserveDrawingBuffer:assetMode});
  renderer.setClearColor(0x000000,0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile?1.75:2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.0;
  stage.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,1,.1,100);
  camera.position.set(0,0,12.4);
  const pmrem=new THREE.PMREMGenerator(renderer);
  const room=new RoomEnvironment();
  const environment=pmrem.fromScene(room,.04);
  scene.environment=environment.texture;
  room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff,0x747d61,.65));
  const key=new THREE.DirectionalLight(0xfffcf2,2.1);key.position.set(-4,7,7);scene.add(key);
  const rim=new THREE.DirectionalLight(0xffffff,1.25);rim.position.set(5,1,-3);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xe7eddf,.35);fill.position.set(3,-2,5);scene.add(fill);
  const group=new THREE.Group();scene.add(group);
  let seed=7149;
  const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const pointer=new THREE.Vector2(.5,.5),targetPointer=new THREE.Vector2(.5,.5);
  const uniforms={uPointer:{value:pointer},uViewport:{value:new THREE.Vector2(1,1)},uStrength:{value:0},uFull:{value:0},uRadius:{value:.23}};
  const common=`
    uniform vec2 uPointer;
    uniform vec2 uViewport;
    uniform float uStrength;
    uniform float uFull;
    uniform float uRadius;
    varying vec3 vObjectPoint;
    float hash3(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
    float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
    float reveal(){vec2 pixel=gl_FragCoord.xy/uViewport;vec2 delta=(pixel-uPointer)*vec2(uViewport.x/uViewport.y,1.);
      float edge=(noise3(vObjectPoint*15.)-.5)*.025;
      return max(uFull,(1.-smoothstep(uRadius*.63,uRadius+edge,length(delta)))*uStrength);}
  `;
  function revealMaterial(material,organic=false){
    material.onBeforeCompile=shader=>{
      Object.assign(shader.uniforms,uniforms);
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vObjectPoint;').replace('#include <begin_vertex>','#include <begin_vertex>\nvObjectPoint=position;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\n'+common);
      const change=organic?`float mossMask=reveal();if(mossMask<.03) discard;float dither=hash3(vec3(gl_FragCoord.xy,0.));if(dither>mossMask)discard;`:
        `float mossMask=reveal();float mossDetail=noise3(vObjectPoint*42.);float mossPatch=noise3(vObjectPoint*5.);
        vec3 deepGreen=mix(vec3(.006,.018,.0015),vec3(.04,.09,.008),mossPatch);
        vec3 mossColor=mix(deepGreen,vec3(.15,.23,.028),pow(mossDetail,3.));
        diffuseColor.rgb=mix(diffuseColor.rgb,mossColor,mossMask);`;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+change);
    };
    material.customProgramCacheKey=()=>organic?'intake-organic-v1':'intake-white-moss-v1';
    return material;
  }
  const svg=await new SVGLoader().loadAsync(import.meta.env.BASE_URL+'assets/monogram.svg');
  const shapes=svg.paths.flatMap(path=>path.toShapes());
  const geometry=new THREE.ExtrudeGeometry(shapes,{depth:62,bevelEnabled:true,bevelThickness:1.6,bevelSize:1.2,bevelSegments:4,curveSegments:32});
  geometry.scale(.0096,-.0096,.0096);geometry.center();geometry.computeVertexNormals();
  const noiseCanvas=document.createElement('canvas');noiseCanvas.width=noiseCanvas.height=256;
  const ctx=noiseCanvas.getContext('2d'),pixels=ctx.createImageData(256,256);
  for(let i=0;i<pixels.data.length;i+=4){const v=160+rand()*95;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;}
  ctx.putImageData(pixels,0,0);
  const bump=new THREE.CanvasTexture(noiseCanvas);bump.wrapS=bump.wrapT=THREE.RepeatWrapping;bump.repeat.set(4,4);
  const white=revealMaterial(new THREE.MeshPhysicalMaterial({color:0xf1f0e7,roughness:.78,metalness:0,clearcoat:0,clearcoatRoughness:.7,bumpMap:bump,bumpScale:.009,envMapIntensity:.35}));
  const mark=new THREE.Mesh(geometry,white);group.add(mark);
  // Sample the actual supplied vector extrusion so vegetation follows its silhouette.
  const sampler=new MeshSurfaceSampler(mark).build(),sample=new THREE.Vector3(),normal=new THREE.Vector3();
  const grassPositions=[],grassColors=[];
  const greens=[new THREE.Color('#304316'),new THREE.Color('#4c6220'),new THREE.Color('#788836'),new THREE.Color('#24360e'),new THREE.Color('#9aa24c')];
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),d=new THREE.Vector3(),e=new THREE.Vector3();
  const tangent=new THREE.Vector3(),bend=new THREE.Vector3(),axis=new THREE.Vector3(0,1,0);
  const count=mobile?6500:12500;
  function vertex(v,col,shade){grassPositions.push(v.x,v.y,v.z);grassColors.push(col.r*shade,col.g*shade,col.b*shade);}
  for(let i=0;i<count;i++){
    sampler.sample(sample,normal);if(normal.z<-.2)continue;
    tangent.crossVectors(normal,Math.abs(normal.y)>.9?new THREE.Vector3(1,0,0):axis).normalize().applyAxisAngle(normal,rand()*Math.PI*2);
    bend.copy(tangent).multiplyScalar((rand()-.5)*.22);
    const length=.035+Math.pow(rand(),2)*.21,width=.0025+rand()*.009;
    a.copy(sample).addScaledVector(tangent,-width);b.copy(sample).addScaledVector(tangent,width);
    c.copy(sample).addScaledVector(normal,length*.55).addScaledVector(tangent,width*.48).addScaledVector(bend,.3);
    d.copy(sample).addScaledVector(normal,length*.55).addScaledVector(tangent,-width*.48).addScaledVector(bend,.3);
    e.copy(sample).addScaledVector(normal,length).add(bend);
    const col=greens[Math.floor(rand()*greens.length)];
    vertex(a,col,.45);vertex(b,col,.45);vertex(c,col,.8);vertex(a,col,.45);vertex(c,col,.8);vertex(d,col,.8);vertex(d,col,.8);vertex(c,col,.8);vertex(e,col,1.08);
  }
  const grassGeometry=new THREE.BufferGeometry();grassGeometry.setAttribute('position',new THREE.Float32BufferAttribute(grassPositions,3));grassGeometry.setAttribute('color',new THREE.Float32BufferAttribute(grassColors,3));grassGeometry.computeVertexNormals();
  const grassMaterial=revealMaterial(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.98,side:THREE.DoubleSide,envMapIntensity:.25}),true);
  group.add(new THREE.Mesh(grassGeometry,grassMaterial));
  // Fine root filaments introduce a second scale of detail without video textures.
  const roots=[];
  for(let i=0;i<(mobile?160:340);i++){
    sampler.sample(sample,normal);if(normal.z<.5)continue;
    const start=sample.clone().addScaledVector(normal,.004),points=[];
    const angle=rand()*Math.PI*2,l=.08+rand()*.22,phase=rand()*6;
    for(let j=0;j<=8;j++){const f=j/8;points.push(start.clone().add(new THREE.Vector3(Math.cos(angle)*l*f,Math.sin(angle)*l*f,.015+Math.sin(f*7+phase)*.022*f)));}
    for(let j=0;j<8;j++)roots.push(points[j].x,points[j].y,points[j].z,points[j+1].x,points[j+1].y,points[j+1].z);
  }
  const rootGeometry=new THREE.BufferGeometry();rootGeometry.setAttribute('position',new THREE.Float32BufferAttribute(roots,3));
  const rootMaterial=revealMaterial(new THREE.LineBasicMaterial({color:0x687335}),true);
  group.add(new THREE.LineSegments(rootGeometry,rootMaterial));
  let targetStrength=0,keyboardReveal=false,touching=false,visible=true,disposed=false,frame=0,time=0,last=performance.now();
  const clockStart=performance.now();
  const resize=()=>{const {width,height}=stage.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);renderer.getDrawingBufferSize(uniforms.uViewport.value);camera.aspect=width/height;camera.position.z=camera.aspect<.85?13.9:12.4;camera.updateProjectionMatrix();};
  const ro=new ResizeObserver(resize);ro.observe(stage);resize();
  function move(event){const rect=stage.getBoundingClientRect();targetPointer.set((event.clientX-rect.left)/rect.width,1-(event.clientY-rect.top)/rect.height);if(event.pointerType==='mouse'||touching)targetStrength=1;}
  function down(event){if(event.pointerType!=='mouse'){touching=true;targetStrength=1;}move(event);}
  function release(){touching=false;if(!keyboardReveal)targetStrength=0;}
  function leave(){if(!touching&&!keyboardReveal)targetStrength=0;}
  function keydown(event){if(event.key==='Enter'||event.key===' '){event.preventDefault();keyboardReveal=!keyboardReveal;targetPointer.set(.5,.5);targetStrength=keyboardReveal?1:0;stage.setAttribute('aria-pressed',String(keyboardReveal));}}
  function blur(){keyboardReveal=false;stage.setAttribute('aria-pressed','false');release();}
  stage.addEventListener('pointermove',move);stage.addEventListener('pointerdown',down);stage.addEventListener('pointerleave',leave);stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('keydown',keydown);stage.addEventListener('blur',blur);
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});io.observe(stage);
  const preview=new URLSearchParams(location.search).get('treatment');
  if(preview==='moss')uniforms.uFull.value=1;
  if(preview==='reveal'){targetStrength=1;targetPointer.set(.53,.52);}

  function render(now){
    if(disposed)return;
    frame=requestAnimationFrame(render);
    const dt=Math.min((now-last)/1000,.05);last=now;
    if(!visible||document.hidden)return;
    const animate=!reduced.matches&&!assetMode;
    if(animate)time+=dt;
    group.rotation.set(.25+Math.sin(time*.32)*.065,-.44+Math.sin(time*.27)*.14,-.12+Math.sin(time*.22)*.035);
    group.position.y=animate?Math.sin(time*.72)*.11:.01;
    pointer.lerp(targetPointer,reduced.matches?1:1-Math.exp(-dt*16));
    uniforms.uStrength.value=THREE.MathUtils.lerp(uniforms.uStrength.value,targetStrength,reduced.matches?1:1-Math.exp(-dt*9));
    renderer.render(scene,camera);
    stage.dataset.reveal=uniforms.uStrength.value>.05?'active':'idle';
    stage.dataset.ready='true';
    stage.dataset.motion=reduced.matches?'reduced':'floating';
    if(now-clockStart>700)stage.dataset.settled='true';
  }
  frame=requestAnimationFrame(render);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();stage.dataset.ready='false';});
  const api={
    setTreatment(value){uniforms.uFull.value=value==='moss'?1:0;targetStrength=value==='reveal'?1:0;targetPointer.set(.53,.52);},
    exportPNG(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');},
    dispose(){disposed=true;cancelAnimationFrame(frame);ro.disconnect();io.disconnect();geometry.dispose();grassGeometry.dispose();rootGeometry.dispose();white.dispose();grassMaterial.dispose();rootMaterial.dispose();bump.dispose();environment.dispose();renderer.dispose();}
  };
  addEventListener('pagehide',()=>api.dispose(),{once:true});
  return api;
}
