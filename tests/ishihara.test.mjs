import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {plates,compareAnswers} from '../js/ishihara.mjs';
import {protectedPath} from '../access/worker.mjs';
test('local plates exist and unseen answers remain distinct from matching numbers',()=>{
 for(const p of plates)assert.ok(fs.statSync(new URL('../images/ishihara/'+p.file,import.meta.url)).size>1000);
 const result=compareAnswers(['12',null,'74','8']);assert.deepEqual(result.map(r=>r.matched),[true,false,true,false]);assert.equal(result[1].answer,null);
 assert.ok(protectedPath('/ishihara.html'));assert.ok(protectedPath('/ishihara'));
 const html=fs.readFileSync(new URL('../exams.html',import.meta.url),'utf8');assert.ok(html.includes('href="ishihara.html"'));assert.ok(!html.includes('ishiharatest.com'));
});
