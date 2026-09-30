const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wrapWords(el){
  if(!el||el.dataset.wc==='1')return;
  const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode(n){
    if(!n.nodeValue||!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;
    if(n.parentElement&&n.parentElement.closest('a,button,script,style,.word-cascade'))return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;
  }});
  const nodes=[];while(walk.nextNode())nodes.push(walk.currentNode);
  nodes.forEach(textNode=>{
    const raw=textNode.nodeValue;
    const parts=raw.split(/(\s+)/);
    const frag=document.createDocumentFragment();
    parts.forEach(part=>{
      if(!part)return;
      if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(part));return;}
      const wrap=document.createElement('span');
      wrap.className='wc-word';
      const inner=document.createElement('span');
      inner.className='wc-inner';
      inner.textContent=part;
      wrap.appendChild(inner);
      frag.appendChild(wrap);
    });
    textNode.parentNode.replaceChild(frag,textNode);
  });
  el.classList.add('word-cascade');
  el.dataset.wc='1';
}

function cascadeIn(el){
  if(!el||el.classList.contains('is-on'))return;
  const inners=[...el.querySelectorAll('.wc-inner')];
  inners.forEach((inner,i)=>{inner.style.animationDelay=(i*0.045)+'s';});
  el.classList.add('is-on');
}

if('IntersectionObserver' in window&&!reduced){
  document.documentElement.classList.add('js-motion');
  const textTargets=[];
  document.querySelectorAll('.reveal').forEach(block=>{
    // Cascade text inside reveal blocks; leave non-text as already visible
    const textEls=[...block.querySelectorAll('h1,h2,h3,p,summary,.kicker,.label,.micro,.section-head p')];
    if(block.matches('h1,h2,h3,p,summary')) textEls.unshift(block);
    const uniq=[...new Set(textEls)];
    uniq.forEach(t=>{wrapWords(t);textTargets.push(t);});
    block.classList.remove('reveal');
  });
  // Also hero copy text not marked reveal
  document.querySelectorAll('.hero-copy h1,.hero-copy p,.launch-banner strong,.launch-banner span').forEach(t=>{
    wrapWords(t);textTargets.push(t);
  });
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){cascadeIn(entry.target);observer.unobserve(entry.target);}
  }),{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  textTargets.forEach(el=>observer.observe(el));
}else{
  // reduced motion / no IO: ensure anything we might wrap stays visible (no wrap needed)
  document.querySelectorAll('.reveal').forEach(el=>el.classList.remove('reveal'));
}

const hazards={knife:{label:'Exposed knife',title:'An exposed knife on the counter',desc:'A loose blade on a busy kitchen surface can be easy to overlook.',fix:'Store the knife in a knife block, sheath, or designated drawer after use.',box:['14%','62%','37%','10%']},rug:{label:'Loose kitchen rug',title:'A rug in a busy walkway',desc:'An unsecured rug can shift or curl at the edges, creating a possible trip hazard.',fix:'Check that the rug lies flat and secure it with a suitable non-slip backing.',box:['47%','67%','29%','17%']}};
function selectHazard(button){document.querySelectorAll('[data-hazard]').forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1});const h=hazards[button.dataset.hazard];document.getElementById('hazard-panel').setAttribute('aria-labelledby',button.id);document.getElementById('hazard-label').textContent=h.label;document.getElementById('risk-title').textContent=h.title;document.getElementById('risk-desc').textContent=h.desc;document.getElementById('risk-fix').textContent=h.fix;const box=document.getElementById('hazard-box');['left','top','width','height'].forEach((p,i)=>box.style[p]=h.box[i]);}
document.querySelectorAll('[data-hazard]').forEach(button=>{button.addEventListener('click',()=>selectHazard(button));button.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=[...document.querySelectorAll('[data-hazard]')];const next=e.key==='Home'?tabs[0]:e.key==='End'?tabs[1]:tabs.find(t=>t!==button);selectHazard(next);next.focus();}})});
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