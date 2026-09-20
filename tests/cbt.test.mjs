import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {validateBank,createAttempt,advanceTime,finishSection,answerQuestion,scoreAttempt,restoreAttempt,formatTime} from '../js/cbt-core.mjs';
const bank=JSON.parse(await fs.readFile(new URL('../data/eps-topik.json',import.meta.url),'utf8'));
test('captured exam has 40 ordered questions and a recording for each listening item',()=>{
  assert.equal(validateBank(bank),bank);
  for(const q of bank.questions.slice(20)){
    const start=bank.sequence.findIndex(s=>s.question===q.number);
    const end=bank.sequence.findIndex((s,i)=>i>start&&s.question);
    const sequence=bank.sequence.slice(start,end===-1?undefined:end);
    assert.equal(sequence.filter(s=>s.src===q.audio).length,2,'Question '+q.number+' must be played twice');
  }
});
test('all referenced media exists and matches its source manifest',async()=>{
  const manifest=JSON.parse(await fs.readFile(new URL('../data/eps-topik-media.json',import.meta.url),'utf8'));
  const paths=new Set(manifest.map(x=>x.path));
  for(const q of bank.questions){for(const src of [...q.images,...q.choices.flatMap(c=>c.images),...(q.audio?[q.audio]:[])])assert.ok(paths.has(src));}
  for(const step of bank.sequence)if(step.src)assert.ok(paths.has(step.src));
  await Promise.all(manifest.map(async entry=>{const bytes=await fs.readFile(new URL('../'+entry.path,import.meta.url));assert.equal(bytes.length,entry.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256);assert.ok(!bytes.subarray(0,100).toString().includes('<!DOCTYPE'));}));
});
test('wall-clock expiration survives inactive tabs and can expire both sections',()=>{
  const a=createAttempt(bank,'full',{},1000);
  assert.equal(advanceTime(a,bank,1500999),false);
  assert.equal(advanceTime(a,bank,1501000),true);assert.equal(a.stage,'listening');assert.equal(a.current,21);assert.equal(a.deadline,3001000);
  advanceTime(a,bank,3001000);assert.equal(a.stage,'complete');
  const b=createAttempt(bank,'full',{},1000);advanceTime(b,bank,4000000);assert.equal(b.stage,'complete');assert.equal(b.completedAt,3001000);
});
test('finishing reading starts a fresh 25-minute listening section and locks reading answers',()=>{
  const a=createAttempt(bank,'full',{},1000);answerQuestion(a,bank,1,bank.questions[0].answer);
  finishSection(a,bank,31000);assert.equal(a.deadline,1531000);assert.equal(a.stage,'listening');
  assert.equal(answerQuestion(a,bank,1,0),false);assert.equal(answerQuestion(a,bank,21,2),true);
  finishSection(a,bank,41000);assert.equal(a.stage,'complete');assert.equal(answerQuestion(a,bank,21,1),false);
});
test('practice sections submit at zero and unanswered is separate from incorrect',()=>{
  const a=createAttempt(bank,'reading',{},0);answerQuestion(a,bank,1,bank.questions[0].answer);answerQuestion(a,bank,2,(bank.questions[1].answer+1)%4);
  advanceTime(a,bank,1500000);const score=scoreAttempt(a,bank);
  assert.equal(a.stage,'complete');assert.deepEqual([score.total,score.correct,score.incorrect,score.unanswered,score.points,score.maxPoints],[20,1,1,18,2.5,50]);
  const b=createAttempt(bank,'listening',{},0);advanceTime(b,bank,1500000);assert.equal(b.stage,'complete');
});
test('saved state recovers answers and audio position and rejects corrupt or foreign data',()=>{
  const a=createAttempt(bank,'listening',{name:'Student'},1000);a.sequenceIndex=4;a.audioOffset=12.5;answerQuestion(a,bank,21,0);
  assert.deepEqual(restoreAttempt(JSON.stringify(a),bank),a);
  assert.equal(restoreAttempt('{bad',bank),null);assert.equal(restoreAttempt(JSON.stringify({...a,bankId:'wrong'}),bank),null);
  assert.equal(restoreAttempt(JSON.stringify({...a,deadline:Infinity}),bank),null);
  assert.equal(restoreAttempt(JSON.stringify({...a,sequenceIndex:9999}),bank),null);
  assert.equal(restoreAttempt(JSON.stringify({...a,answers:{unknown:2}}),bank),null);
});
test('invalid bank URLs and answer keys are rejected',()=>{
  let bad=structuredClone(bank);bad.questions[0].images=['javascript:alert(1)'];assert.throws(()=>validateBank(bad));
  bad=structuredClone(bank);bad.questions[0].answer=4;assert.throws(()=>validateBank(bad));
});
test('remaining time is rounded up and never goes negative',()=>{
  assert.equal(formatTime(1500000),'25:00');assert.equal(formatTime(1001),'00:02');assert.equal(formatTime(-30),'00:00');
});
