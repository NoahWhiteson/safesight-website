const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if('IntersectionObserver' in window&&!reduced){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
const hazards={knife:{label:'Exposed knife',title:'An exposed knife on the counter',desc:'A loose blade on a busy kitchen surface can be easy to overlook.',fix:'Store the knife in a knife block, sheath, or designated drawer after use.',box:['14%','62%','37%','10%']},rug:{label:'Loose kitchen rug',title:'A rug in a busy walkway',desc:'An unsecured rug can shift or curl at the edges, creating a possible trip hazard.',fix:'Check that the rug lies flat and secure it with a suitable non-slip backing.',box:['47%','67%','29%','17%']}};
function selectHazard(button){document.querySelectorAll('[data-hazard]').forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1});const h=hazards[button.dataset.hazard];document.getElementById('hazard-panel').setAttribute('aria-labelledby',button.id);document.getElementById('hazard-label').textContent=h.label;document.getElementById('risk-title').textContent=h.title;document.getElementById('risk-desc').textContent=h.desc;document.getElementById('risk-fix').textContent=h.fix;const box=document.getElementById('hazard-box');['left','top','width','height'].forEach((p,i)=>box.style[p]=h.box[i]);}
document.querySelectorAll('[data-hazard]').forEach(button=>{button.addEventListener('click',()=>selectHazard(button));button.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=[...document.querySelectorAll('[data-hazard]')];const next=e.key==='Home'?tabs[0]:e.key==='End'?tabs[1]:tabs.find(t=>t!==button);selectHazard(next);next.focus();}})});
// Animate native details while retaining keyboard and screen-reader behavior.
document.querySelectorAll('.questions details').forEach(details=>{
 const summary=details.querySelector('summary');let animation=null;let desiredOpen=details.open;
 summary.addEventListener('click',event=>{
  if(reduced)return;
  event.preventDefault();desiredOpen=!desiredOpen;
  const start=details.getBoundingClientRect().height;
  if(animation)animation.cancel();
  details.style.height='';
  details.open=desiredOpen;
  const end=details.getBoundingClientRect().height;
  details.open=true;
  animation=details.animate([{height:start+'px'},{height:end+'px'}],{duration:300,easing:'cubic-bezier(.22,1,.36,1)'});
  animation.onfinish=()=>{details.open=desiredOpen;details.style.height='';animation=null;};
 });
});
