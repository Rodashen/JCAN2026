import test from 'node:test';import assert from 'node:assert/strict';
import {videoGroups,selectedClip,clipEmbedUrl,clipSourceUrl} from '../js/skills-video-catalog.mjs';
test('official guides contain 22 individual skills in both languages with contiguous chapter limits',()=>{
 assert.deepEqual(Object.values(videoGroups).map(group=>group.skills.length),[7,4,5,6]);
 for(const [key,group] of Object.entries(videoGroups))for(const language of ['en','tl']){
  assert.match(group.videos[language],/^[\w-]{11}$/);
  for(const [index,skill] of group.skills.entries()){
   const clip=selectedClip(key,skill[0],language),url=new URL(clipEmbedUrl(clip,'https://jcanklc.com'));
   assert.equal(clip.start,skill[3]);assert.equal(clip.end,skill[4]);assert.ok(clip.duration>0);assert.ok(clip.end<=group.duration);
   if(index)assert.equal(group.skills[index-1][4],clip.start);
   assert.equal(url.searchParams.get('start'),String(clip.start));assert.equal(url.searchParams.get('end'),String(clip.end));assert.equal(url.searchParams.get('autoplay'),'0');assert.equal(url.searchParams.get('fs'),'0');
   assert.ok(clipSourceUrl(clip).endsWith('&t='+clip.start+'s'));
  }
 }
 assert.equal(selectedClip('service2','housekeeping','en').start,248);
 assert.equal(selectedClip('service2','cookware','tl').videoId,'3U-FSXT_15Y');
 assert.throws(()=>selectedClip('service2','grinder','en'));
});
