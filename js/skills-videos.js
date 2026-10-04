document.querySelectorAll('[data-video-target]').forEach(select=>{
  select.addEventListener('change',()=>{
    const player=document.getElementById(select.dataset.videoTarget);
    player.src=`https://www.youtube-nocookie.com/embed/${select.value}`;
    player.title=`HRD Korea ${select.options[select.selectedIndex].text} (${select.id==='video-english'?'English':'Philippines'})`;
  });
});
