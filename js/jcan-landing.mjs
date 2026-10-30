const reduced=matchMedia('(prefers-reduced-motion: reduce)');
// Collapse dense reference sections while keeping their headings and deep links available.
for(const id of ['inclusions','advantages','benefits','item-4']){
 const section=document.getElementById(id);if(!section)continue;
 const heading=section.querySelector('h5');if(!heading)continue;
 const details=document.createElement('details');details.className='journey-details';
 const summary=document.createElement('summary');summary.append(heading);details.append(summary);
 const content=document.createElement('div');content.className='journey-details-content';
 while(section.firstChild)content.append(section.firstChild);details.append(content);section.append(details);
}
function openTarget(hash){const target=document.getElementById(hash.replace(/^#/,''));if(!target)return;target.querySelector('details.journey-details')?.setAttribute('open','');}
document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(link)openTarget(link.hash);});
addEventListener('hashchange',()=>openTarget(location.hash));openTarget(location.hash);
// A small number of entrance effects mark section changes; content is visible without JS.
const reveals=[...document.querySelectorAll('.book-section,.korea-gallery-heading,.jcan-registration .registration-layout')];
if('IntersectionObserver'in window&&!reduced.matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.08});reveals.forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('jcan-reveal');observer.observe(el)}});reduced.addEventListener('change',()=>{if(reduced.matches){reveals.forEach(el=>el.classList.add('is-visible'));observer.disconnect()}});}
const photos=[...document.querySelectorAll('.korea-photo-grid figure')];
if(photos.length){
 const dialog=document.createElement('dialog');dialog.className='korea-lightbox';dialog.setAttribute('aria-label','Korea photo viewer');
 const close=document.createElement('button');close.type='button';close.className='lightbox-close';close.textContent='Close ×';
 const image=document.createElement('img');const caption=document.createElement('p');caption.id='korea-lightbox-caption';dialog.setAttribute('aria-describedby',caption.id);
 dialog.append(close,image,caption);document.body.append(dialog);
 close.onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close()}});
 let opener;dialog.addEventListener('close',()=>{document.body.classList.remove('photo-open');opener?.focus()});
 photos.forEach(figure=>{const source=figure.querySelector('img');const button=document.createElement('button');button.type='button';button.className='korea-photo-open';button.setAttribute('aria-label',`Enlarge photo: ${source.alt}`);source.replaceWith(button);button.append(source);const hint=document.createElement('span');hint.className='photo-enlarge';hint.textContent='View photo ↗';button.append(hint);button.onclick=()=>{opener=button;image.src=source.currentSrc||source.src;image.alt=source.alt;caption.textContent=figure.querySelector('figcaption').textContent;dialog.showModal();document.body.classList.add('photo-open');close.focus()};});
}
