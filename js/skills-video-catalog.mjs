// Chapter times published in HRD Korea's official descriptions, checked 2026-10-22.
// End times stop at the next chapter; final chapters stop at the video duration.
export const videoGroups={
 manufacturing:{label:'Manufacturing / Service I',videos:{en:'6WvnK2a_CEU',tl:'nwETwGnmelc'},duration:689,skills:[
  ['pins','Insert pins','Paglalagay ng mga pin',4,50],
  ['joints','Joint connection','Pagdurugtong ng mga piyesa',50,146],
  ['measure-cut','Measuring and cutting','Pagsukat at pagputol',146,264],
  ['pipe-bolting','Pipe bolting','Pagkabit ng bolt sa tubo',264,379],
  ['grinder','Using a grinder','Paggamit ng grinder',379,505],
  ['packaging','Product packaging','Pagbalot ng produkto',505,587],
  ['pallet','Pallet loading','Pagkarga sa pallet',587,689]
 ]},
 service2:{label:'Service II',videos:{en:'2759QwknvO0',tl:'3U-FSXT_15Y'},duration:351,skills:[
  ['pins','Insert pins','Paglalagay ng mga pin',4,52],
  ['cookware','Organizing cookware','Pag-aayos ng mga gamit sa pagluluto',52,141],
  ['sorting','Sorting and loading items','Pag-uuri at pagkarga ng mga bagay',141,248],
  ['housekeeping','Housekeeping cart setup','Paghahanda ng housekeeping cart',248,351]
 ]},
 fitness:{label:'Physical fitness · All industries',videos:{en:'L3cp0C92vBQ',tl:'nYB4jF_zaCQ'},duration:330,skills:[
  ['grip','Grip strength','Lakas ng paghawak',4,63],
  ['back','Back strength','Lakas ng likod',63,130],
  ['burpee','Burpee test','Burpee test',130,196],
  ['equipment','Moving equipment','Paglipat ng kagamitan',196,264],
  ['cart','Pushing a hand cart','Pagtulak ng hand cart',264,330]
 ]},
 interview:{label:'Interview · All industries',videos:{en:'NCzvZMXRs8g',tl:'V7b7LLXP414'},duration:153,skills:[
  ['overview','Korean interview overview','Pangkalahatang gabay sa interbyu',3,59],
  ['introduction','Self-introduction and attitude','Pagpapakilala sa sarili at asal',59,70],
  ['conversation','Basic conversation and following instructions','Pangunahing usapan at pagsunod sa utos',70,93],
  ['tools','Tools and instruction execution','Mga kagamitan at pagsunod sa panuto',93,113],
  ['ncs','NCS basic competencies','Mga pangunahing kakayahang NCS',113,133],
  ['safety','Safety awareness','Kaalaman sa kaligtasan',133,153]
 ]}
};
export function selectedClip(groupKey,skillId,language){
 const group=videoGroups[groupKey],skill=group?.skills.find(s=>s[0]===skillId);
 if(!skill||!group.videos[language])throw Error('Unknown skills guide.');
 return {videoId:group.videos[language],id:skill[0],title:language==='tl'?skill[2]:skill[1],start:skill[3],end:skill[4],duration:skill[4]-skill[3],group:group.label};
}
export function clipEmbedUrl(clip,origin){
 const url=new URL('https://www.youtube-nocookie.com/embed/'+clip.videoId);
 const values={start:clip.start,end:clip.end,autoplay:0,rel:0,fs:0,playsinline:1};
 if(origin&&/^https?:\/\//.test(origin))values.origin=origin;
 for(const [key,value] of Object.entries(values))url.searchParams.set(key,value);
 return url.href;
}
export function clipSourceUrl(clip){return 'https://www.youtube.com/watch?v='+clip.videoId+'&t='+clip.start+'s';}
