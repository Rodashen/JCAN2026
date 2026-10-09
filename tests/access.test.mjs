import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker from '../access/worker.mjs';

function fixture(){
 const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync(new URL('../access/schema.sql',import.meta.url),'utf8'));
 function prepare(sql){return {bind(...args){return {async first(){return db.prepare(sql).get(...args)||null;},async run(){return db.prepare(sql).run(...args);}};}};}
 const env={DB:{prepare,async batch(statements){db.exec('BEGIN');try{const r=[];for(const statement of statements)r.push(await statement.run());db.exec('COMMIT');return r;}catch(error){db.exec('ROLLBACK');throw error;}}},CODE_PEPPER:'test-pepper-'.repeat(5),ADMIN_KEY:'test-admin-'.repeat(5),BREVO_API_KEY:'fake-not-live',SENDER_EMAIL:'owner@example.com',SITE_ORIGIN:'https://jcan.example',ASSETS:{async fetch(){return new Response('protected asset');}}};
 const emails=[];
 const original=globalThis.fetch;
 globalThis.fetch=async (url,options)=>{assert.equal(url,'https://api.brevo.com/v3/smtp/email');emails.push(JSON.parse(options.body));return new Response('{}',{status:201});};
 async function call(path,data,opts={}){
  const method=data===undefined?'GET':'POST';
  const headers={'Content-Type':'application/json',Origin:opts.origin||env.SITE_ORIGIN,'CF-Connecting-IP':opts.ip||'127.0.0.1'};
  if(opts.admin)headers.Authorization='Bearer '+env.ADMIN_KEY;
  if(opts.cookie)headers.Cookie=opts.cookie;
  return worker.fetch(new Request(env.SITE_ORIGIN+path,{method,headers,...(data===undefined?{}:{body:JSON.stringify(data)})}),env);
 }
 const latestCode=()=>emails.at(-1).textContent.match(/[A-HJ-NP-Z2-9]{4}(?:-[A-HJ-NP-Z2-9]{4}){3}/)[0];
 return {db,env,emails,call,latestCode,close(){globalThis.fetch=original;db.close();}};
}
test('paid email activation is single-use, email-bound, and creates unlimited reusable access',async()=>{
 const f=fixture();try{
  for(const path of ['/exams','/exams.html']){const response=await f.call(path);assert.equal(response.status,303);assert.equal(response.headers.get('Location'),'/exam-access.html?next=exams');}
  assert.equal((await f.call('/api/admin/issue',{email:'paid@example.com',paymentConfirmed:true})).status,401);
  assert.equal((await f.call('/api/admin/issue',{email:'paid@example.com',paymentConfirmed:false},{admin:true})).status,400);
  assert.equal((await f.call('/api/admin/issue',{email:'Paid@example.com',paymentConfirmed:true},{admin:true})).status,200);
  const code=f.latestCode();assert.equal(f.emails.length,1);
  assert.equal((await f.call('/api/verify',{email:'other@example.com',code})).status,400);
  const attempts=await Promise.all([f.call('/api/verify',{email:'paid@example.com',code}),f.call('/api/verify',{email:'paid@example.com',code})]);
  assert.deepEqual(attempts.map(r=>r.status).sort(),[200,400]);
  const cookie=attempts.find(r=>r.status===200).headers.get('Set-Cookie');assert.match(cookie,/HttpOnly; Secure; SameSite=Strict/);
  for(let i=0;i<3;i++)assert.equal((await f.call('/cbt.html',undefined,{cookie})).status,200);
  assert.equal((await f.call('/ubt.html',undefined,{cookie})).status,200);
  assert.equal((await f.call('/exams.html',undefined,{cookie})).status,200);
  const skills=await f.call('/skills.html',undefined,{cookie});assert.equal(skills.status,200);assert.equal(skills.headers.get('Referrer-Policy'),'strict-origin-when-cross-origin');assert.equal(skills.headers.get('Cache-Control'),'private, no-store');
  assert.equal((await f.call('/cbt.html',undefined,{cookie})).headers.get('Referrer-Policy'),'same-origin');
  assert.equal((await f.call('/api/verify',{email:'paid@example.com',code})).status,400);
  const member=f.db.prepare('SELECT * FROM members').get();assert.ok(member.activated_at);assert.equal(member.code_hash,null);
  assert.ok(!JSON.stringify(member).includes(code));
 }finally{f.close();}
});
test('returning users verify a fresh emailed code; logout and revocation invalidate sessions',async()=>{
 const f=fixture();try{
  await f.call('/api/admin/issue',{email:'paid@example.com',paymentConfirmed:true},{admin:true});
  const first=await f.call('/api/verify',{email:'paid@example.com',code:f.latestCode()});const previousCookie=first.headers.get('Set-Cookie');
  await f.call('/api/sign-in-code',{email:'paid@example.com'});const code=f.latestCode();
  const signed=await f.call('/api/verify',{email:'paid@example.com',code});assert.equal(signed.status,200);const cookie=signed.headers.get('Set-Cookie');
  assert.equal((await f.call('/cbt.html',undefined,{cookie:previousCookie})).status,303);
  assert.equal((await f.call('/data/eps-topik.json',undefined,{cookie:previousCookie})).status,401);
  assert.equal((await (await f.call('/api/session',undefined,{cookie:previousCookie})).json()).authenticated,false);
  assert.equal((await f.call('/cbt.html',undefined,{cookie})).status,200);
  assert.equal(f.db.prepare('SELECT COUNT(*) AS count FROM sessions WHERE email=?').get('paid@example.com').count,1);
  await f.call('/api/logout',{}, {cookie:previousCookie});assert.equal((await f.call('/ubt.html',undefined,{cookie})).status,200);
  assert.equal((await f.call('/api/verify',{email:'paid@example.com',code})).status,400);
  await f.call('/api/logout',{}, {cookie});assert.equal((await f.call('/cbt.html',undefined,{cookie})).status,303);
  await f.call('/api/sign-in-code',{email:'paid@example.com'});
  const again=await f.call('/api/verify',{email:'paid@example.com',code:f.latestCode()});const cookie2=again.headers.get('Set-Cookie');
  await f.call('/api/admin/revoke',{email:'paid@example.com'},{admin:true});
  assert.equal((await f.call('/data/eps-topik.json',undefined,{cookie:cookie2})).status,401);
 }finally{f.close();}
});
test('expired codes, unpaid emails, rate limits, cross-site requests and direct assets are handled',async()=>{
 const f=fixture();try{
  assert.equal((await f.call('/api/admin/issue',{email:'paid@example.com',paymentConfirmed:true},{admin:true,origin:'https://attacker.example'})).status,403);
  await f.call('/api/sign-in-code',{email:'unknown@example.com'});assert.equal(f.emails.length,0);
  await f.call('/api/admin/issue',{email:'paid@example.com',paymentConfirmed:true},{admin:true});const code=f.latestCode();
  f.db.prepare('UPDATE members SET code_expires=0').run();assert.equal((await f.call('/api/verify',{email:'paid@example.com',code})).status,400);
  for(let i=0;i<10;i++)await f.call('/api/verify',{email:'paid@example.com',code});
  assert.equal((await f.call('/api/verify',{email:'paid@example.com',code})).status,429);
  for(const path of ['/data/eps-topik.json','/media/eps-topik/example.mp3','/js/cbt.mjs','/%64ata/eps-topik.json'])assert.equal((await f.call(path)).status,401);
  assert.equal((await f.call('//data/eps-topik.json')).status,400);
  assert.equal((await f.call('/cbt')).status,303);assert.equal((await f.call('/ubt.html')).status,303);
  assert.equal((await f.call('/index.html')).status,200);
  delete f.env.CODE_PEPPER;assert.equal((await f.call('/cbt.html')).status,503);
 }finally{f.close();}
});
test('failed email delivery invalidates the undelivered activation code',async()=>{
 const f=fixture();try{
  globalThis.fetch=async()=>new Response('{}',{status:500});
  assert.equal((await f.call('/api/admin/issue',{email:'paid@example.com',paymentConfirmed:true},{admin:true})).status,502);
  assert.equal(f.db.prepare('SELECT code_hash FROM members').get().code_hash,null);
 }finally{f.close();}
});

