import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {selectExam,assembleExam,validateBank,createAttempt,restoreAttempt,answerQuestion,leaveQuestion,questionStatus} from '../js/cbt-core.mjs';
const read=async name=>JSON.parse(await fs.readFile(new URL('../data/'+name,import.meta.url)));
const bank=await read('eps-topik.json'),pool=await read('eps-topik-pool.json');
let seed=1234567;
const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
test('300 retries have fresh questions, matching recordings and bounded listening duration',()=>{
 const history={counts:{}};
 for(let i=0;i<300;i++){
  const exam=selectExam(bank,pool,history,random),ids=exam.questions.map(q=>q.id);
  assert.equal(new Set(ids).size,40);assert.equal(validateBank(exam),exam);
  assert.ok(ids.every(id=>!history.previous?.includes(id)),'No question from the immediately preceding exam');
  assert.ok(pool.listeningOverheadSeconds+2*exam.questions.slice(20).reduce((n,q)=>n+q.audioSeconds,0)<=1490);
  for(const q of exam.questions.slice(20)){
   const start=exam.sequence.findIndex(s=>s.question===q.number);
   const end=exam.sequence.findIndex((s,j)=>j>start&&s.question);
   assert.equal(exam.sequence.slice(start,end<0?undefined:end).filter(s=>s.src===q.audio).length,2);
  }
  history.previous=ids;for(const id of ids)history.counts[id]=(history.counts[id]||0)+1;
 }
});
test('saved random test reconstructs the exact questions, answer keys and audio sequence',()=>{
 const exam=selectExam(bank,pool,{},random),state=createAttempt(exam,'full');
 answerQuestion(state,exam,1,exam.questions[0].answer);
 const rebuilt=assembleExam(bank,pool,state.selection);
 assert.deepEqual(rebuilt,exam);assert.deepEqual(restoreAttempt(JSON.stringify(state),rebuilt),state);
 assert.throws(()=>assembleExam(bank,pool,Array(40).fill(state.selection[0])));
});
test('skip status begins after leaving an unanswered question; answering clears red status independently of review',()=>{
 const state=createAttempt(bank,'reading'),q=bank.questions[0];
 assert.deepEqual(questionStatus(state,q),{answered:false,skipped:false,flagged:false});
 leaveQuestion(state,bank);assert.equal(questionStatus(state,q).skipped,false);
 state.visited[q.id]=true;leaveQuestion(state,bank);assert.equal(questionStatus(state,q).skipped,true);
 state.flags[q.id]=true;assert.deepEqual(questionStatus(state,q),{answered:false,skipped:true,flagged:true});
 answerQuestion(state,bank,1,q.answer);assert.deepEqual(questionStatus(state,q),{answered:true,skipped:false,flagged:true});
});
test('all 200 pool questions validate and all media is covered by the manifest',async()=>{
 assert.equal(pool.questions.length,200);assert.equal(new Set(pool.questions.map(q=>q.id)).size,200);
 const paths=new Set((await read('eps-topik-media.json')).map(m=>m.path));
 for(const q of pool.questions){
  const ids=bank.questions.map(x=>x.id),slot=bank.questions.findIndex(x=>x.group===q.group);
  if(!ids.includes(q.id))ids[slot]=q.id;
  assembleExam(bank,pool,ids);
  for(const p of [...q.images,...q.choices.flatMap(c=>c.images),...(q.audio?[q.audio]:[])])assert.ok(paths.has(p));
 }
 const book=pool.questions.filter(q=>q.provenance);
 assert.equal(book.length,8);assert.ok(book.every(q=>q.provenance.answerPage===330));
});
