export const plates=[{file:'plate-1.svg',answer:'12'},{file:'plate-2.svg',answer:'2'},{file:'plate-9.svg',answer:'74'},{file:'plate-11.png',answer:'6'}];
export const palettes=[
 [['#759866','#8dab72','#a4b97e'],['#c17963','#d78f72','#dfa180']],
 [['#be796a','#d18c79','#db9e88'],['#628e76','#76a18a','#91b19b']],
 [['#719d95','#87afa5','#a2bcb0'],['#ca806f','#dc9680','#e2a791']],
 [['#bf9560','#d2a875','#ddba8b'],['#729574','#88a787','#a0b69a']],
 [['#a9837c','#bd9b8e','#d0ad9e'],['#829258','#97a46c','#adba82']],
 [['#89a58b','#a1b69a','#b7c5ad'],['#b47b89','#c7919c','#d6a4ac']]
];
export function createAttempt(previous=[]){
 const excluded=new Set(previous.map(p=>p.answer));const pool=Array.from({length:99},(_,i)=>String(i+1)).filter(n=>!excluded.has(n));
 for(let i=pool.length-1;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}
 const order=palettes.map((_,i)=>i);for(let i=order.length-1;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[order[i],order[j]]=[order[j],order[i]];}
 if(order[0]===previous.at(-1)?.palette)[order[0],order[1]]=[order[1],order[0]];
 return pool.slice(0,12).map((answer,i)=>({answer,generated:true,palette:order[i%order.length]}));
}
export function compareAnswers(answers,attempt=plates){return attempt.map((plate,i)=>({answer:answers[i]??null,expected:plate.answer,matched:answers[i]===plate.answer}));}
function generatedPlate(number,paletteIndex){
 const size=600,mask=document.createElement('canvas');mask.width=mask.height=size;const m=mask.getContext('2d');m.fillStyle='#000';m.fillRect(0,0,size,size);m.fillStyle='#fff';m.font=`bold ${number.length>1?270:340}px Arial`;m.textAlign='center';m.textBaseline='middle';m.fillText(number,300,310);const pixels=m.getImageData(0,0,size,size).data;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,size,size);
 const palette=palettes[paletteIndex];const dots=[];
 for(let tries=0;tries<26000&&dots.length<1900;tries++){const x=12+Math.random()*576,y=12+Math.random()*576,r=3+Math.random()*7;if(Math.hypot(x-300,y-300)+r>284||dots.some(d=>Math.abs(d.x-x)<22&&Math.abs(d.y-y)<22&&Math.hypot(d.x-x,d.y-y)<d.r+r+1.2))continue;dots.push({x,y,r});const foreground=pixels[(Math.floor(y)*size+Math.floor(x))*4]>128;const colors=palette[foreground?1:0];ctx.fillStyle=colors[Math.floor(Math.random()*colors.length)];ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
 return canvas.toDataURL('image/png');
}
if(typeof document!=='undefined'){
 const $=s=>document.querySelector(s);let index=0,answers=[],loaded=false,attempt=createAttempt();
 const image=$('#plate'),input=$('#answer');
 function render(){loaded=false;$('#next').disabled=true;$('#unseen').disabled=true;$('#load-error').hidden=true;$('#validation').textContent='';$('#progress').textContent=`Plate ${index+1} of ${attempt.length}`;input.value='';image.src=generatedPlate(attempt[index].answer,attempt[index].palette);$('#next').textContent=index===attempt.length-1?'Submit results':'Next plate';}
 image.onload=()=>{loaded=true;$('#next').disabled=false;$('#unseen').disabled=false;};image.onerror=()=>{$('#load-error').hidden=false;};
 function record(answer){if(!loaded)return;answers.push(answer);if(++index<attempt.length){render();$('#progress').focus();}else{const rows=compareAnswers(answers,attempt);$('#practice').hidden=true;$('#results').hidden=false;$('#score').textContent=`You matched ${rows.filter(r=>r.matched).length} of ${attempt.length} expected numbers.`;$('#review').replaceChildren(...rows.map((r,i)=>{const tr=document.createElement('tr');for(const text of [String(i+1),r.answer??'No number seen',r.expected,r.matched?'Matched':'Did not match']){const td=document.createElement('td');td.textContent=text;tr.append(td);}return tr;}));$('#results h2').focus();}}
 $('#plate-form').addEventListener('submit',event=>{event.preventDefault();const answer=input.value.trim();if(!/^\d{1,3}$/.test(answer)){$('#validation').textContent='Enter a number, or choose “I cannot see a number.”';return;}record(String(Number(answer)));});
 $('#unseen').addEventListener('click',()=>record(null));$('#retry').addEventListener('click',()=>{attempt=createAttempt(attempt);index=0;answers=[];$('#results').hidden=true;$('#practice').hidden=false;render();$('#progress').focus();});render();
}
