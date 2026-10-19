export function initDailySequence(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const field=document.querySelector('.routine');
  let fieldFrame=0,fieldX=0,fieldY=0,fieldTargetX=0,fieldTargetY=0;
  const drift=()=>{
    fieldX+=(fieldTargetX-fieldX)*.085;fieldY+=(fieldTargetY-fieldY)*.085;
    field.style.setProperty('--drift-x',fieldX.toFixed(2)+'px');field.style.setProperty('--drift-y',fieldY.toFixed(2)+'px');
    if(Math.abs(fieldTargetX-fieldX)+Math.abs(fieldTargetY-fieldY)>.2)fieldFrame=requestAnimationFrame(drift);else fieldFrame=0;
  };
  const startDrift=()=>{if(!fieldFrame&&!reduced.matches)fieldFrame=requestAnimationFrame(drift);};
  field.addEventListener('pointermove',e=>{
    if(reduced.matches)return;const r=field.getBoundingClientRect();
    fieldTargetX=(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))-.5)*r.width*.48;
    fieldTargetY=(Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))-.5)*Math.min(r.height,850)*.6;
    startDrift();
  },{passive:true});
  field.addEventListener('pointerleave',()=>{fieldTargetX=fieldTargetY=0;startDrift();});
  reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(fieldFrame);fieldFrame=0;fieldX=fieldY=fieldTargetX=fieldTargetY=0;field.style.setProperty('--drift-x','0px');field.style.setProperty('--drift-y','0px');}});
  addEventListener('pagehide',()=>cancelAnimationFrame(fieldFrame),{once:true});
  const labelControllers=[];
  const setLabels=open=>labelControllers.forEach(control=>control(open));
  for(const stage of document.querySelectorAll('.nutrition-stage')){
    const glass=stage.querySelector('.nutrition-glass');
    const toggle=stage.querySelector('.nutrition-toggle');
    const reveal=stage.querySelector('.nutrition-reveal');
    const preview=stage.querySelector('.nutrition-preview');
    const peek=stage.querySelector('.nutrition-peek-toggle');
    const content=stage.querySelector('.nutrition-preview-content');
    const state={pinned:false};
    const measure=()=>{const height=glass.scrollHeight+10;stage.style.setProperty('--full-height',height+'px');stage.style.setProperty('--peek-height',(height*.1)+'px');};
    const resize=new ResizeObserver(measure);resize.observe(content);measure();
    let raf=0,pointer=null;
    const update=()=>{
      const open=state.pinned;
      stage.dataset.open=String(open);
      toggle.setAttribute('aria-expanded',String(open));
      peek.setAttribute('aria-expanded',String(open));
      peek.setAttribute('aria-label',(open?'Collapse ':'Expand ')+stage.querySelector('h3').textContent+' ingredient label');
      preview.setAttribute('aria-hidden',String(!open));
      toggle.setAttribute('aria-hidden',String(!open));toggle.tabIndex=open?0:-1;
      toggle.querySelector('span').textContent=open?'Close label':'View full label';
      toggle.setAttribute('aria-label',(open?'Collapse ':'Expand ')+stage.querySelector('h3').textContent+' ingredient label');
      for(const element of stage.querySelectorAll('.ingredient-table,.nutrition-note'))element.setAttribute('aria-hidden',String(!open));
      reveal.setAttribute('aria-hidden',String(!open));
    };
    const reset=()=>{cancelAnimationFrame(raf);raf=0;glass.style.removeProperty('--rx');glass.style.removeProperty('--ry');glass.style.removeProperty('--light-x');glass.style.removeProperty('--light-y');};
    const tilt=()=>{
      raf=0;if(!pointer||reduced.matches)return;
      const r=stage.getBoundingClientRect();
      const x=Math.max(0,Math.min(1,(pointer.x-r.left)/r.width));
      const y=Math.max(0,Math.min(1,(pointer.y-r.top)/r.height));
      glass.style.setProperty('--rx',((.5-y)*6).toFixed(2)+'deg');
      glass.style.setProperty('--ry',((x-.5)*8).toFixed(2)+'deg');
      glass.style.setProperty('--light-x',(x*100).toFixed(1)+'%');
      glass.style.setProperty('--light-y',(y*100).toFixed(1)+'%');
    };
    stage.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!reduced.matches){pointer={x:e.clientX,y:e.clientY};if(!raf)raf=requestAnimationFrame(tilt);}});
    stage.addEventListener('pointerleave',reset);
    labelControllers.push(open=>{state.pinned=open;reset();update();});
    const flip=()=>setLabels(!state.pinned);
    toggle.addEventListener('click',flip);peek.addEventListener('click',flip);
    glass.addEventListener('click',e=>{if(!e.target.closest('button'))flip();});
    stage.addEventListener('keydown',e=>{if(e.key==='Escape'){setLabels(false);}});
    reduced.addEventListener('change',()=>{if(reduced.matches)reset();});
    update();
    addEventListener('pagehide',()=>{resize.disconnect();reset();},{once:true});
  }

  const wordmark=document.querySelector('.footer-wordmark');
  const name=wordmark.querySelector('.footer-name');
  const fitName=()=>{name.style.fontSize='100px';const width=name.getBoundingClientRect().width;name.style.fontSize=(wordmark.clientWidth/width*100)+'px';};
  const wordmarkObserver=new ResizeObserver(fitName);wordmarkObserver.observe(wordmark);document.fonts.ready.then(fitName);
  const button=document.querySelector('.footer-clock');
  const mark=button.querySelector('.footer-clock-mark');
  // Sixty distinct clockwise steps; pausing retains the exact tick position.
  const clock=mark.animate([{transform:'rotate(0deg)'},{transform:'rotate(360deg)'}],{duration:60000,iterations:Infinity,easing:'steps(60, end)'});
  const state={hover:false,focus:false,pinned:false,visible:false};
  const sync=()=>{
    const paused=reduced.matches||document.hidden||!state.visible||state.hover||state.focus||state.pinned;
    if(paused)clock.pause();else clock.play();
    button.dataset.rotating=String(!paused);
    button.setAttribute('aria-pressed',String(state.pinned));
    button.setAttribute('aria-label',state.pinned?'Resume monogram rotation':'Pause monogram rotation');
  };
  button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){state.hover=true;sync();}});
  button.addEventListener('pointerleave',()=>{state.hover=false;sync();});
  button.addEventListener('focus',()=>{state.focus=button.matches(':focus-visible');sync();});
  button.addEventListener('blur',()=>{state.focus=false;sync();});
  button.addEventListener('click',()=>{state.pinned=!state.pinned;sync();});
  const observer=new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting;sync();});observer.observe(button);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);sync();
  addEventListener('pagehide',()=>{clock.pause();observer.disconnect();},{once:true});
}
