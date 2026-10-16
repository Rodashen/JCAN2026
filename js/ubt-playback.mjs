export function ubtAudioKey(questionId,choice=null){return questionId+(choice===null?':question':':choice:'+choice);}
export function ubtPlayCount(state,key){return Number.isInteger(state.ubtPlayback?.[key])?state.ubtPlayback[key]:0;}
// A click spends at most two passes. Counts are saved before playback, so
// interrupted/reloaded attempts cannot restore a pass already started.
export function createUbtPlayback({state,AudioClass=globalThis.Audio,save,onActive,onChange,gapMs=600}){
  let busy=false,currentKey=null,serial=0,audio=null,timer=null,disposed=false;
  const notify=(message='')=>onChange({busy,key:currentKey,message});
  const finish=message=>{busy=false;currentKey=null;notify(message);};
  const play=(key,src,numberSrc=null)=>{
    if(disposed||busy||ubtPlayCount(state,key)>=2)return false;
    busy=true;currentKey=key;const token=++serial;notify('Playing recording twice.');
    const run=(path,isNumber=false)=>{
      if(disposed||token!==serial)return;
      let started=false;
      if(!isNumber){state.ubtPlayback||={};state.ubtPlayback[key]=ubtPlayCount(state,key)+1;save();}
      const clip=new AudioClass(path);audio=clip;onActive(clip);
      clip.addEventListener('playing',()=>{started=true;},{once:true});
      const failed=()=>{
        if(disposed||token!==serial||!busy)return;
        serial++;clip.pause();
        if(!isNumber&&!started){state.ubtPlayback[key]=Math.max(0,ubtPlayCount(state,key)-1);save();}
        finish(ubtPlayCount(state,key)>=2?'Playback ended. This recording is now locked.':'Audio could not play. You can retry the remaining playback.');
      };
      clip.addEventListener('error',failed,{once:true});
      clip.addEventListener('ended',()=>{
        if(disposed||token!==serial)return;
        if(isNumber){run(src);return;}
        if(ubtPlayCount(state,key)<2){notify('Playing the second time…');timer=setTimeout(()=>run(src),gapMs);}
        else finish('Played twice. This recording is now locked.');
      },{once:true});
      clip.play().catch(failed);
    };
    run(numberSrc||src,Boolean(numberSrc));return true;
  };
  const stop=()=>{disposed=true;serial++;clearTimeout(timer);audio?.pause();busy=false;currentKey=null;notify();};
  return {play,stop,get busy(){return busy;}};
}