test('student recovery resends expired activation and admin can resend to activated students',async()=>{
 const f=fixture();try{
  await f.call('/api/admin/issue',{email:'paid@example.com',paymentConfirmed:true},{admin:true});const old=f.latestCode();
  f.db.prepare('UPDATE members SET code_expires=0').run();
  assert.equal((await f.call('/api/sign-in-code',{email:'paid@example.com'})).status,200);
  assert.equal(f.emails.length,2);assert.equal(f.emails.at(-1).subject,'Your JCAN exam access code');
  assert.equal((await f.call('/api/verify',{email:'paid@example.com',code:old})).status,400);
  assert.equal((await f.call('/api/verify',{email:'paid@example.com',code:f.latestCode()})).status,200);
  const activatedAt=f.db.prepare('SELECT activated_at FROM members').get().activated_at;
  assert.equal((await f.call('/api/admin/issue',{email:'paid@example.com',paymentConfirmed:true},{admin:true})).status,200);
  assert.equal(f.emails.at(-1).subject,'Your JCAN sign-in code');
  assert.equal(f.db.prepare('SELECT activated_at FROM members').get().activated_at,activatedAt);
  assert.equal((await f.call('/api/verify',{email:'paid@example.com',code:f.latestCode()})).status,200);
 }finally{f.close();}
});

test('failed activation and login resends preserve the previous usable code',async()=>{
 const f=fixture();try{
  await f.call('/api/admin/issue',{email:'paid@example.com',paymentConfirmed:true},{admin:true});const activation=f.latestCode();
  const delivery=globalThis.fetch;globalThis.fetch=async()=>new Response('{}',{status:500});
  assert.equal((await f.call('/api/sign-in-code',{email:'paid@example.com'})).status,502);
  assert.equal((await f.call('/api/verify',{email:'paid@example.com',code:activation})).status,200);
  globalThis.fetch=delivery;
  await f.call('/api/sign-in-code',{email:'paid@example.com'});const login=f.latestCode();
  globalThis.fetch=async()=>new Response('{}',{status:500});
  assert.equal((await f.call('/api/sign-in-code',{email:'paid@example.com'})).status,502);
  assert.equal((await f.call('/api/verify',{email:'paid@example.com',code:login})).status,200);
 }finally{f.close();}
});
