import {newTools,safetyTopics,safetyPhase} from './manufacturing-2026.mjs';
const tools=document.getElementById('memo-tools');
for(const group of ['Upper','Middle','Lower']){
 const heading=document.createElement('h4');heading.textContent=group+' / '+({Upper:'상',Middle:'중',Lower:'하'}[group]);tools.append(heading);
 const grid=document.createElement('div');grid.className='memo-tools';
 for(const t of newTools.filter(t=>t[1]===group)){
  const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption'),name=document.createElement('strong');
  img.src=`media/eps-topik/interview-tools/${t[0]}.png`;img.alt=t[3];img.loading='lazy';name.lang='ko';name.textContent=t[2];caption.append(name,document.createTextNode(t[3]+' · '+t[4]));figure.append(img,caption);grid.append(figure);
 }tools.append(grid);
}
for(const phase of ['Before work','During work','After work','Abnormal situations']){
 const details=document.createElement('details'),summary=document.createElement('summary'),list=document.createElement('ol');list.className='memo-checklist';summary.textContent=phase;
 safetyTopics.forEach((t,i)=>{if(safetyPhase(i)!==phase)return;const item=document.createElement('li');item.textContent=`${t[0]} — ${t[2]} / ${t[3]}`;list.append(item);});details.append(summary,list);document.getElementById('memo-safety').append(details);
}
