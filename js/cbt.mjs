import {assembleExam,selectExam,leaveQuestion,questionStatus,validateBank,createAttempt,restoreAttempt,questionsFor,advanceTime,finishSection,answerQuestion,scoreAttempt,formatTime} from './cbt-core.mjs';
const app=document.querySelector('#app');
const notice=document.querySelector('#notice');
const dialog=document.querySelector('#confirm-dialog');
const UBT=document.body.dataset.examInterface==='ubt';
const KEY=UBT?'jcan-eps-ubt-v1':'jcan-eps-cbt-v1';
const HISTORY_KEY='jcan-eps-cbt-history-v1';
let template,pool,history={};
let bank,state=null,interval=null,media=null,audioToken=0,audioBlocked=false,audioMessage='',audioDelay=null,volume=0.8,lastSaved=0,pendingConfirm=null,storageAvailable=true;
const $=s=>document.querySelector(s);
function el(tag,attrs={},...children){
  const n=document.createElement(tag);
  for(const [k,v] of Object.entries(attrs)){
    if(k==='class')n.className=v;
    else if(k.startsWith('on'))n.addEventListener(k.slice(2),v);
    else if(k.startsWith('aria-')&&v!==null&&v!==undefined)n.setAttribute(k,String(v));
    else if(v!==false&&v!==null&&v!==undefined)n.setAttribute(k,v===true?'':String(v));
  }
  for(const c of children.flat(Infinity))if(c!==null&&c!==undefined)n.append(c instanceof Node?c:document.createTextNode(String(c)));
  return n;
}
function say(message){notice.textContent=message;}
function save(){
  if(!state)return;
  try{localStorage.setItem(KEY,JSON.stringify(state));lastSaved=Date.now();}
  catch{storageAvailable=false;say('Progress cannot be saved in this browser. Keep this tab open until you finish.');}
}
function stopAudio(){
  audioToken++;clearTimeout(audioDelay);audioDelay=null;
  if(media){media.pause();media.removeAttribute('src');media.load();media=null;}
}
function stopWork(){clearInterval(interval);interval=null;stopAudio();}
function confirmAction(title,message,label,fn){
  $('#confirm-title').textContent=title;$('#confirm-message').textContent=message;$('#accept-confirm').textContent=label;pendingConfirm=fn;dialog.showModal();
}
$('#cancel-confirm').addEventListener('click',()=>{pendingConfirm=null;dialog.close();});
$('#accept-confirm').addEventListener('click',()=>{dialog.close();const fn=pendingConfirm;pendingConfirm=null;fn?.();});
function modeLabel(mode){return mode==='full'?'Full mock exam':mode==='reading'?'Reading practice':'Listening practice';}
function renderSetup(){
  document.body.classList.remove('exam-active','sheet-open');
  stopWork();app.replaceChildren();
  if(state&&state.stage!=='complete'){
    app.append(el('section',{class:'panel resume'},el('p',{},el('strong',{},'You have an unfinished test. '),modeLabel(state.mode)+'. The timer continues while you are away.'),el('button',{onclick:resume},'Resume test')));
  }
  const form=el('form',{},el('h2',{},'Prepare for your test'));
  const mode=el('select',{id:'mode',name:'mode'},el('option',{value:'full'},'Full mock exam · 40 questions · 50 min'),el('option',{value:'reading'},'Reading practice · 20 questions · 25 min'),el('option',{value:'listening'},'Listening practice · 20 questions · 25 min'));
  const name=el('input',{id:'candidate-name',name:'name',maxlength:80,autocomplete:'off',placeholder:'Optional'});
  const seat=el('input',{id:'seat',name:'seat',maxlength:20,autocomplete:'off',placeholder:'Optional'});
  form.append(el('div',{class:'form-grid'},el('label',{class:'field wide',for:'mode'},'Test mode',mode),el('label',{class:'field',for:'candidate-name'},'Name or nickname',name),el('label',{class:'field',for:'seat'},'Seat number',seat)));
  let played=false;
  const heard=el('input',{type:'checkbox',id:'heard'});
  const soundStatus=el('p',{id:'sound-status',role:'status'},'Check your headphones before starting.');
  const soundButton=el('button',{type:'button',class:'secondary',onclick:()=>{
    if(media&&!media.paused){stopAudio();soundButton.textContent='Play sound check';return;}
    stopAudio();media=new Audio(bank.sequence[0].src);media.volume=volume;
    media.addEventListener('playing',()=>{played=true;soundStatus.textContent='Korean introduction is playing. Confirm below if you can hear it.';soundButton.textContent='Stop sound check';},{once:true});
    media.addEventListener('ended',()=>soundButton.textContent='Play sound check');
    media.play().catch(()=>{soundStatus.textContent='Audio could not play. Check your connection and try again.';soundStatus.classList.add('error');});
  }},'Play sound check');
  const soundCheck=el('section',{class:'soundcheck'},soundButton,soundStatus,el('label',{class:'check-label',for:'heard'},heard,'I can hear the Korean audio clearly.'));
  mode.addEventListener('change',()=>{soundCheck.hidden=mode.value==='reading';stopAudio();soundButton.textContent='Play sound check';});
  form.append(soundCheck,el('button',{type:'submit',class:'full-width'},'Start test'),el('p',{class:'source-note'},'Your nickname, answers and timer stay in this browser. No registration is required.'));
  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(mode.value!=='reading'&&(!played||!heard.checked)){soundStatus.textContent='Play the sound check and confirm you can hear it before starting.';heard.focus();return;}
    const start=()=>{
      try{
        bank=selectExam(template,pool,history);
        state=createAttempt(bank,mode.value,{name:name.value.trim(),seat:seat.value.trim()});
        const used=questionsFor(bank,mode.value).map(q=>q.id);
        history={previous:used,counts:{...history.counts}};
        for(const id of used)history.counts[id]=(Number(history.counts[id])||0)+1;
        try{localStorage.setItem(HISTORY_KEY,JSON.stringify(history));}catch{}
        say('');save();resume();
      }catch(error){say(error.message);}
    };
    if(state&&state.stage!=='complete')confirmAction('Start a new test?','This replaces the unfinished test saved in this browser.','Start new test',start);else start();
  });
  const intro=el('section',{},el('p',{class:'eyebrow'},UBT?'EPS-TOPIK · UBT tablet practice':'EPS-TOPIK · Computer-based practice'),el('h1',{},'Get ready for your Korean language test.'),el('p',{class:'lead'},'Practice with Korean questions, picture choices and recorded listening in a focused exam workspace.'),el('div',{class:'facts'},el('div',{},el('strong',{},'40'),el('span',{},'Questions')),el('div',{},el('strong',{},'50'),el('span',{},'Minutes')),el('div',{},el('strong',{},'2'),el('span',{},'Sections'))),el('ol',{class:'steps'},el('li',{},'Reading: 20 questions in 25 minutes.'),el('li',{},'Listening: 20 questions in 25 minutes.'),el('li',{},'In the full exam, recordings play in sequence, twice per question.'),el('li',{},'Review your answers and results after submitting.')));
  intro.append(el('p',{class:'source-note'},'© HRD Korea, ',el('a',{href:'https://epstopik.hrdkorea.or.kr/epstopik/book/std/standardBookList.do?lang=en',target:'_blank',rel:'noopener'},'2024 NEW Standard Korean Textbook 2'),'. EPS TOPIK Korea Standard Textbook. Source pages and answer keys are credited in answer review.'));
  app.append(el('div',{class:'intro-grid'},intro,el('section',{class:'panel'},form)));
}
function resume(){
  stopWork();advanceTime(state,bank);save();
  if(state.stage==='complete'){renderResults();return;}
  audioMessage='';audioBlocked=false;renderExam();
  interval=setInterval(tick,250);
  if(state.stage==='listening'&&state.mode==='full')playSequence();
  $('#main').focus();
}
function tick(){
  if(!interval||!state||state.stage==='complete')return;
  if(advanceTime(state,bank)){
    save();stopAudio();if(dialog.open){dialog.close();pendingConfirm=null;}
    if(state.stage==='complete'){renderResults();return;}
    say('Reading time has ended. The listening section has started.');renderExam();playSequence();
  }
  renderTimers();
  if(Date.now()-lastSaved>5000)save();
}
function finish(){
  if(!state||state.stage==='complete')return;
  const count=bank.questions.filter(q=>q.section===state.stage&&state.answers[q.id]===undefined).length;
  const transitioning=state.stage==='reading'&&state.mode==='full';
  confirmAction(transitioning?'Finish reading?':'Submit your test?',`${count} unanswered question${count===1?'':'s'} in this section. `+(transitioning?'Reading answers will be locked and the 25-minute listening section will begin.':'Your answers will be scored and the test will end.'),transitioning?'Start listening':'Submit test',()=>{
    stopAudio();finishSection(state,bank);save();
    if(state.stage==='complete')renderResults();else{audioMessage='';renderExam();playSequence();}
  });
}
function renderExam(){
  document.body.classList.add('exam-active');
  const heading=el('div',{class:'exam-heading'},el('div',{},el('h1',{},modeLabel(state.mode)),el('p',{},(state.candidate.name||'Practice candidate')+(state.candidate.seat?' · Seat '+state.candidate.seat:'')+' · '+bank.title)),el('button',{class:'secondary',onclick:()=>{
    if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});else document.documentElement.requestFullscreen?.().catch(()=>say('Full screen is unavailable in this browser. You can continue normally.'));
  }},'Full screen'));
  app.replaceChildren(heading,el('div',{class:'exam-layout'},el('section',{class:'panel question-panel','aria-label':'Current question',id:'question-panel'}),el('aside',{class:'sidebar','aria-label':'Exam progress'},el('div',{class:'panel'},el('div',{class:'timers',id:'timers'}),el('h2',{style:'font-size:18px'},'Answer sheet'),el('p',{id:'answered-count',class:'empty-note'}),el('div',{id:'answer-sheet'}),el('p',{class:'legend'},'Blue = answered · Red border = skipped · Orange border / ! = review · Outer outline = current'),el('button',{class:'full-width',onclick:finish},state.stage==='reading'&&state.mode==='full'?'Finish reading':'Submit test')))));
  if(UBT){
    const sidebar=$('.sidebar');sidebar.id='ubt-answer-sheet';
    heading.append($('#timers'));
    heading.append(el('button',{class:'secondary sheet-toggle','aria-expanded':'true','aria-controls':sidebar.id,onclick:()=>showSheet(!document.body.classList.contains('sheet-open'))},'Return to question'));
    showSheet(state.stage!=='listening');
  }
  renderTimers();renderQuestion();renderGrid();
}
function showSheet(open){
  if(!UBT)return;
  document.body.classList.toggle('sheet-open',open);
  const sidebar=$('.sidebar'),panel=$('#question-panel'),toggle=$('.sheet-toggle');
  if(sidebar)sidebar.hidden=!open;
  if(panel)panel.hidden=open;
  if(!open&&panel?.querySelector('.choices'))(state.visited ||= {})[bank.questions[state.current-1].id]=true;
  if(toggle){toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Return to question':'Total Questions';}
}
function renderTimers(){
  const node=$('#timers');if(!node)return;
  if(UBT){const all=questionsFor(bank,state.mode),solved=all.filter(q=>state.answers[q.id]!==undefined).length;node.replaceChildren(el('strong',{},'Total Questions: '+all.length),el('strong',{},'Solved: '+solved),el('strong',{},'Unsolved: '+(all.length-solved)),el('strong',{'aria-label':state.stage+' time remaining'},(state.stage==='reading'?'Reading':'Listening')+' Time: '+formatTime(state.deadline-Date.now())));return;}
  node.replaceChildren(...['reading','listening'].filter(s=>state.mode==='full'||s===state.mode).map(s=>{
    const active=state.stage===s;
    const remaining=active?state.deadline-Date.now():s==='reading'?0:1500000;
    return el('div',{class:'timer-box'+(active?' active':'')+(active&&remaining<300000?' urgent':'')},el('small',{},s==='reading'?'READING · 읽기':'LISTENING · 듣기'),el('strong',{'aria-label':s+' time remaining'},formatTime(remaining)));
  }));
}
function renderGrid(){
  const host=$('#answer-sheet');if(!host)return;
  host.replaceChildren();
  const all=questionsFor(bank,state.mode);
  $('#answered-count').textContent=all.filter(q=>state.answers[q.id]!==undefined).length+' of '+all.length+' answered';
  for(const section of ['reading','listening']){
    const qs=all.filter(q=>q.section===section);if(!qs.length)continue;
    host.append(el('p',{class:'grid-title'},section==='reading'?'Reading 1–20':'Listening 21–40'),el('div',{class:'answer-grid'},qs.map(q=>{
      const {answered,skipped,flagged}=questionStatus(state,q);
      return el('button',{type:'button',class:(answered?'answered ':'')+(state.current===q.number?'current ':'')+(skipped?'skipped ':'')+(flagged?'flagged':''),'aria-label':'Question '+q.number+(answered?', answered':', unanswered')+(skipped?', skipped':'')+(flagged?', marked for review':''),'aria-current':state.current===q.number?'true':null,disabled:q.section!==state.stage||(state.stage==='listening'&&state.mode==='full'),onclick:()=>go(q.number)},q.number);
    })));
  }
  if(UBT){const nodes=[...host.children];for(let i=0;i<nodes.length;i+=2)host.append(el('section',{class:'ubt-section'},nodes[i],nodes[i+1]));renderTimers();}
}
function image(src,alt){return el('img',{src,alt,loading:'eager',onerror:e=>{e.target.alt='Image unavailable. Check your connection and reload.';say('A question image did not load. Reload to recover your saved test.');}});}
function questionContent(q){
  return [el('h2',{class:'instruction korean',lang:'ko'},q.instruction),q.prompt?el('p',{class:'prompt korean',lang:'ko'},q.prompt):null,q.images.length?el('div',{class:'question-images'},q.images.map((src,i)=>image(src,'Question '+q.number+' illustration '+(i+1)))):null];
}
function go(number){
  const q=bank.questions.find(q=>q.number===number);if(!q||q.section!==state.stage)return;
  if(state.mode!=='full'||state.stage!=='listening')stopAudio();
  leaveQuestion(state,bank);state.current=number;showSheet(false);save();renderQuestion();renderGrid();
  $('#question-title')?.focus();
}
function renderQuestion(){
  const host=$('#question-panel');if(!host)return;
  const q=bank.questions[state.current-1];
  const auto=state.mode==='full'&&state.stage==='listening';
  const step=auto?bank.sequence[state.sequenceIndex]:null;
  const flag=el('button',{class:'secondary flag-button','aria-pressed':Boolean(state.flags[q.id]),onclick:()=>{state.flags[q.id]=!state.flags[q.id];save();renderQuestion();renderGrid();}},state.flags[q.id]?'Marked for review':'Mark for review');
  host.replaceChildren(el('div',{class:'question-meta'},el('span',{class:'question-count',id:'question-title',tabindex:-1},'Question '+q.number+' / 40'),flag));
  if(auto&&step?.exampleImage){host.append(el('h2',{class:'instruction'},'Listening example'),el('p',{class:'empty-note'},'Listen to the example. Your next question will appear automatically.'),el('div',{class:'question-images'},image(step.exampleImage,'Listening example')));}
  else{
    if(!UBT||!host.hidden)(state.visited ||= {})[q.id]=true;
    host.append(...questionContent(q).filter(Boolean));
    const choices=el('fieldset',{class:'choices'+(q.choices.some(c=>c.images.length)?' image-options':''),lang:'ko'},el('legend',{class:'visually-hidden'},'Choose one answer for question '+q.number));
    q.choices.forEach((c,i)=>{
      const input=el('input',{type:'radio',name:'answer',value:i,'aria-label':'Option '+(i+1)+(c.text?': '+c.text:''),checked:state.answers[q.id]===i,onchange:()=>{tick();if(answerQuestion(state,bank,q.number,i)){save();renderGrid();}}});
      choices.append(el('label',{class:'choice'},input,el('span',{class:'choice-number','aria-hidden':'true'},['①','②','③','④'][i]),c.text?el('span',{class:'choice-text korean'},c.text):null,c.images.length?el('span',{class:'choice-images'},c.images.map(src=>image(src,'Option '+(i+1)+' illustration'))):null));
    });host.append(choices);
  }
  if(state.stage==='listening'){
    const status=el('p',{class:'audio-status',id:'audio-status',role:'status'},auto?(audioMessage||'Listening will start automatically.'):'Play the question recording. You can replay it during practice.');
    const play=el('button',{class:'secondary',id:'audio-action',onclick:()=>{
      if(auto)playSequence();else playPractice(q);
    }},auto?'Continue audio':'Play recording');
    play.hidden=auto&&!audioBlocked;
    const slider=el('input',{type:'range',min:0,max:1,step:.05,value:volume,'aria-label':'Audio volume',oninput:e=>{volume=Number(e.target.value);if(media)media.volume=volume;}});
    host.append(el('div',{class:'audio-panel'},el('div',{class:'audio-row'},play,el('label',{},'Volume',slider)),status,auto?el('p',{},'Recordings play in sequence. Each question is played twice. The section timer keeps running.'):null));
  }
  if(!auto){
    const first=state.stage==='reading'?1:21,last=state.stage==='reading'?20:40;
    host.append(el('div',{class:'question-nav'},el('button',{class:'secondary',disabled:q.number===first,onclick:()=>go(q.number-1)},'Previous'),el('button',{onclick:()=>q.number===last?finish():go(q.number+1)},q.number===last?'Finish section':'Next question')));
  }
  if(UBT){
    const stimulus=el('div',{class:'ubt-stimulus'});
    for(const node of [...host.children])if(node.matches('.instruction,.prompt,.question-images'))stimulus.append(node);
    const options=host.querySelector('.choices');
    if(stimulus.children.length)host.insertBefore(el('div',{class:'ubt-question-columns'},stimulus,options||el('div',{})),host.children[1]||null);
    const nav=host.querySelector('.question-nav')||el('div',{class:'question-nav'});
    const overview=el('button',{class:'ubt-overview',onclick:()=>showSheet(true)},'▦ Total Questions');
    nav.insertBefore(overview,nav.children[1]||null);
    if(!nav.parentElement)host.append(nav);
  }
}
function updateAudioStatus(message,blocked=false){
  audioMessage=message;audioBlocked=blocked;
  if($('#audio-status'))$('#audio-status').textContent=message;
  if($('#audio-action')&&state?.mode==='full')$('#audio-action').hidden=!blocked;
}
function playPractice(q){
  stopAudio();const token=audioToken;media=new Audio(q.audio);media.volume=volume;
  updateAudioStatus('Loading recording…');
  media.addEventListener('playing',()=>{if(token===audioToken)updateAudioStatus('Playing question '+q.number+'.');});
  media.addEventListener('ended',()=>{if(token===audioToken)updateAudioStatus('Recording finished. Play again if you need to.');});
  media.addEventListener('error',()=>{if(token===audioToken)updateAudioStatus('Recording could not load. Check your connection and try again.',true);});
  media.play().catch(()=>{if(token===audioToken)updateAudioStatus('Playback was blocked. Select Play recording to try again.',true);});
}
function playSequence(){
  if(!state||state.stage!=='listening'||state.mode!=='full')return;
  stopAudio();const token=audioToken;
  while(bank.sequence[state.sequenceIndex]?.question){
    leaveQuestion(state,bank);state.current=bank.sequence[state.sequenceIndex].question;state.sequenceIndex++;state.audioOffset=0;
  }
  const step=bank.sequence[state.sequenceIndex];
  if(!step){updateAudioStatus('All recordings have finished. Submit your test when you are ready.');save();renderQuestion();return;}
  renderQuestion();renderGrid();updateAudioStatus('Loading: '+step.label);
  media=new Audio(step.src);media.volume=volume;
  media.addEventListener('loadedmetadata',()=>{if(token===audioToken&&state.audioOffset>0)media.currentTime=Math.min(state.audioOffset,Math.max(0,media.duration-.1));});
  media.addEventListener('playing',()=>{if(token===audioToken)updateAudioStatus(step.label+' · playing');});
  media.addEventListener('timeupdate',()=>{if(token===audioToken&&media)state.audioOffset=media.currentTime;});
  media.addEventListener('ended',()=>{
    if(token!==audioToken||state.stage!=='listening')return;
    state.sequenceIndex++;state.audioOffset=0;save();updateAudioStatus('Next recording in 2 seconds…');
    audioDelay=setTimeout(playSequence,2000);
  });
  media.addEventListener('error',()=>{if(token===audioToken)updateAudioStatus('Recording could not load. Check your connection, then continue audio.',true);});
  media.play().catch(()=>{if(token===audioToken)updateAudioStatus('Select Continue audio to start listening. The section timer is running.',true);});
}
function renderResults(){
  document.body.classList.remove('exam-active','sheet-open');
  stopWork();save();
  const result=scoreAttempt(state,bank);
  const top=el('section',{class:'panel'},el('p',{class:'eyebrow'},'Test complete'),el('h1',{},'Your practice results'),el('p',{class:'lead'},modeLabel(state.mode)+' · '+(state.candidate.name||'Practice candidate')),el('div',{class:'summary-stats'},el('div',{},el('strong',{},result.points+' / '+result.maxPoints),el('span',{},'Practice score')),el('div',{},el('strong',{},result.correct),el('span',{},'Correct')),el('div',{},el('strong',{},result.incorrect),el('span',{},'Incorrect')),el('div',{},el('strong',{},result.unanswered),el('span',{},'Unanswered'))),el('p',{},result.percent+'% accuracy. Each correct answer earns 2.5 points. This practice score is not an official qualification result.'),el('div',{class:'actions'},el('button',{onclick:()=>{state=null;try{localStorage.removeItem(KEY);}catch{}say('');renderSetup();$('#main').focus();}},'Take another test'),el('button',{class:'secondary',onclick:downloadResults},'Download results'),el('a',{class:'button secondary',href:'exams.html'},'Back to exams')));
  for(const section of ['reading','listening']){const items=result.items.filter(x=>x.question.section===section);if(items.length)top.append(el('p',{class:'empty-note'},(section==='reading'?'Reading':'Listening')+': '+items.filter(x=>x.correct).length+' / '+items.length+' correct'));}
  const filter=el('select',{'aria-label':'Filter answer review'},el('option',{value:'all'},'All questions'),el('option',{value:'missed'},'Incorrect and unanswered'),el('option',{value:'flagged'},'Marked for review'));
  const review=el('div',{id:'review-list'});
  const fill=()=>{
    review.replaceChildren();
    const items=result.items.filter(x=>filter.value==='missed'?!x.correct:filter.value==='flagged'?state.flags[x.question.id]:true);
    if(!items.length)review.append(el('p',{},'No questions match this filter.'));
    items.forEach(({question:q,answer,correct})=>{
      const label=correct?'Correct':answer===undefined?'Unanswered':'Incorrect';
      const body=el('div',{class:'review-body'},...questionContent(q).filter(Boolean));
      if(q.provenance)body.append(el('p',{class:'source-note'},el('a',{href:q.provenance.url,target:'_blank',rel:'noopener'},'HRD Korea · 2024 NEW Standard Korean Textbook 2'),` · Unit ${q.provenance.unit}, page ${q.provenance.page}, question ${q.provenance.item}. Answer key: page ${q.provenance.answerPage}.`));
      if(q.audio)body.append(el('audio',{controls:true,preload:'none',src:q.audio,'aria-label':'Question '+q.number+' recording'}));
      q.choices.forEach((c,i)=>body.append(el('div',{class:'review-choice'+(i===q.answer?' correct':i===answer?' wrong':'')},el('strong',{},['①','②','③','④'][i]+' '+c.text),c.images.map(src=>image(src,'Option '+(i+1)+' illustration')),i===q.answer?el('p',{class:'correct-label'},'Correct answer'+(i===answer?' · Your answer':'')):i===answer?el('p',{class:'wrong-label'},'Your answer'):null)));
      review.append(el('details',{class:'review-item'},el('summary',{},el('strong',{},'Question '+q.number),el('span',{class:correct?'correct-label':'wrong-label'},label)),body));
    });
    review.querySelectorAll('audio').forEach(a=>a.addEventListener('play',()=>review.querySelectorAll('audio').forEach(other=>{if(other!==a)other.pause();})));
  };
  filter.addEventListener('change',fill);
  app.replaceChildren(top,el('div',{class:'filter-row'},el('h2',{},'Review your answers'),filter),review);fill();$('#main').focus();
}
function downloadResults(){
  const score=scoreAttempt(state,bank);
  const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const candidate=state.candidate.name||'Practice candidate';
  const date=new Date(state.completedAt||Date.now());
  const rows=score.items.map(item=>{
    const q=item.question, selected=item.answer===undefined?'—':String.fromCharCode(65+item.answer);
    const answer=item.answer===undefined?'No answer':q.choices[item.answer]?.text||('Option '+selected);
    const correct=String.fromCharCode(65+q.answer), correctText=q.choices[q.answer]?.text||('Option '+correct);
    const status=item.answer===undefined?'Unanswered':item.correct?'Correct':'Incorrect';
    const cls=item.answer===undefined?'empty':item.correct?'good':'bad';
    return '<tr><td>'+q.number+'</td><td>'+escapeHTML(q.section==='reading'?'Reading':'Listening')+'</td><td>'+escapeHTML(answer)+'</td><td>'+escapeHTML(correctText)+'</td><td class="'+cls+'">'+status+'</td></tr>';
  }).join('');
  const title=escapeHTML(bank.title||'EPS-TOPIK practice exam');
  const html=[
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>JCAN EPS-TOPIK Practice Results</title><style>',
    ':root{--ink:#1e2c45;--muted:#607087;--blue:#31599b;--line:#dce3ed;--wash:#f3f6fa}*{box-sizing:border-box}body{margin:0;background:#eef2f7;color:var(--ink);font:15px/1.5 "Segoe UI",Arial,sans-serif}.sheet{max-width:900px;margin:40px auto;padding:44px;background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 12px 38px #20365a13}',
    'header{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid var(--ink);padding-bottom:24px}.brand{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--blue);font-weight:800}.brand b{display:block;margin-top:5px;color:var(--ink);font-size:22px;letter-spacing:0;text-transform:none}.date{text-align:right;color:var(--muted);font-size:13px}h1{font-size:30px;line-height:1.15;margin:28px 0 5px}.sub{color:var(--muted);margin:0}',
    '.score{margin:24px 0;padding:24px;border-radius:12px;background:linear-gradient(120deg,#203d70,#3e69ac);color:white;display:flex;justify-content:space-between;gap:18px}.score small{display:block;opacity:.84}.score strong{font-size:40px;line-height:1.2}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0 30px}.stats div{padding:14px;background:var(--wash);border:1px solid var(--line);border-radius:9px}.stats strong{display:block;font-size:23px}.stats span{font-size:12px;color:var(--muted)}',
    'h2{font-size:19px;margin:30px 0 12px}table{width:100%;border-collapse:collapse;font-size:13px}th{text-align:left;background:#eef3f9;color:#344b6d;font-size:11px;letter-spacing:.05em;text-transform:uppercase}th,td{padding:10px 11px;border-bottom:1px solid var(--line);vertical-align:top}td:first-child{font-weight:700}.good{color:#226344;font-weight:700}.bad{color:#a3372b;font-weight:700}.empty{color:#7b5a19;font-weight:700}',
    'footer{margin-top:25px;padding-top:15px;border-top:1px solid var(--line);color:var(--muted);font-size:11px;display:flex;justify-content:space-between;gap:16px}.actions{position:fixed;right:22px;top:18px}.actions button{border:0;border-radius:8px;background:var(--blue);color:white;padding:11px 16px;font-weight:700;cursor:pointer}',
    '@media(max-width:650px){.sheet{margin:0;padding:24px 16px;border:0;border-radius:0}.stats{grid-template-columns:repeat(2,1fr)}.score strong{font-size:32px}table{font-size:11px}th,td{padding:8px 5px}.scroll{overflow-x:auto}}@media print{body{background:#fff;font-size:11px}.sheet{max-width:none;margin:0;padding:10mm;border:0;border-radius:0;box-shadow:none}.actions{display:none}.score,th,.stats div{print-color-adjust:exact;-webkit-print-color-adjust:exact}tr{break-inside:avoid}h2{break-after:avoid}footer{position:fixed;bottom:5mm;left:10mm;right:10mm}}',
    '</style></head><body><div class="actions"><button onclick="window.print()">Print / Save as PDF</button></div><main class="sheet">',
    '<header><div class="brand">JCAN Korean Language Center<b>EPS-TOPIK Practice Results</b></div><div class="date">Completed<br><strong>'+escapeHTML(date.toLocaleString())+'</strong></div></header>',
    '<h1>'+escapeHTML(candidate)+'</h1><p class="sub">'+title+' · '+escapeHTML(modeLabel(state.mode))+'</p>',
    '<section class="score"><div><small>Practice score</small><strong>'+score.points+' <span style="font-size:22px;font-weight:500">/ '+score.maxPoints+'</span></strong></div><div style="text-align:right"><small>Accuracy</small><strong>'+score.percent+'%</strong></div></section>',
    '<section class="stats"><div><strong>'+score.correct+'</strong><span>Correct</span></div><div><strong>'+score.incorrect+'</strong><span>Incorrect</span></div><div><strong>'+score.unanswered+'</strong><span>Unanswered</span></div><div><strong>'+score.total+'</strong><span>Total questions</span></div></section>',
    '<h2>Answer review</h2><div class="scroll"><table><thead><tr><th>No.</th><th>Section</th><th>Your answer</th><th>Correct answer</th><th>Result</th></tr></thead><tbody>'+rows+'</tbody></table></div>',
    '<footer><span>Practice material for preparation; not an official HRD Korea examination.</span><span>Each correct answer earns 2.5 practice points.</span></footer></main></body></html>'
  ].join('');
  const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
  const a=el('a',{href:url,download:'jcan-eps-topik-results.html'});a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
window.addEventListener('pagehide',()=>{save();stopAudio();});
window.addEventListener('pageshow',e=>{if(e.persisted&&state&&state.stage!=='complete')resume();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();else tick();});
async function init(){
  try{
    const [res,poolRes]=await Promise.all([fetch('data/eps-topik.json'),fetch('data/eps-topik-pool.json')]);
    if(!res.ok||!poolRes.ok)throw Error('Question bank download failed.');
    template=validateBank(await res.json());pool=await poolRes.json();bank=template;
    try{
      const raw=localStorage.getItem(KEY);
      const saved=raw?JSON.parse(raw):null;
      if(saved?.selection&&saved.bankId!==template.id)bank=assembleExam(template,pool,saved.selection);
      state=restoreAttempt(raw,bank);
      history=JSON.parse(localStorage.getItem(HISTORY_KEY)||'{}')||{};
      if(!history.previous&&state)history.previous=questionsFor(bank,state.mode).map(q=>q.id);
    }catch{state=null;bank=template;history={};}
    if(!storageAvailable)say('Browser storage is unavailable. Keep this tab open while taking the test.');
    if(state?.stage==='complete')renderResults();else renderSetup();
  }catch(error){app.replaceChildren(el('section',{class:'panel'},el('h1',{},'Exam materials could not load'),el('p',{},'Check your connection and reload. If this page is opened from a file, serve the website over HTTP.'),el('p',{class:'error'},error.message),el('button',{onclick:()=>location.reload()},'Reload')));}
}
init();
