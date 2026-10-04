import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {plates,compareAnswers,createAttempt} from '../js/ishihara.mjs';
import {protectedPath} from '../access/worker.mjs';
test('local plates exist and unseen answers remain distinct from matching numbers',()=>{
 for(const p of plates)assert.ok(fs.statSync(new URL('../images/ishihara/'+p.file,import.meta.url)).size>1000);
 const result=compareAnswers(['12',null,'74','8']);assert.deepEqual(result.map(r=>r.matched),[true,false,true,false]);assert.equal(result[1].answer,null);
 assert.ok(protectedPath('/ishihara.html'));assert.ok(protectedPath('/ishihara'));
 const html=fs.readFileSync(new URL('../exams.html',import.meta.url),'utf8');assert.ok(html.includes('href="ishihara.html"'));assert.ok(!html.includes('ishiharatest.com'));
});
test('random practice uses 12 distinct numbers and avoids the previous attempt',()=>{
 let previous=[];for(let i=0;i<100;i++){const attempt=createAttempt(previous);assert.equal(attempt.length,12);assert.equal(new Set(attempt.map(p=>p.answer)).size,12);assert.ok(attempt.every(p=>Number(p.answer)>=1&&Number(p.answer)<=99&&!previous.some(old=>old.answer===p.answer)));assert.ok(compareAnswers(attempt.map(p=>p.answer),attempt).every(r=>r.matched));previous=attempt;}
});
test('each attempt uses six color combinations without adjacent repeats, including retries',()=>{
 let previous=[];for(let i=0;i<100;i++){const attempt=createAttempt(previous);assert.equal(new Set(attempt.map(p=>p.palette)).size,6);assert.notEqual(attempt[0].palette,previous.at(-1)?.palette);for(let j=1;j<attempt.length;j++)assert.notEqual(attempt[j].palette,attempt[j-1].palette);previous=attempt;}
});
