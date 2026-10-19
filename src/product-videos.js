// Product scenes remain single integrated renders: no pack overlays or cutouts.
export function initProductVideos(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const players=[];
  for(const figure of document.querySelectorAll('.product-visual')){
    const video=figure.querySelector('video');
    const state={hover:false,focus:false,manual:false,offscreen:true};
    const apply=()=>{
      const paused=reduced.matches||document.hidden||state.hover||state.focus||state.manual||state.offscreen;
      figure.dataset.paused=String(paused);
      if(paused)video.pause();else if(video.src)video.play().catch(()=>{figure.dataset.paused='true';});
    };
    figure.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){state.hover=true;apply();}});
    figure.addEventListener('pointerleave',()=>{state.hover=false;apply();});
    video.addEventListener('focus',()=>{if(video.matches(':focus-visible')){state.focus=true;apply();}});
    video.addEventListener('blur',()=>{state.focus=false;state.manual=false;apply();});
    const toggle=()=>{state.hover=false;state.focus=false;state.manual=!video.paused;apply();};
    video.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle();}});
    video.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')toggle();});
    video.addEventListener('loadedmetadata',()=>{figure.dataset.duration=video.duration.toFixed(2);figure.dataset.resolution=video.videoWidth+'x'+video.videoHeight;apply();});
    video.addEventListener('canplay',()=>{figure.dataset.ready='true';apply();});
    video.addEventListener('error',()=>{figure.dataset.ready='false';});
    const io=new IntersectionObserver(entries=>{state.offscreen=!entries[0].isIntersecting;apply();},{threshold:.1});io.observe(figure);
    // While generation is in progress the approved still remains visible.
    fetch(video.dataset.src,{method:'HEAD'}).then(response=>{if(response.ok){video.src=video.dataset.src;video.load();}}).catch(()=>{});
    document.addEventListener('visibilitychange',apply);reduced.addEventListener('change',apply);
    players.push({video,io,apply});
  }
  addEventListener('pagehide',()=>{for(const p of players){p.video.pause();p.io.disconnect();}},{once:true});
}
