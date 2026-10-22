import {videoGroups,selectedClip,clipEmbedUrl,clipSourceUrl} from './skills-video-catalog.mjs?v=skills-clips-1';
const $=selector=>document.querySelector(selector);
const language=$('#video-language'),group=$('#video-group'),skill=$('#video-skill');
const player=$('#skills-player'),frame=$('#skills-player-frame'),status=$('#video-status');
const time=seconds=>Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
function renderSkills(){
 const previous=skill.value;
 skill.replaceChildren(...videoGroups[group.value].skills.map(item=>{
  const option=document.createElement('option');option.value=item[0];option.textContent=(language.value==='tl'?item[2]:item[1])+' · '+time(item[4]-item[3]);return option;
 }));
 if([...skill.options].some(option=>option.value===previous))skill.value=previous;
 showClip();
}
function showClip(){
 const clip=selectedClip(group.value,skill.value,language.value);
 $('#video-title').textContent=clip.title;
 $('#video-range').textContent=time(clip.duration)+' · Original video '+time(clip.start)+'–'+time(clip.end);
 $('#video-source').href=clipSourceUrl(clip);
 player.title='HRD Korea: '+clip.title+' ('+(language.value==='tl'?'Tagalog / Philippines':'English / Global')+')';
 status.textContent='Loading selected skill. Press Play when the player is ready.';
 player.src=clipEmbedUrl(clip,location.origin);
}
player.addEventListener('load',()=>{status.textContent='Press Play to watch this skill. If the player shows an error, use “Open original video.”';});
player.addEventListener('error',()=>{status.textContent='The video could not load. Use “Open original video” to watch the selected skill.';});
group.replaceChildren(...Object.entries(videoGroups).map(([value,data])=>{const option=document.createElement('option');option.value=value;option.textContent=data.label;return option;}));
language.addEventListener('change',renderSkills);group.addEventListener('change',renderSkills);skill.addEventListener('change',showClip);$('#replay-skill').addEventListener('click',showClip);
const fullscreen=$('#video-fullscreen'),exit=$('#video-fullscreen-inside');
if(!frame.requestFullscreen){fullscreen.hidden=true;}else fullscreen.addEventListener('click',async()=>{
 try{await frame.requestFullscreen();}catch{status.textContent='Fullscreen is unavailable in this browser. You can continue watching here.';}
});
exit.addEventListener('click',()=>document.exitFullscreen().catch(()=>{}));
document.addEventListener('fullscreenchange',()=>{fullscreen.disabled=document.fullscreenElement===frame;});
renderSkills();
