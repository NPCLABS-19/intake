import * as THREE from 'three';
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshSurfaceSampler} from 'three/addons/math/MeshSurfaceSampler.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export async function createMonogram(stage,{assetMode=false}={}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:768px)').matches;
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'default',preserveDrawingBuffer:assetMode});
 renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:2));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
 stage.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,0,13.6);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.06);scene.environment=environment.texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xfffef3,0x4c5634,.8));
 const key=new THREE.DirectionalLight(0xfffbeb,2.2);key.position.set(-5,7,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0xe6eddb,1.5);rim.position.set(5,3,-4);scene.add(rim);
 const fill=new THREE.DirectionalLight(0xffffff,.25);fill.position.set(3,-2,6);scene.add(fill);
 const group=new THREE.Group();group.scale.setScalar(1.25);scene.add(group);
 let seed=7149;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 const textures=[],geometries=[],materials=[];
 const loader=new THREE.TextureLoader();
 const [diffuse,normalMap,roughness,bump,alpha,svg,mossAsset,mossCarpet]=await Promise.all([
  loader.loadAsync(import.meta.env.BASE_URL+'assets/materials/cast-concrete-photo.png'),loader.loadAsync(import.meta.env.BASE_URL+'assets/materials/concrete-nor_gl.jpg'),loader.loadAsync(import.meta.env.BASE_URL+'assets/materials/concrete-Rough.jpg'),loader.loadAsync(import.meta.env.BASE_URL+'assets/materials/concrete-Bump.jpg'),loader.loadAsync(import.meta.env.BASE_URL+'assets/materials/moss/moss-alpha.png'),new SVGLoader().loadAsync(import.meta.env.BASE_URL+'assets/monogram.svg'),new GLTFLoader().loadAsync(import.meta.env.BASE_URL+'assets/materials/moss/moss.gltf'),loader.loadAsync(import.meta.env.BASE_URL+'assets/materials/moss-carpet.png')
 ]);
 for(const t of [diffuse,normalMap,roughness,bump]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.push(t);}diffuse.colorSpace=THREE.SRGBColorSpace;alpha.flipY=false;textures.push(alpha);
 mossCarpet.colorSpace=THREE.SRGBColorSpace;mossCarpet.wrapS=mossCarpet.wrapT=THREE.RepeatWrapping;mossCarpet.repeat.set(.85,.85);mossCarpet.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.push(mossCarpet);
 const pointer=new THREE.Vector2(.5,.5),targetPointer=new THREE.Vector2(.5,.5);
 const uniforms={uPointer:{value:pointer},uViewport:{value:new THREE.Vector2(1,1)},uStrength:{value:0},uFull:{value:0},uRadius:{value:.105},uTime:{value:0}};
 const noise=`
 float hash3(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
 float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
 `;
 const uniformGLSL=`uniform vec2 uPointer;uniform vec2 uViewport;uniform float uStrength;uniform float uFull;uniform float uRadius;uniform float uTime;`;
 const fragmentCommon=uniformGLSL+noise+`
 varying vec3 vObjectPoint; varying vec3 vObjectNormal;
 float reveal(){vec2 delta=(gl_FragCoord.xy/uViewport-uPointer)*vec2(uViewport.x/uViewport.y,1.);float edge=(noise3(vObjectPoint*11.)-.5)*.04+(noise3(vObjectPoint*27.)-.5)*.018;float grow=1.-smoothstep(uRadius*.38,uRadius+edge,length(delta+vec2(noise3(vObjectPoint*13.),noise3(vObjectPoint*13.+9.))*.035-.0175));return max(uFull,grow*smoothstep(.02,.9,uStrength));}
 `;
 function coat(material,type){
  material.onBeforeCompile=shader=>{
   Object.assign(shader.uniforms,uniforms);if(type==='concrete'){shader.uniforms.uMossMap={value:mossCarpet};shader.uniforms.uConcreteMap={value:diffuse};}
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\n'+uniformGLSL+noise+`\nvarying vec3 vObjectPoint; varying vec3 vObjectNormal;\n${type==='root'?'attribute vec3 aAnchor;':''}`);
   const growth=type==='concrete'?'':`
    vec4 anchor=vec4(${type==='root'?'aAnchor':'vec3(0.)'},1.);
    #ifdef USE_INSTANCING
     anchor=instanceMatrix*anchor;
    #else
     ${type==='root'?'':'anchor=vec4(position,1.);'}
    #endif
    vec4 screenAnchor=projectionMatrix*modelViewMatrix*anchor;
    vec2 screen=screenAnchor.xy/screenAnchor.w*.5+.5;
    vec2 delta=(screen-uPointer)*vec2(uViewport.x/uViewport.y,1.);
    float edge=(noise3(anchor.xyz*8.)-.5)*.05;
    float cover=1.-smoothstep(uRadius*.43,uRadius+edge,length(delta));
    float activation=max(uFull,cover*smoothstep(.05,.95,uStrength));
    float growth=smoothstep(.02,.9,activation);
    ${type==='root'?'transformed=mix(aAnchor,transformed,growth);':'transformed*=max(.001,growth);'}
    ${type==='plant'?"transformed.x+=sin(uTime*.6+anchor.x*3.+anchor.y*4.)*pow(max(position.y,0.)*8.,2.)*.0004*growth;":''}
   `;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n'+growth+`
    vec4 objectPoint=vec4(transformed,1.);
    #ifdef USE_INSTANCING
      objectPoint=instanceMatrix*objectPoint;
    #endif
    vObjectPoint=objectPoint.xyz; vObjectNormal=normal;
   `);
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\n'+fragmentCommon+(type==='concrete'?`
uniform sampler2D uMossMap;uniform sampler2D uConcreteMap;
 vec3 castConcrete(vec3 p,vec3 n){
  vec3 w=pow(abs(normalize(n)),vec3(8.));w/=max(dot(w,vec3(1.)),.001);
  return texture2D(uConcreteMap,p.zy*.28,1.2).rgb*w.x+texture2D(uConcreteMap,p.xz*.28,1.2).rgb*w.y+texture2D(uConcreteMap,p.xy*.28,1.2).rgb*w.z;
 }
 float concreteRelief(vec3 p){return dot(castConcrete(p,vObjectNormal),vec3(.2126,.7152,.0722));}
 `:''));
   if(type==='concrete'){
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
     diffuseColor.rgb=castConcrete(vObjectPoint,vObjectNormal)*.65;
     vec3 weights=pow(abs(normalize(vObjectNormal)),vec3(5.)); weights/=max(dot(weights,vec3(1.)),.001);
     vec3 livingMoss=(texture2D(uMossMap,vObjectPoint.zy*.48).rgb*weights.x+texture2D(uMossMap,vObjectPoint.xz*.48).rgb*weights.y+texture2D(uMossMap,vObjectPoint.xy*.48).rgb*weights.z)*vec3(1.12,1.22,1.02);
     diffuseColor.rgb=mix(diffuseColor.rgb,livingMoss,smoothstep(.08,.64,reveal())*.98);
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=max(roughnessFactor,.88);');
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
     float relief=concreteRelief(vObjectPoint);
     vec3 sx=dFdx(-vViewPosition),sy=dFdy(-vViewPosition);
     vec3 r1=cross(sy,normal),r2=cross(normal,sx);
     float det=dot(sx,r1);
     vec3 grad=sign(det)*(dFdx(relief)*r1+dFdy(relief)*r2);
     normal=normalize(abs(det)*normal-grad*.018);
     `);

   }else{
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float exposed=reveal();if(exposed<.035)discard;
      diffuseColor.a*=smoothstep(.025,.22,exposed);
      ${type==='bed'?`float moss=noise3(vObjectPoint*38.)*.6+noise3(vObjectPoint*93.)*.4;diffuseColor.rgb*=mix(vec3(.8,.92,.68),vec3(1.5,1.65,1.2),moss);`:''}
    `);
   }
  };
  material.customProgramCacheKey=()=>`intake-lush-${type}-v8`;materials.push(material);return material;
 }
 const shapes=svg.paths.flatMap(p=>p.toShapes());
 const geometry=new THREE.ExtrudeGeometry(shapes,{depth:118,bevelEnabled:true,bevelThickness:1.5,bevelSize:.9,bevelSegments:4,curveSegments:36});
 geometry.scale(.0096,-.0096,.0096);
 // Reflecting SVG Y reverses triangle winding. Restore outward-facing caps and
 // walls so the central junction renders as the original single solid outline.
 if(geometry.index){const a=geometry.index.array;for(let i=0;i<a.length;i+=3){const t=a[i+1];a[i+1]=a[i+2];a[i+2]=t;}geometry.index.needsUpdate=true;}
 else for(const attribute of Object.values(geometry.attributes)){const a=attribute.array,k=attribute.itemSize;for(let i=0;i<attribute.count;i+=3)for(let c=0;c<k;c++){const j=(i+1)*k+c,l=(i+2)*k+c,t=a[j];a[j]=a[l];a[l]=t;}attribute.needsUpdate=true;}
 geometry.center();
 const uv=geometry.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/340,uv.getY(i)/340);uv.needsUpdate=true;geometries.push(geometry);
 const concrete=coat(new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:1,metalness:0,envMapIntensity:.18,transmission:0,opacity:1,transparent:false,thickness:.65,ior:1.15,attenuationDistance:5,attenuationColor:0xf2f6e7}), 'concrete');
 const mark=new THREE.Mesh(geometry,concrete);group.add(mark);
 const sampler=new MeshSurfaceSampler(mark).setRandomGenerator(rand).build(),p=new THREE.Vector3(),n=new THREE.Vector3();
 function sampleSurface(){for(let i=0;i<30;i++){sampler.sample(p,n);if(n.z>.55||n.y>.75)return;}sampler.sample(p,n);}
 const upright=new THREE.Vector3(0,1,0),dummy=new THREE.Object3D(),q=new THREE.Quaternion();
 const mossColors=['#c2c9b2','#d7dcc6','#a9b99c','#d1d6ba','#b4c4a4'];
 // Low cushion masses create actual volume underneath the scanned moss shoots.
 const cushion=new THREE.IcosahedronGeometry(1,3),positions=cushion.getAttribute('position');
 for(let i=0;i<positions.count;i++){const v=new THREE.Vector3().fromBufferAttribute(positions,i),s=1+Math.sin(v.x*16+v.z*9)*Math.sin(v.y*13)*.07;v.multiplyScalar(s);positions.setXYZ(i,v.x,v.y,v.z);}cushion.computeVertexNormals();geometries.push(cushion);
 const cushions=new THREE.InstancedMesh(cushion,coat(new THREE.MeshStandardMaterial({color:0xffffff,map:mossCarpet,bumpMap:mossCarpet,bumpScale:.004,roughness:1,envMapIntensity:.18}),'bed'),mobile?100:220);
 for(let i=0;i<cushions.count;i++){
  sampleSurface();const radius=.035+Math.pow(rand(),1.7)*.085;dummy.position.copy(p).addScaledVector(n,-radius*.07);q.setFromUnitVectors(upright,n);dummy.quaternion.copy(q);dummy.rotateY(rand()*Math.PI*2);dummy.scale.set(radius*(1+rand()*.7),radius*.24,radius*(.8+rand()*.7));dummy.updateMatrix();cushions.setMatrixAt(i,dummy.matrix);cushions.setColorAt(i,new THREE.Color(mossColors[Math.floor(rand()*mossColors.length)]));
 }group.add(cushions);
 // Real photographed, alpha-cut moss shoots, instanced in twelve natural variants.
 const variants=[];mossAsset.scene.traverse(o=>{if(o.isMesh)variants.push(o);});
 const sharedMoss=variants[0].material.clone();sharedMoss.alphaMap=alpha;sharedMoss.alphaTest=.24;sharedMoss.alphaToCoverage=true;sharedMoss.transparent=false;sharedMoss.depthWrite=true;sharedMoss.side=THREE.DoubleSide;sharedMoss.envMapIntensity=.22;sharedMoss.roughness=1;sharedMoss.color.setHex(0xffffff);sharedMoss.normalScale.set(.6,.6);coat(sharedMoss,'plant');
 const perVariant=mobile?520:1050;
 for(const source of variants){
  const plants=new THREE.InstancedMesh(source.geometry,sharedMoss,perVariant);geometries.push(source.geometry);
  for(let i=0;i<perVariant;i++){
   sampleSurface();dummy.position.copy(p).addScaledVector(n,.006);q.setFromUnitVectors(upright,n);dummy.quaternion.copy(q);dummy.rotateY(rand()*Math.PI*2);const size=2.8+Math.pow(rand(),1.4)*6.2;dummy.scale.setScalar(size);dummy.updateMatrix();plants.setMatrixAt(i,dummy.matrix);plants.setColorAt(i,new THREE.Color().setHSL(.20+rand()*.04,.08+rand()*.1,.84+rand()*.13));
  }group.add(plants);
 }
 // Creeping roots and fern tips sit on the opaque mineral surface.
 const stemParts=[],rootParts=[],leafParts=[];
 function anchored(g,anchor){const a=new Float32Array(g.getAttribute('position').count*3);for(let i=0;i<a.length;i+=3){a[i]=anchor.x;a[i+1]=anchor.y;a[i+2]=anchor.z;}g.setAttribute('aAnchor',new THREE.BufferAttribute(a,3));return g;}
 for(let i=0;i<(mobile?30:65);i++){
  sampleSurface();const anchor=p.clone().addScaledVector(n,.018),l=.12+rand()*.28,angle=rand()*Math.PI*2;
  const curve=new THREE.CatmullRomCurve3([anchor,anchor.clone().add(new THREE.Vector3(Math.cos(angle)*l*.3,Math.sin(angle)*l*.3,.018)),anchor.clone().add(new THREE.Vector3(Math.cos(angle)*l*.7,Math.sin(angle)*l*.7,.025+rand()*.025)),anchor.clone().add(new THREE.Vector3(Math.cos(angle+.5)*l,Math.sin(angle+.5)*l,-.02))]);
  rootParts.push(anchored(new THREE.TubeGeometry(curve,13,.004+rand()*.007,4,false),anchor));
 }
 const leafShape=new THREE.Shape();leafShape.moveTo(0,0);leafShape.bezierCurveTo(-.045,.035,-.04,.12,0,.17);leafShape.bezierCurveTo(.045,.11,.04,.035,0,0);
 const leafBase=new THREE.ShapeGeometry(leafShape,5);const leafPos=leafBase.getAttribute('position');for(let i=0;i<leafPos.count;i++){leafPos.setZ(i,Math.sin(leafPos.getY(i)/.17*Math.PI)*.018);}leafBase.computeVertexNormals();
 for(let i=0;i<(mobile?4:8);i++){
  sampleSurface();const anchor=p.clone().addScaledVector(n,.006),height=.18+rand()*.24;
  const tangent=new THREE.Vector3((rand()-.5)*.7,.7+rand()*.4,.2+rand()*.4).normalize();
  const tip=anchor.clone().addScaledVector(tangent,height),control=anchor.clone().addScaledVector(tangent,height*.6).add(new THREE.Vector3(.08,0,.07));
  const curve=new THREE.QuadraticBezierCurve3(anchor,control,tip);stemParts.push(anchored(new THREE.TubeGeometry(curve,10,.007,5,false),anchor));
  for(let j=2;j<=7;j++)for(const side of [-1,1]){
   const pos=curve.getPoint(j/8),leaf=leafBase.clone(),transform=new THREE.Object3D();transform.position.copy(pos);transform.rotation.set(.15+rand()*.5,rand()*.6,(side*.8)-(rand()*.2));transform.scale.setScalar((.65+(1-j/8)*.55)*(rand()*.3+.9));transform.updateMatrix();leaf.applyMatrix4(transform.matrix);leafParts.push(anchored(leaf,anchor));
  }
 }
 function mergedMesh(parts,color){if(!parts.length)return;const g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());geometries.push(g);group.add(new THREE.Mesh(g,coat(new THREE.MeshStandardMaterial({color,roughness:.93,side:THREE.DoubleSide,envMapIntensity:.2}),'root')));}
 mergedMesh(rootParts,0x554b32);mergedMesh(stemParts,0x45601c);mergedMesh(leafParts,0x526b3b);leafBase.dispose();
 let targetStrength=0,keyboardReveal=false,touching=false,visible=true,disposed=false,frame=0,time=0,last=performance.now();
 const resize=()=>{const {width,height}=stage.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);renderer.getDrawingBufferSize(uniforms.uViewport.value);camera.aspect=width/height;camera.position.z=camera.aspect<.85?14.4:13.6;camera.updateProjectionMatrix();};
 const ro=new ResizeObserver(resize);ro.observe(stage);resize();
 function move(event){const r=stage.getBoundingClientRect();targetPointer.set((event.clientX-r.left)/r.width,1-(event.clientY-r.top)/r.height);if(event.pointerType==='mouse'||touching)targetStrength=1;}
 function down(event){if(event.pointerType!=='mouse')touching=true;move(event);}
 function release(){touching=false;if(!keyboardReveal)targetStrength=0;}
 function leave(){if(!touching&&!keyboardReveal)targetStrength=0;}
 function keydown(event){if(event.key==='Enter'||event.key===' '){event.preventDefault();keyboardReveal=!keyboardReveal;targetPointer.set(.5,.5);targetStrength=keyboardReveal?1:0;stage.setAttribute('aria-pressed',String(keyboardReveal));}}
 function blur(){keyboardReveal=false;stage.setAttribute('aria-pressed','false');release();}
 stage.addEventListener('pointermove',move);stage.addEventListener('pointerdown',down);stage.addEventListener('pointerleave',leave);stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('keydown',keydown);stage.addEventListener('blur',blur);
 const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});io.observe(stage);
 function setTreatment(value){uniforms.uFull.value=value==='moss'?1:0;targetStrength=value==='reveal'?1:0;targetPointer.set(.52,.52);}
 setTreatment(new URLSearchParams(location.search).get('treatment')||'white');
 function render(now){
  if(disposed)return;frame=requestAnimationFrame(render);const dt=Math.min((now-last)/1000,.05);last=now;if(!visible||document.hidden)return;
  const animate=!reduced.matches&&!assetMode;if(animate)time+=dt;uniforms.uTime.value=time;
  group.rotation.set(.16+Math.sin(time*.25)*.035,-.38+Math.sin(time*.22)*.065,-.10+Math.sin(time*.18)*.018);group.position.y=animate?Math.sin(time*.56)*.09:0;
  pointer.lerp(targetPointer,reduced.matches?1:1-Math.exp(-dt*12));
  // Deliberate growth on entry; faster restoration when the pointer leaves.
  uniforms.uStrength.value=THREE.MathUtils.lerp(uniforms.uStrength.value,targetStrength,reduced.matches?1:1-Math.exp(-dt*(targetStrength?3.1:5.8)));
  renderer.render(scene,camera);stage.dataset.ready='true';stage.dataset.reveal=uniforms.uStrength.value>.05?'active':'idle';stage.dataset.motion=reduced.matches?'reduced':'floating';
 }
 frame=requestAnimationFrame(render);
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();stage.dataset.ready='false';});
 const api={setTreatment,exportPNG(){const previous=uniforms.uStrength.value;uniforms.uStrength.value=targetStrength;pointer.copy(targetPointer);renderer.render(scene,camera);const png=renderer.domElement.toDataURL('image/png');uniforms.uStrength.value=previous;return png;},dispose(){disposed=true;cancelAnimationFrame(frame);ro.disconnect();io.disconnect();const gs=new Set(geometries),ms=new Set(materials),ts=new Set(textures);scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material){ms.add(o.material);for(const v of Object.values(o.material))if(v?.isTexture)ts.add(v);}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());ts.forEach(t=>t.dispose());environment.dispose();renderer.dispose();}};
 addEventListener('pagehide',()=>api.dispose(),{once:true});return api;
}
