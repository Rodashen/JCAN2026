import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import worker from '../access/worker.mjs';

test('exam service home URLs redirect to the current public homepage without requiring sign-in',async()=>{
 for(const path of ['/','/index.html','/index']){
  const response=await worker.fetch(new Request('https://jcan-exam-access.tararoneee.workers.dev'+path),{});
  assert.equal(response.status,302);assert.equal(response.headers.get('Location'),'https://jcanklc.com/');assert.equal(response.headers.get('Cache-Control'),'no-store');
 }
});
test('exam page logo and home links use the canonical public site',async()=>{
 for(const file of ['exams.html','exam-access.html','exam-admin.html','cbt.html','ubt.html','skills.html','ishihara.html']){
  const html=await fs.readFile(new URL('../'+file,import.meta.url),'utf8');
  assert.match(html,/href="https:\/\/jcanklc\.com\/"/);assert.doesNotMatch(html,/href="index\.html(?:#|";?)/);
 }
});
