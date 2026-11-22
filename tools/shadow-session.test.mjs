import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {shuffledExamples,createShadowSession} from '../docs/shadow-session.mjs';
const patterns=JSON.parse(fs.readFileSync(new URL('../tools/week-04-workbook-patterns.json',import.meta.url)));
function setup(){
 let clock=0,id=0;const timers=new Map(),spoken=[],states=[];
 const s=createShadowSession({patterns,random:()=>.3,speak:(text,callbacks)=>spoken.push({text,...callbacks}),cancel(){},onChange:state=>states.push(state),now:()=>clock,setTimer:fn=>{timers.set(++id,fn);return id;},clearTimer:id=>timers.delete(id)});
 return {s,spoken,states,timers,advance(ms){clock+=ms;const batch=[...timers.values()];timers.clear();batch.forEach(fn=>fn());},finish(ms=2000){clock+=ms;spoken.at(-1).onEnd();}};
}
test('shuffled examples include every whole sentence once and avoid an immediate round repeat',()=>{
 const shuffled=shuffledExamples(patterns,()=>.3);
 assert.equal(shuffled.length,18);assert.equal(new Set(shuffled.map(q=>q.id)).size,18);
 for(const q of shuffled)assert.equal(q.en,q.before+q.answer+q.after);
 assert.notEqual(shuffled[0].id,patterns[0].exercises[0].id);
 const next=shuffledExamples(patterns,()=>.3,shuffled[0].id);assert.notEqual(next[0].id,shuffled[0].id);
});
test('speech ends before the response gap and the next sentence starts after that gap',()=>{
 const a=setup();a.s.play();assert.equal(a.s.state.phase,'listen');assert.equal(a.spoken.length,1);a.finish();
 assert.equal(a.s.state.phase,'repeat');assert(a.s.state.remaining>=3);a.advance(1000);assert.equal(a.spoken.length,1);
 a.advance(5000);assert.equal(a.spoken.length,2);assert.equal(a.s.state.index,1);assert.equal(a.s.state.phase,'listen');
});
test('stopping during speech or response time cancels progression, including stale callbacks',()=>{
 const a=setup();a.s.play();const stale=a.spoken[0].onEnd;a.s.stop();stale();assert.equal(a.s.state.phase,'idle');assert.equal(a.timers.size,0);
 a.s.play();a.finish();a.s.stop();a.advance(20000);assert.equal(a.spoken.length,2);assert.equal(a.s.state.index,0);
});
test('replay repeats the current whole sentence and next cancels the pending gap',()=>{
 const a=setup();a.s.play();const text=a.spoken[0].text;a.s.replay();assert.equal(a.spoken[1].text,text);
 a.finish();a.s.next();assert.equal(a.s.state.index,1);assert.equal(a.timers.size,0);a.advance(10000);assert.equal(a.spoken.length,3);
});
test('one finite round ends after 18 examples without looping and allows an explicit new round',()=>{
 const a=setup();a.s.play();for(let i=0;i<18;i++){a.finish();a.advance(10000);}
 assert.equal(a.s.state.phase,'complete');assert.equal(a.spoken.length,18);assert.equal(a.timers.size,0);
 const last=a.s.state.item.id;a.s.restart();assert.equal(a.s.state.phase,'listen');assert.notEqual(a.s.state.item.id,last);
});
test('playback errors keep the current sentence available and never skip it',()=>{
 const a=setup();a.s.play();a.spoken[0].onError();assert.equal(a.s.state.phase,'idle');assert(a.s.state.error);assert.equal(a.s.state.index,0);assert.equal(a.timers.size,0);
});
test('leaving a finished session keeps the completed view rather than replaying the last sentence',()=>{
 const a=setup();a.s.play();for(let i=0;i<18;i++){a.finish();a.advance(10000);}a.s.stop();assert.equal(a.s.state.phase,'complete');assert.equal(a.spoken.length,18);
});
