const COOKIE='__Host-jcan_session';
const DAY=86400000;
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const failure=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
export function normalizeEmail(value){
 const email=String(value||'').trim().toLowerCase();
 if(email.length>254||! /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(email))failure('Enter a valid email address.');
 return email;
}
function randomToken(length=32){return Array.from(crypto.getRandomValues(new Uint8Array(length)),n=>n.toString(16).padStart(2,'0')).join('');}
function randomCode(){const abc='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>abc[n&31]).join('');}
export function normalizeCode(value){return String(value||'').toUpperCase().replace(/[\s-]/g,'');}
async function hash(env,value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(env.CODE_PEPPER+'\0'+value));return Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');}
async function limit(env,key,max,window=3600000){
 const now=Date.now(),bucket=Math.floor(now/window),id=await hash(env,'rate:'+key+':'+bucket);
 const row=await env.DB.prepare('INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(id,(bucket+1)*window).first();
 if(row.count>max)failure('Too many requests. Please try again later.',429);
}
async function body(request){
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))failure('Use JSON for this request.',415);
 if(Number(request.headers.get('Content-Length')||0)>2048)failure('Request is too large.',413);
 const text=await request.text();if(text.length>2048)failure('Request is too large.',413);
 try{return JSON.parse(text);}catch{failure('Invalid request.');}
}
function checkConfig(env){if(!env.DB||!env.CODE_PEPPER||env.CODE_PEPPER.length<32)failure('Exam access is not configured yet. Please contact JCAN.',503);}
async function memberSession(request,env){
 const token=request.headers.get('Cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 if(!token||! /^[a-f0-9]{64}$/.test(token))return null;
 return env.DB.prepare('SELECT m.email FROM sessions s JOIN members m ON m.email=s.email WHERE s.token_hash=? AND s.expires>? AND m.activated_at IS NOT NULL AND m.revoked=0').bind(await hash(env,'session:'+token),Date.now()).first();
}
async function newSession(env,email){
 const token=randomToken();
 await env.DB.prepare('INSERT INTO sessions (token_hash,email,expires) VALUES (?,?,?)').bind(await hash(env,'session:'+token),email,Date.now()+30*DAY).run();
 return json({ok:true,email},200,{'Set-Cookie':`${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`});
}
async function sendCode(env,email,code,activation){
 if(!env.BREVO_API_KEY||!env.SENDER_EMAIL)failure('Email delivery is not configured yet.',503);
 await limit(env,'email-total',240,DAY);
 const formatted=code.match(/.{1,4}/g).join('-');
 const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':env.BREVO_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({sender:{name:'JCAN Korean Language Center',email:env.SENDER_EMAIL},to:[{email}],subject:activation?'Your JCAN exam access code':'Your JCAN sign-in code',textContent:`JCAN Korean Language Center\n\n${activation?'Your payment has been confirmed. Activate unlimited practice exam access using this email address and the one-time code below.':'Use this one-time code to sign in to your existing exam access.'}\n\n${formatted}\n\n${activation?'The activation code expires in 7 days. Once activated, your access does not expire unless JCAN revokes it. This code only works with the email it was sent to.':'This sign-in code expires in 15 minutes.'}\n\nSign in: ${env.SITE_ORIGIN}/exam-access.html\n\nDo not share your code. If you did not request this message, contact JCAN.`})});
 if(!response.ok)failure('Email could not be sent. Check the email service settings or daily sending limit, then try again.',502);
}
async function admin(request,env){
 const supplied=request.headers.get('Authorization')?.replace(/^Bearer /,'')||'';
 if(!env.ADMIN_KEY||env.ADMIN_KEY.length<32||supplied.length>256||await hash(env,supplied)!==await hash(env,env.ADMIN_KEY))failure('Administrator access was not accepted.',401);
}
export function protectedPath(path){return /^\/(?:(?:cbt|ubt|exams)(?:\.html)?\/?$|data(?:\/|$)|media\/eps-topik(?:\/|$)|js\/cbt[^/]*)/i.test(path);}
async function api(request,env,path){
 checkConfig(env);
 if(path==='/api/session'&&request.method==='GET'){
  const session=await memberSession(request,env);return json({authenticated:Boolean(session),email:session?.email||null});
 }
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 if(request.headers.get('Origin')!==env.SITE_ORIGIN||new URL(request.url).origin!==env.SITE_ORIGIN)failure('This request must come from the JCAN website.',403);
 const ip=request.headers.get('CF-Connecting-IP')||'local';
 await limit(env,'requests:'+ip,60);
 const data=await body(request);
 if(path==='/api/logout'){
  const token=request.headers.get('Cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
  if(token)await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await hash(env,'session:'+token)).run();
  return json({ok:true},200,{'Set-Cookie':`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`});
 }
 if(path.startsWith('/api/admin/')){
  await admin(request,env);
  const email=normalizeEmail(data.email);
  if(path==='/api/admin/revoke'){
   await env.DB.batch([env.DB.prepare('UPDATE members SET revoked=1,code_hash=NULL WHERE email=?').bind(email),env.DB.prepare('DELETE FROM sessions WHERE email=?').bind(email),env.DB.prepare('DELETE FROM login_codes WHERE email=?').bind(email)]);
   return json({ok:true,message:'Access revoked for this email.'});
  }
  if(path!=='/api/admin/issue')return json({error:'Not found.'},404);
  if(data.paymentConfirmed!==true)failure('Confirm the payment before sending an access code.');
  await limit(env,'issue:'+email,3);
  const member=await env.DB.prepare('SELECT activated_at,revoked FROM members WHERE email=?').bind(email).first();
  if(member?.activated_at&&!member.revoked)failure('This email already has access. The student can request a new sign-in code.');
  const code=randomCode(),codeHash=await hash(env,'activate:'+email+':'+code),now=Date.now();
  await env.DB.prepare('INSERT INTO members (email,code_hash,code_expires,created_at) VALUES (?,?,?,?) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,code_expires=excluded.code_expires,activated_at=NULL,revoked=0').bind(email,codeHash,now+7*DAY,now).run();
  try{await sendCode(env,email,code,true);}catch(error){await env.DB.prepare('UPDATE members SET code_hash=NULL WHERE email=? AND code_hash=?').bind(email,codeHash).run();throw error;}
  return json({ok:true,message:'Activation code sent. It can only be used by this email address.'});
 }
 const email=normalizeEmail(data.email);
 if(path==='/api/sign-in-code'){
  await limit(env,'send:'+ip,10);await limit(env,'send-email:'+email,3);
  const member=await env.DB.prepare('SELECT email FROM members WHERE email=? AND activated_at IS NOT NULL AND revoked=0').bind(email).first();
  if(member){
   const code=randomCode(),codeHash=await hash(env,'login:'+email+':'+code);
   await env.DB.prepare('INSERT INTO login_codes (email,code_hash,expires) VALUES (?,?,?) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,expires=excluded.expires').bind(email,codeHash,Date.now()+900000).run();
   try{await sendCode(env,email,code,false);}catch(error){await env.DB.prepare('DELETE FROM login_codes WHERE email=? AND code_hash=?').bind(email,codeHash).run();throw error;}
  }
  return json({ok:true,message:'If this email has activated access, a sign-in code has been sent. Check your inbox and spam folder.'});
 }
 if(path==='/api/verify'){
  await limit(env,'verify:'+email,10,900000);
  const code=normalizeCode(data.code);if(!/^[A-HJ-NP-Z2-9]{16}$/.test(code))failure('Enter the code from your email.');
  const now=Date.now();
  // Conditional UPDATE/DELETE consumes each code atomically, including concurrent requests.
  const activated=await env.DB.prepare('UPDATE members SET activated_at=?,code_hash=NULL,code_expires=NULL WHERE email=? AND code_hash=? AND code_expires>? AND activated_at IS NULL AND revoked=0 RETURNING email').bind(now,email,await hash(env,'activate:'+email+':'+code),now).first();
  if(activated)return newSession(env,email);
  const signedIn=await env.DB.prepare('DELETE FROM login_codes WHERE email=? AND code_hash=? AND expires>? AND EXISTS (SELECT 1 FROM members WHERE members.email=login_codes.email AND activated_at IS NOT NULL AND revoked=0) RETURNING email').bind(email,await hash(env,'login:'+email+':'+code),now).first();
  if(signedIn)return newSession(env,email);
  failure('This code is invalid, expired, already used, or belongs to another email.');
 }
 return json({error:'Not found.'},404);
}
export default {
 async fetch(request,env){
  try{
   const url=new URL(request.url);
   let path;try{path=decodeURIComponent(url.pathname);}catch{return json({error:'Invalid path.'},400);}
   // Reject ambiguous encodings before forwarding to asset routing.
   if(path.includes('%')||path.includes('\\')||path.includes('\0'))return json({error:'Invalid path.'},400);
   const segments=[];
   for(const part of path.split('/')){if(!part||part==='.')continue;if(part==='..')segments.pop();else segments.push(part);}
   const normalized='/'+segments.join('/');
   if(normalized!==path&&path!=='/')return json({error:'Invalid path.'},400);
   if(path.startsWith('/api/'))return await api(request,env,path);
   const restricted=protectedPath(path);
   if(restricted){
    checkConfig(env);
    if(!await memberSession(request,env)){
     const examPage=path.match(/^\/(cbt|ubt|exams)(\.html)?\/?$/i);
     if(examPage)return new Response(null,{status:303,headers:{Location:'/exam-access.html?next='+examPage[1].toLowerCase(),'Cache-Control':'no-store'}});
     return json({error:'Sign in to access exam materials.'},401);
    }
   }
   if(path==='/')url.pathname='/index.html';
   const response=await env.ASSETS.fetch(new Request(url,request));
   const headers=new Headers(response.headers);
   if(restricted)headers.set('Cache-Control','private, no-store');
   headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','same-origin');headers.set('X-Frame-Options','DENY');
   return new Response(response.body,{status:response.status,headers});
  }catch(error){return json({error:error.status?error.message:'The service is temporarily unavailable. Please try again.'},error.status||503);}
 },
 async scheduled(event,env){const now=Date.now();await env.DB.batch([env.DB.prepare('DELETE FROM sessions WHERE expires<?').bind(now),env.DB.prepare('DELETE FROM login_codes WHERE expires<?').bind(now),env.DB.prepare('DELETE FROM rate_limits WHERE expires<?').bind(now)]);}
};
