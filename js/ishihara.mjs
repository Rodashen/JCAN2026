export const plates=[{file:'plate-1.svg',answer:'12'},{file:'plate-2.svg',answer:'2'},{file:'plate-9.svg',answer:'74'},{file:'plate-11.png',answer:'6'}];
export function compareAnswers(answers){return plates.map((plate,i)=>({answer:answers[i]??null,expected:plate.answer,matched:answers[i]===plate.answer}));}
if(typeof document!=='undefined'){
 const $=s=>document.querySelector(s);let index=0,answers=[],loaded=false;
 const image=$('#plate'),input=$('#answer');
 function render(){loaded=false;$('#next').disabled=true;$('#unseen').disabled=true;$('#load-error').hidden=true;$('#validation').textContent='';$('#progress').textContent=`Plate ${index+1} of ${plates.length}`;input.value='';image.src='images/ishihara/'+plates[index].file;$('#next').textContent=index===plates.length-1?'Submit results':'Next plate';}
 image.onload=()=>{loaded=true;$('#next').disabled=false;$('#unseen').disabled=false;};image.onerror=()=>{$('#load-error').hidden=false;};
 function record(answer){if(!loaded)return;answers.push(answer);if(++index<plates.length){render();$('#progress').focus();}else{const rows=compareAnswers(answers);$('#practice').hidden=true;$('#results').hidden=false;$('#score').textContent=`You matched ${rows.filter(r=>r.matched).length} of ${plates.length} expected numbers.`;$('#review').replaceChildren(...rows.map((r,i)=>{const tr=document.createElement('tr');for(const text of [String(i+1),r.answer??'No number seen',r.expected,r.matched?'Matched':'Did not match']){const td=document.createElement('td');td.textContent=text;tr.append(td);}return tr;}));$('#results h2').focus();}}
 $('#plate-form').addEventListener('submit',event=>{event.preventDefault();const answer=input.value.trim();if(!/^\d{1,3}$/.test(answer)){$('#validation').textContent='Enter a number, or choose “I cannot see a number.”';return;}record(String(Number(answer)));});
 $('#unseen').addEventListener('click',()=>record(null));$('#retry').addEventListener('click',()=>{index=0;answers=[];$('#results').hidden=true;$('#practice').hidden=false;render();$('#progress').focus();});render();
}
