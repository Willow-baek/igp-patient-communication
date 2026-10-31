import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {practiceForLine,practiceSteps} from '../docs/practice-model.mjs';
import {createLongPress,createMouseClicks} from '../docs/long-press.mjs';

const weeks=JSON.parse(fs.readFileSync(new URL('../docs/weeks.json',import.meta.url))).weeks;
test('every published unit covers the unchanged script and has complete voice tracks',()=>{
  const week=weeks[1];assert(week.practice.units.length>0);
  for(const unit of week.practice.units){
    for(const line of unit.lines)assert.equal(practiceForLine(week,line),unit);
    for(const voice of ['female','male']){
      const steps=practiceSteps(unit,voice);
      assert.equal(steps.length,unit.chunks.length*2-1);
      assert.equal(steps.at(-1).text,unit.text);
      for(const step of steps)assert(fs.statSync(new URL('../docs/'+step.url,import.meta.url)).size>0);
      for(const step of steps.filter(s=>s.kind==='build'||s.kind==='full'))assert(unit.text.startsWith(step.text));
    }
    if(unit.speaker==='Patient')assert.deepEqual(practiceSteps(unit,'female'),practiceSteps(unit,'male'));
  }
});
test('stale script metadata and unsupported weeks do not open practice',()=>{
  assert.equal(practiceForLine(weeks[0],0),null);
  const stale=structuredClone(weeks[1]);stale.scriptRevision+='-changed';
  assert.equal(practiceForLine(stale,0),null);
  const edited=structuredClone(weeks[1]);edited.lines[0].en+=' Changed.';
  assert.equal(practiceForLine(edited,0),null);
  assert.deepEqual(practiceSteps(weeks[1].practice.units[0],'unavailable'),[]);
});
function gesture(){
  let callback=null,time=0;const opened=[];
  const g=createLongPress({open:t=>opened.push(t),setTimer:fn=>(callback=fn,1),clearTimer:()=>callback=null,now:()=>time});
  const target={id:'bubble'},event={pointerType:'touch',button:0,isPrimary:true,pointerId:1,clientX:20,clientY:30};
  return {g,target,event,opened,fire(){callback?.();},advance(ms){time+=ms;}};
}
test('short tap does not open or consume the existing language toggle',()=>{
  const {g,target,event,opened,fire}=gesture();g.start(target,event);g.end(event);fire();
  assert.equal(opened.length,0);assert.equal(g.consume(target),false);
});
test('long press opens once and suppresses the release click even after a long hold',()=>{
  const h=gesture();h.g.start(h.target,h.event);h.fire();h.advance(4000);h.g.end(h.event);
  assert.equal(h.opened.length,1);assert.equal(h.g.consume(h.target),true);assert.equal(h.g.consume(h.target),false);
});
test('scroll movement and cancellation never open the practice panel',()=>{
  for(const cancel of [h=>h.g.move({...h.event,clientY:45}),h=>h.g.cancel()]){
    const h=gesture();h.g.start(h.target,h.event);cancel(h);h.fire();assert.equal(h.opened.length,0);
  }
});
test('right clicks and additional pointers do not activate a long press',()=>{
  for(const event of [{button:2},{isPrimary:false}]){
    const h=gesture();h.g.start(h.target,{...h.event,...event});h.fire();assert.equal(h.opened.length,0);
  }
});

test('only touch and pen can open practice by holding',()=>{
  for(const [pointerType,expected] of [['mouse',0],['touch',1],['pen',1]]){
    const h=gesture();h.g.start(h.target,{...h.event,pointerType});h.fire();assert.equal(h.opened.length,expected);
  }
});
function clicks(){
  const timers=new Map();let id=0,language='hidden';
  const mouse=createMouseClicks({setTimer:fn=>(timers.set(++id,fn),id),clearTimer:n=>timers.delete(n)});
  const target={id:'bubble'},toggle=()=>{language=language==='hidden'?'ko':'en';},capture=()=>{const saved=language;return()=>language=saved;};
  return {mouse,target,toggle,capture,get language(){return language;},fire(){for(const [id,fn] of timers){timers.delete(id);fn();}}};
}
test('a single mouse click changes language after double-click detection',()=>{
  const h=clicks();h.mouse.click(h.target,1,h.toggle,h.capture);assert.equal(h.language,'hidden');h.fire();assert.equal(h.language,'ko');
});
test('a fast mouse double click never changes the bubble language',()=>{
  const h=clicks();h.mouse.click(h.target,1,h.toggle,h.capture);h.mouse.click(h.target,2,h.toggle,h.capture);h.mouse.doubleClick(h.target);h.fire();assert.equal(h.language,'hidden');
});
test('a slower OS double click restores the exact original Blind state',()=>{
  const h=clicks();h.mouse.click(h.target,1,h.toggle,h.capture);h.fire();assert.equal(h.language,'ko');
  h.mouse.click(h.target,2,h.toggle,h.capture);h.mouse.doubleClick(h.target);assert.equal(h.language,'hidden');
});
test('navigation cancels any pending mouse language change',()=>{
  const h=clicks();h.mouse.click(h.target,1,h.toggle,h.capture);h.mouse.cancel();h.fire();assert.equal(h.language,'hidden');
});

test('tail extensions preserve original source starts, stay within originals, and use new assets',()=>{
  const original=JSON.parse(fs.readFileSync(new URL('./week-02-practice-boundaries.json',import.meta.url)));
  const revised=JSON.parse(fs.readFileSync(new URL('./week-02-practice-tail-v2.json',import.meta.url)));
  const sources=JSON.parse(fs.readFileSync(new URL('./week-02-audio-boundaries.json',import.meta.url)));
  assert.equal(revised.assetVersion,'practice-v2');
  for(const [voice,tracks] of Object.entries(revised.tracks))for(const track of tracks){
    const before=original.tracks[voice].find(t=>t.unit===track.unit);
    assert.equal(track.source,before.source);assert.equal(track.start,before.start);assert.equal(track.end,before.end);
    assert.deepEqual(track.cuts,before.cuts);
    assert.equal(track.tailPadding.length,track.cuts.length+1);
    assert.equal(track.tailPadding.at(-1),0);
    for(const [i,pad] of track.tailPadding.entries()){
      assert(pad>=0&&pad<=.3);
      assert((track.cuts[i]??track.end)+pad<=sources.tracks[voice].duration);
    }
  }
  for(const u of weeks[1].practice.units)for(const track of Object.values(u.audio))for(const path of [...track.chunks,...track.buildUp,track.full])assert(path.includes('/practice-v2/'));
});
