const $=s=>document.querySelector(s),status=$('#access-status');
let busy=false;
async function call(path,data,admin=false){
 const headers={'Content-Type':'application/json'};
 if(admin)headers.Authorization='Bearer '+$('#admin-key').value;
 const response=await fetch('api/'+path,{method:'POST',headers,credentials:'same-origin',body:JSON.stringify(data)});
 if(!response.headers.get('Content-Type')?.includes('application/json'))throw Error('Email access is not active on this website yet. Contact JCAN for access.');
 const result=await response.json();if(!response.ok)throw Error(result.error||'Please try again.');return result;
}
async function action(fn){if(busy)return;busy=true;status.textContent='Please wait…';document.querySelectorAll('button').forEach(b=>b.disabled=true);try{await fn();}catch(error){status.textContent=error.message;}finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);}}
function email(){const field=$('#email');if(!field.reportValidity())throw Error('Enter a valid email address.');return field.value.trim();}
if(document.body.dataset.accessAdmin){
 $('#admin-form').addEventListener('submit',event=>{event.preventDefault();action(async()=>{if(!$('#payment-confirmed').checked)throw Error('Confirm the payment before sending access.');const r=await call('admin/issue',{email:email(),paymentConfirmed:true},true);status.textContent=r.message;$('#admin-key').value='';$('#payment-confirmed').checked=false;});});
 $('#revoke').addEventListener('click',()=>{if(!$('#admin-form').reportValidity())return;const address=email();if(confirm('Revoke exam access for '+address+'?'))action(async()=>{const r=await call('admin/revoke',{email:address},true);status.textContent=r.message;$('#admin-key').value='';});});
}else{
 const showSession=address=>{$('#signed-in').hidden=false;$('#access-form').hidden=true;status.textContent='Signed in as '+address+'.';};
 $('#access-form').addEventListener('submit',event=>{event.preventDefault();action(async()=>{const r=await call('verify',{email:email(),code:$('#code').value});$('#code').value='';showSession(r.email);const next=new URLSearchParams(location.search).get('next');if(['cbt','ubt','exams','ishihara','skills'].includes(next))location.href=next+'.html';});});
 $('#send-code').addEventListener('click',()=>action(async()=>{const r=await call('sign-in-code',{email:email()});status.textContent=r.message;}));
 $('#sign-out').addEventListener('click',()=>action(async()=>{await call('logout',{});for(const key of Object.keys(localStorage))if(key.startsWith('jcan-eps-'))localStorage.removeItem(key);location.reload();}));
 fetch('api/session',{credentials:'same-origin'}).then(async r=>{if(r.ok&&r.headers.get('Content-Type')?.includes('application/json')){const s=await r.json();if(s.authenticated)showSession(s.email);}else status.textContent='Email access is not active on this website yet. Contact JCAN for access.';}).catch(()=>status.textContent='Could not check your access. Please try again.');
}
