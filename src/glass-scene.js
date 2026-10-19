export function initGlassScene(){
  const stage=document.querySelector('[data-glass-scene]');
  if(!stage)return;
  const video=stage.querySelector('video');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const state={visible:false,pinned:false};
  // Draw the same decoded frame into the clear lens; blur the source directly.
  // This avoids masked backdrop-filter failures in composited 3D containers.
  const lens=document.createElement('canvas');lens.className='glass-clear-lens';lens.setAttribute('aria-hidden','true');stage.querySelector('.glass-optic').prepend(lens);
  const context=lens.getContext('2d'),poster=stage.querySelector('.glass-poster');
  let lensFrame=0;
  const drawLens=()=>{
    const source=video.readyState>=2?video:poster;
    const sw=source.videoWidth||source.naturalWidth,sh=source.videoHeight||source.naturalHeight;
    if(!sw||!sh)return;
    const rect=lens.getBoundingClientRect(),ratio=Math.min(devicePixelRatio,1.5);
    const w=Math.round(rect.width*ratio),h=Math.round(rect.height*ratio);
    if(lens.width!==w||lens.height!==h){lens.width=w;lens.height=h;}
    const scale=Math.max(w/sw,h/sh);context.clearRect(0,0,w,h);context.drawImage(source,(w-sw*scale)/2,(h-sh*scale)/2,sw*scale,sh*scale);
  };
  const lensTick=()=>{lensFrame=0;drawLens();if(state.visible&&!document.hidden&&!video.paused)lensFrame=requestAnimationFrame(lensTick);};
  const lensObserver=new ResizeObserver(drawLens);lensObserver.observe(stage);
  video.addEventListener('loadeddata',drawLens);poster.addEventListener('load',drawLens);
  video.addEventListener('play',()=>{if(!lensFrame)lensFrame=requestAnimationFrame(lensTick);});
  drawLens();
  let frame=0,pointer=null;
  const playback=()=>{
    if(!state.visible||document.hidden||reduced.matches)video.pause();
    else video.play().catch(()=>{});
    drawLens();if(state.visible&&!document.hidden&&!video.paused&&!lensFrame)lensFrame=requestAnimationFrame(lensTick);
  };
  const position=(x,y)=>{
    if(reduced.matches)return;
    stage.style.setProperty('--glass-rx',(-y*6).toFixed(2)+'deg');
    stage.style.setProperty('--glass-ry',(x*8).toFixed(2)+'deg');
    stage.style.setProperty('--glass-x',(x*14).toFixed(2)+'px');
    stage.style.setProperty('--glass-y',(y*10).toFixed(2)+'px');
    stage.style.setProperty('--scene-x',(-x*12).toFixed(2)+'px');
    stage.style.setProperty('--scene-y',(-y*9).toFixed(2)+'px');
  };
  const move=()=>{
    frame=0;if(!pointer)return;
    const r=stage.getBoundingClientRect();
    position((pointer.x-r.left)/r.width*2-1,(pointer.y-r.top)/r.height*2-1);
  };
  const reset=()=>{
    cancelAnimationFrame(frame);frame=0;
    for(const name of ['--glass-rx','--glass-ry','--glass-x','--glass-y','--scene-x','--scene-y'])stage.style.removeProperty(name);
    stage.dataset.tilt='rest';
  };
  stage.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'||reduced.matches)return;
    pointer={x:event.clientX,y:event.clientY};stage.dataset.tilt='pointer';
    if(!frame)frame=requestAnimationFrame(move);
  });
  stage.addEventListener('pointerleave',()=>{if(!state.pinned)reset();});
  const toggle=()=>{state.pinned=!state.pinned;stage.setAttribute('aria-pressed',String(state.pinned));if(state.pinned){position(.65,-.35);stage.dataset.tilt='pinned';}else reset();};
  stage.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}if(e.key==='Escape'){state.pinned=false;stage.setAttribute('aria-pressed','false');reset();}});
  stage.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')toggle();});
  stage.addEventListener('blur',()=>{state.pinned=false;stage.setAttribute('aria-pressed','false');reset();});
  video.addEventListener('canplay',()=>{stage.dataset.video='ready';playback();});
  video.addEventListener('error',()=>{stage.dataset.video='fallback';});
  const observer=new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting;playback();},{threshold:.1});observer.observe(stage);
  reduced.addEventListener('change',()=>{reset();playback();});document.addEventListener('visibilitychange',playback);
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);cancelAnimationFrame(lensFrame);lensObserver.disconnect();video.pause();observer.disconnect();},{once:true});
}
