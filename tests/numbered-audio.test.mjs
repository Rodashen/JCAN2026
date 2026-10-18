import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {attachNumberAnnouncement} from '../js/numbered-audio.mjs';
import {selectExam} from '../js/cbt-core.mjs';
const read=async name=>JSON.parse(await fs.readFile(new URL('../data/'+name,import.meta.url)));
class AudioStub extends EventTarget{
 constructor(src='question.mp3'){super();this.src=src;this.currentTime=0;this.volume=.8;this.calls=0;this.paused=true;}
 play(){this.calls++;this.paused=false;this.dispatchEvent(new Event('play'));return Promise.resolve();}
 pause(){this.paused=true;}
}
test('manual playback announces the assigned number before the question, and resumes without repeating the number',async()=>{
 const player=new AudioStub();let active=null;
 const dispose=attachNumberAnnouncement(player,'exam-number-22.mp3',{AudioClass:AudioStub,onActive:a=>{active?.pause();active=a;},isActive:a=>a===active,onStatus:()=>{}});
 assert.equal(active,null);assert.equal(player.calls,0);
 await player.play();assert.equal(active.src,'exam-number-22.mp3');assert.equal(player.paused,true);
 active.dispatchEvent(new Event('ended'));assert.equal(active,player);assert.equal(player.calls,2);
 player.currentTime=5;player.pause();await player.play();assert.equal(active,player);assert.equal(player.calls,3);
 dispose();
});
test('stopping or changing to a choice prevents a late announcement from starting the question',async()=>{
 const player=new AudioStub();let active=null;
 const dispose=attachNumberAnnouncement(player,'exam-number-22.mp3',{AudioClass:AudioStub,onActive:a=>{active=a;},isActive:a=>a===active,onStatus:()=>{}});
 await player.play();const intro=active;active=new AudioStub('choice.mp3');intro.dispatchEvent(new Event('ended'));assert.equal(player.calls,1);
 await player.play();const nextIntro=active;dispose();nextIntro.dispatchEvent(new Event('ended'));assert.equal(player.calls,2);
});
test('assigned exam slots use the matching existing EPS number announcement, with textbook numbers removed',async()=>{
 const [template,pool,manifest]=await Promise.all(['eps-topik.json','eps-topik-pool.json','eps-topik-media.json'].map(read));
 const exam=selectExam(template,pool);
 for(const q of exam.questions.slice(20)){
  assert.equal(q.textbookNumberRemoved,true);
  assert.ok(q.provenance.audioClip.numberRemovedSeconds>0&&q.provenance.audioClip.numberRemovedSeconds<20);
  assert.equal(q.provenance.audioClip.directionsRemoved,true);
  assert.equal(q.numberAudioSource,template.sequence.find(s=>s.label==='Question '+q.number).src);
  assert.equal(q.numberAudio,'media/eps-topik/exam-number-'+q.number+'.mp3');
  assert.match(manifest.find(m=>m.path===q.numberAudio).source,new RegExp('/'+q.number+'\\.mp3$'));
 }
});
