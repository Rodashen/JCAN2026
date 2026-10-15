// Announce the assigned exam number only after the student presses Play.
export function attachNumberAnnouncement(player,numberSrc,{AudioClass=globalThis.Audio,onActive,isActive,onStatus}){
  let disposed=false,serial=0,intro=null,continueQuestion=false;
  const play=()=>{
    if(disposed)return;
    if(continueQuestion||player.currentTime>.15){continueQuestion=false;onActive(player);return;}
    player.pause();const token=++serial;
    if(intro)intro.pause();
    intro=new AudioClass(numberSrc);intro.volume=player.volume;
    const announcement=intro;onActive(announcement);onStatus('Playing exam question number…');
    announcement.addEventListener('ended',()=>{
      if(disposed||token!==serial||!isActive(announcement))return;
      continueQuestion=true;onStatus('Playing question recording.');
      player.play().catch(()=>{continueQuestion=true;onStatus('Press Play to continue the question recording.');});
    },{once:true});
    const failed=()=>{if(!disposed&&token===serial&&isActive(announcement))onStatus('The number announcement could not play. Press Play to retry.');};
    announcement.addEventListener('error',failed,{once:true});
    announcement.play().catch(failed);
  };
  player.addEventListener('play',play);
  return ()=>{disposed=true;serial++;intro?.pause();player.removeEventListener('play',play);};
}
