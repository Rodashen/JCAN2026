import test from 'node:test';
import assert from 'node:assert/strict';
import {createUbtPlayback,ubtAudioKey,ubtPlayCount} from '../js/ubt-playback.mjs';
import {createAttempt,restoreAttempt} from '../js/cbt-core.mjs';
import fs from 'node:fs/promises';
const tick=()=>new Promise(resolve=>setTimeout(resolve,5));
class Clip extends EventTarget{
 static clips=[];
 constructor(src){super();this.src=src;Clip.clips.push(this);}
 play(){this.dispatchEvent(new Event('playing'));return Promise.resolve();}
 pause(){this.paused=true;}
 end(){this.dispatchEvent(new Event('ended'));}
}
const build=state=>createUbtPlayback({state,AudioClass:Clip,save:()=>{},onActive:()=>{},onChange:()=>{},gapMs:0});
test('one click plays the numbered question exactly twice and blocks all further clicks',async()=>{
 Clip.clips=[];const state={},key=ubtAudioKey('q1'),p=build(state);
 assert.equal(p.play(key,'question.mp3','number.mp3'),true);assert.equal(p.play(key,'question.mp3'),false);
 Clip.clips.at(-1).end();assert.equal(ubtPlayCount(state,key),1);
 Clip.clips.at(-1).end();await tick();assert.equal(ubtPlayCount(state,key),2);
 Clip.clips.at(-1).end();assert.equal(p.busy,false);assert.equal(p.play(key,'question.mp3'),false);
 assert.deepEqual(Clip.clips.map(c=>c.src),['number.mp3','question.mp3','question.mp3']);p.stop();
});
test('each choice has its own two-play budget, persisted across reloading',async()=>{
 Clip.clips=[];const state={},first=ubtAudioKey('q1',0),second=ubtAudioKey('q1',1);let p=build(state);
 p.play(first,'choice1.mp3');Clip.clips.at(-1).end();await tick();Clip.clips.at(-1).end();p.stop();
 p=build(JSON.parse(JSON.stringify(state)));assert.equal(p.play(first,'choice1.mp3'),false);assert.equal(p.play(second,'choice2.mp3'),true);p.stop();
});
test('interruption consumes the started pass and resumes only the remaining pass',async()=>{
 Clip.clips=[];const state={},key=ubtAudioKey('q1');let p=build(state);p.play(key,'question.mp3');p.stop();
 assert.equal(ubtPlayCount(state,key),1);p=build(state);p.play(key,'question.mp3');Clip.clips.at(-1).end();await tick();
 assert.equal(Clip.clips.length,2);assert.equal(p.play(key,'question.mp3'),false);p.stop();
});
test('a failed start does not consume an unheard pass or leave navigation locked',async()=>{
 class Failed extends Clip{play(){return Promise.reject(Error('blocked'));}}
 const state={},key=ubtAudioKey('q1');const p=createUbtPlayback({state,AudioClass:Failed,save:()=>{},onActive:()=>{},onChange:()=>{},gapMs:0});
 p.play(key,'question.mp3');await tick();assert.equal(ubtPlayCount(state,key),0);assert.equal(p.busy,false);p.stop();
});
test('saved attempts retain valid per-item budgets and reject invalid counts',async()=>{
 const bank=JSON.parse(await fs.readFile(new URL('../data/eps-topik.json',import.meta.url)));
 const state=createAttempt(bank,'listening'),key=ubtAudioKey(bank.questions[20].id);state.ubtPlayback={[key]:2};
 assert.equal(restoreAttempt(JSON.stringify(state),bank).ubtPlayback[key],2);
 state.ubtPlayback[key]=3;assert.equal(restoreAttempt(JSON.stringify(state),bank),null);
});
