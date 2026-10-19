import {initGlassScene} from './glass-scene.js';
initGlassScene();
import {initDailySequence} from './daily-sequence.js';
initDailySequence();
import {initProductVideos} from './product-videos.js';
initProductVideos();
const stage=document.querySelector('#monogram-stage');
if(new URLSearchParams(location.search).has('wireframe')){
  stage.innerHTML='<p>[Two-product hero media]</p>';
  stage.removeAttribute('role');stage.removeAttribute('tabindex');stage.removeAttribute('aria-pressed');stage.removeAttribute('aria-label');
}else{
  import('./monogram.js').then(({createMonogram})=>createMonogram(stage)).catch(error=>{
    stage.dataset.ready='false';stage.setAttribute('role','img');stage.removeAttribute('tabindex');stage.removeAttribute('aria-pressed');stage.setAttribute('aria-label','INTAKE monogram. Interactive 3D is unavailable in this browser.');console.error('Monogram fallback:',error);
  });
}
document.querySelectorAll('.mobile-nav a').forEach(link=>link.addEventListener('click',()=>{document.querySelector('.mobile-nav details').open=false;}));
