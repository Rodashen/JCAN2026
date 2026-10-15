import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {selectExam,assembleExam,validateBank,createAttempt,restoreAttempt,answerQuestion,leaveQuestion,questionStatus,isGraphQuestion} from '../js/cbt-core.mjs';
const read=async name=>JSON.parse(await fs.readFile(new URL('../data/'+name,import.meta.url)));
const bank=await read('eps-topik.json'),pool=await read('eps-topik-pool.json');
let seed=1234567;
const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
test('300 retries have fresh questions, verified recordings and a 30/70 split in both sections',()=>{
 const history={counts:{}};
 for(let i=0;i<300;i++){
  const exam=selectExam(bank,pool,history,random),ids=exam.questions.map(q=>q.id);
  assert.equal(new Set(ids).size,40);assert.equal(validateBank(exam),exam);
  const graphs=exam.questions.filter(isGraphQuestion);assert.ok(graphs.length>=2&&graphs.length<=3,'Every exam includes 2–3 graphs');
  assert.ok(exam.questions.every(q=>!history.previous?.includes(q.id)),'All questions, including graphs, avoid the preceding exam');
  for(const section of ['reading','listening']){
   const qs=exam.questions.filter(q=>q.section===section);
   assert.equal(qs.filter(q=>q.provenance?.book===1).length,6);
   assert.equal(qs.filter(q=>q.provenance?.book===2).length,14);
  }
  assert.ok(exam.questions.slice(20).every(q=>q.audioScope==='unit'&&q.provenance.audioUrl&&q.audioSeconds>0));
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
test('all 356 pool questions validate and all media is covered by the manifest',async()=>{
 assert.equal(pool.questions.length,356);assert.equal(new Set(pool.questions.map(q=>q.id)).size,356);
 const paths=new Set((await read('eps-topik-media.json')).map(m=>m.path));
 for(const q of pool.questions){
  const ids=bank.questions.map(x=>x.id),slot=bank.questions.findIndex(x=>x.section===q.section);
  if(!ids.includes(q.id))ids[slot]=q.id;
  assembleExam(bank,pool,ids);
  for(const p of [...q.images,...q.choices.flatMap(c=>[...c.images,...(c.audio?[c.audio]:[])]),...(q.audio?[q.audio]:[])])assert.ok(paths.has(p));
 }
 const book=pool.questions.filter(q=>q.provenance);
 assert.equal(book.length,164);
 assert.equal(book.filter(q=>q.provenance.book===1).length,83);
 assert.equal(book.filter(q=>q.provenance.kind==='adapted').length,6);
 assert.ok(book.every(q=>q.provenance.answerPage||q.explanation));
});

test('randomized questions retain their own accurate directions',()=>{
 const chart=pool.questions.find(q=>q.id==='jcan-book1-chart-1');
 const ids=bank.questions.map(q=>q.id);ids[8]=chart.id;
 const exam=assembleExam(bank,pool,ids);
 assert.equal(exam.questions[8].instruction,chart.instruction);
 for(const q of pool.questions)assert.ok(!/다옴|믈음|알믖|대 담|답하십시오 \./.test(q.instruction));
});

test('verified listening preserves textbook choices, answer keys and official track references',()=>{
 const cases=[['hrdk-2024-v1-u17-l5',2,'친구들하고 부산에 가려고 해요.'],['hrdk-2024-v2-u31-l3',0,'새로 온 직원의 태도'],['hrdk-2024-v2-u32-l5',1,'남자는 휴게실에서 요리를 했습니다.']];
 for(const [id,answer,text] of cases){const q=pool.questions.find(q=>q.id===id);assert.equal(q.answer,answer);assert.equal(q.choices[answer].text,text);assert.match(q.provenance.audioUrl,/^https:\/\/epstopik\.hrdkorea\.or\.kr\//);assert.ok(q.provenance.audioEntry.includes('Track '+q.provenance.track+' '));}
 for(const q of pool.questions.filter(q=>q.audioScope==='unit'))assert.ok(q.choices.every(c=>c.audio&&!/[①②③④]|\[\d~\d\]|듣기지문|WORKPLACE/.test(c.text)));
});
