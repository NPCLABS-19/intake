export function initGlassScene(){
  const stage=document.querySelector('[data-glass-scene]');
  if(!stage)return;
  const video=stage.querySelector('video'),poster=stage.querySelector('.glass-poster');
  const optic=stage.querySelector('.glass-optic');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const state={visible:false,pinned:false,x:0,y:0,targetX:0,targetY:0};
  const lens=document.createElement('canvas');lens.className='glass-clear-lens';lens.setAttribute('aria-hidden','true');stage.insertBefore(lens,optic);
  const context=lens.getContext('2d');
  let width=0,height=0,ratio=1,frame=0,last=performance.now(),outline=[];
  const edgeSource=stage.querySelector('.glass-edge-front').getAttribute('src');
  for(let i=0;i<10;i++){
    const depth=-22+i*4;
    const sheet=document.createElement('div');sheet.className='glass-depth-sheet';sheet.style.setProperty('--depth',depth+'px');sheet.setAttribute('aria-hidden','true');
    const edge=document.createElement('img');edge.src=edgeSource;edge.alt='';edge.className='glass-depth-rim';edge.style.setProperty('--depth',depth+'px');
    optic.append(sheet,edge);
  }
  // Retain every original corner; subdivide only the supplied cubic curves.
  fetch(import.meta.env.BASE_URL+'assets/monogram-window.svg').then(r=>r.text()).then(svg=>{
    const d=new DOMParser().parseFromString(svg,'image/svg+xml').querySelector('path').getAttribute('d');
    const tokens=d.match(/[MLCZ]|-?\d*\.?\d+/gi);let i=0,x=0,y=0,startX=0,startY=0;
    while(i<tokens.length){
      const command=tokens[i++].toUpperCase();
      if(command==='M'||command==='L'){
        x=Number(tokens[i++]);y=Number(tokens[i++]);outline.push([x,y]);if(command==='M'){startX=x;startY=y;}
      }else if(command==='C'){
        const a=Number(tokens[i++]),b=Number(tokens[i++]),c=Number(tokens[i++]),d=Number(tokens[i++]),ex=Number(tokens[i++]),ey=Number(tokens[i++]);
        for(let j=1;j<=40;j++){const t=j/40,u=1-t;outline.push([u*u*u*x+3*u*u*t*a+3*u*t*t*c+t*t*t*ex,u*u*u*y+3*u*u*t*b+3*u*t*t*d+t*t*t*ey]);}x=ex;y=ey;
      }else if(command==='Z'){x=startX;y=startY;outline.push([x,y]);}
    }
    stage.dataset.lens='fixed-video';wake();
  }).catch(()=>{stage.dataset.lens='unavailable';});
  const angles=()=>reduced.matches?{rx:0,ry:0,tx:0,ty:0}:{rx:(-3-state.y*7)*Math.PI/180,ry:(-5+state.x*10)*Math.PI/180,tx:state.x*14,ty:state.y*10};
  function draw(){
    if(!width||!height)return;
    const {rx,ry,tx,ty}=angles();
    stage.style.setProperty('--glass-rx',rx*180/Math.PI+'deg');stage.style.setProperty('--glass-ry',ry*180/Math.PI+'deg');
    stage.style.setProperty('--glass-x',tx+'px');stage.style.setProperty('--glass-y',ty+'px');
    context.setTransform(ratio,0,0,ratio,0,0);context.clearRect(0,0,width,height);
    const source=video.readyState>=2?video:poster,sw=source.videoWidth||source.naturalWidth,sh=source.videoHeight||source.naturalHeight;
    if(!sw||!sh||!outline.length)return;
    const scale=Math.min(width*.94*.8584,height*.94*.9512)/590,path=new Path2D();
    // Project the moving glass silhouette, never the video pixels beneath it.
    outline.forEach(([sx,sy],index)=>{
      const x=(sx-540)*scale,y=(sy-540)*scale,z=20;
      const ax=Math.cos(ry)*x+Math.sin(ry)*z,az=-Math.sin(ry)*x+Math.cos(ry)*z;
      const ay=Math.cos(rx)*y-Math.sin(rx)*az,bz=Math.sin(rx)*y+Math.cos(rx)*az;
      const perspective=1000/(1000-bz),px=width/2+(ax+tx)*perspective,py=height/2+(ay+ty)*perspective;
      if(index===0)path.moveTo(px,py);else path.lineTo(px,py);
    });path.closePath();
    // Match the stationary source video's 106% cover crop exactly.
    const cover=Math.max(width*1.06/sw,height*1.06/sh);
    context.save();context.clip(path);context.drawImage(source,(width-sw*cover)/2,(height-sh*cover)/2,sw*cover,sh*cover);context.restore();
  }
  function tick(now){
    frame=0;const dt=Math.min((now-last)/1000,.05);last=now;
    const ease=reduced.matches?1:1-Math.exp(-dt*7);
    state.x+=(state.targetX-state.x)*ease;state.y+=(state.targetY-state.y)*ease;draw();
    const moving=Math.abs(state.targetX-state.x)+Math.abs(state.targetY-state.y)>.0005;
    if(state.visible&&!document.hidden&&(moving||!video.paused))frame=requestAnimationFrame(tick);
  }
  function wake(){if(state.visible&&!document.hidden&&!frame){last=performance.now();frame=requestAnimationFrame(tick);}else if(!state.visible)draw();}
  const resize=new ResizeObserver(()=>{width=stage.clientWidth;height=stage.clientHeight;ratio=Math.min(devicePixelRatio,1.5);lens.width=Math.round(width*ratio);lens.height=Math.round(height*ratio);draw();wake();});resize.observe(stage);
  const playback=()=>{if(!state.visible||document.hidden||reduced.matches)video.pause();else video.play().catch(()=>{});wake();};
  stage.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'||reduced.matches)return;const r=stage.getBoundingClientRect();
    state.targetX=Math.max(-1,Math.min(1,(event.clientX-r.left)/r.width*2-1));state.targetY=Math.max(-1,Math.min(1,(event.clientY-r.top)/r.height*2-1));stage.dataset.tilt='pointer';wake();
  });
  const reset=()=>{state.targetX=state.targetY=0;stage.dataset.tilt='rest';wake();};
  stage.addEventListener('pointerleave',()=>{if(!state.pinned)reset();});
  const toggle=()=>{state.pinned=!state.pinned;stage.setAttribute('aria-pressed',String(state.pinned));if(state.pinned){state.targetX=.65;state.targetY=-.35;stage.dataset.tilt='pinned';wake();}else reset();};
  stage.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}if(e.key==='Escape'){state.pinned=false;stage.setAttribute('aria-pressed','false');reset();}});
  stage.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')toggle();});
  stage.addEventListener('blur',()=>{state.pinned=false;stage.setAttribute('aria-pressed','false');reset();});
  video.addEventListener('loadeddata',wake);poster.addEventListener('load',wake);video.addEventListener('play',wake);
  video.addEventListener('canplay',()=>{stage.dataset.video='ready';playback();});video.addEventListener('error',()=>{stage.dataset.video='fallback';wake();});
  const observer=new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting;playback();},{threshold:.1});observer.observe(stage);
  reduced.addEventListener('change',()=>{state.x=state.y=0;reset();playback();});document.addEventListener('visibilitychange',playback);
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);resize.disconnect();video.pause();observer.disconnect();},{once:true});
}
