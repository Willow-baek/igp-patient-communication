import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {practiceForLine,practiceSteps,practiceHighlightSlices} from '../docs/practice-model.mjs';
import {createLongPress,createMouseClicks} from '../docs/long-press.mjs';

const weeks=JSON.parse(fs.readFileSync(new URL('../docs/weeks.json',import.meta.url))).weeks;
const practiceWeeks=weeks.filter(week=>week.practice);
test('every published unit covers the unchanged script and has complete voice tracks',()=>{
  for(const week of practiceWeeks){assert(week.practice.units.length>0);
  for(const unit of week.practice.units){
    for(const line of unit.lines)assert.equal(practiceForLine(week,line),unit);
    for(const voice of ['female','male']){
      const steps=practiceSteps(unit,voice);
      const groups=unit.sentences||[unit];
      assert.equal(steps.length,groups.reduce((n,g)=>n+g.chunks.length*2-1,0));
      assert.equal(steps.at(-1).text,groups.at(-1).text);
      for(const step of steps)assert(fs.statSync(new URL('../docs/'+step.url,import.meta.url)).size>0);
      for(const step of steps.filter(s=>s.kind==='build'||s.kind==='full'))assert(groups[step.sentenceIndex??0].text.startsWith(step.text));
    }
    if(unit.speaker==='Patient')assert.deepEqual(practiceSteps(unit,'female'),practiceSteps(unit,'male'));
  }}
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

});


test('every practice step highlights exactly its source words in the existing bubbles',()=>{
  for(const week of practiceWeeks)for(const unit of week.practice.units)for(const step of practiceSteps(unit,'female')){
    const slices=practiceHighlightSlices(week,unit,step);
    assert.equal(slices.map(p=>p.selected).filter(Boolean).join(' '),step.text);
    for(const part of slices)assert.equal(part.before+part.selected+part.after,week.lines[part.index].en);
    assert.equal(unit.text.slice(step.start,step.end),step.text);
  }
});
test('repeated phrases are highlighted by source offsets rather than the first text match',()=>{
  const unit={lines:[0],text:'go again go again',chunks:['go again','go again'],speaker:'Patient',audio:{patient:{chunks:['a','b'],buildUp:['full'],full:'full'}}};
  const week={lines:[{en:unit.text}]};
  const step=practiceSteps(unit,'female')[1];
  assert.deepEqual(practiceHighlightSlices(week,unit,step),[{index:0,before:'go again ',selected:'go again',after:''}]);
});


test('reviewed practice favors recorded pauses and meaningful phrases rather than a word cap',()=>{
  const plan=JSON.parse(fs.readFileSync(new URL('./practice-breath-review-2026-11-09.json',import.meta.url)));
  assert.equal(plan.weeks.reduce((n,w)=>n+w.units.length+w.wholeBubbleLines.length,0),48);
  assert.deepEqual(weeks[2].practice.units[0].chunks,["Can you tell me more about","what's been happening","with your back?"]);
  const meeting=practiceForLine(weeks[1],4);
  assert.deepEqual(meeting.chunks,['So sitting through a 30-minute meeting more comfortably','would be useful?']);
  assert(meeting.chunks[0].split(' ').length>6);
  for(const week of plan.weeks)for(const unit of week.units){
    if(unit.preservedUnit)continue;
    for(const track of Object.values(unit.tracks)){
      const bounds=[track.start,...track.cuts,track.end];
      assert(bounds.every((v,i)=>!i||v>bounds[i-1]));
      assert(track.end<=track.duration+.001);
      for(const review of track.boundaryReview){
        assert(['audible-pause-candidate','meaning-boundary-without-long-pause'].includes(review.reason));
        if(review.quietInterval)assert(review.cut>=review.quietInterval.start&&review.cut<=review.quietInterval.end);
      }
    }
  }
});
test('completed sentences and short one-breath utterances remain independent',()=>{
  const week=weeks[1];
  for(const index of [5,7,8,10,13])assert.equal(practiceForLine(week,index),null);
  for(const index of [9,11,12]){
    const unit=practiceForLine(week,index);
    assert.deepEqual(unit.lines,[index]);
    assert.equal(unit.text,week.lines[index].en);
  }
  for(const week of practiceWeeks)for(const unit of week.practice.units){
    assert(unit.lines.slice(0,-1).every(i=>!/[.!?]$/.test(week.lines[i].en.trim())));
    for(const step of practiceSteps(unit,'female'))assert(unit.text.includes(step.text));
  }
});
test('a question inside a bubble excludes the preceding acknowledgement from audio and highlighting',()=>{
  const week=weeks[2],unit=practiceForLine(week,2);
  assert.equal(unit.text,'Whereabouts in your back do you feel it?');
  assert.equal(week.lines[2].en.slice(unit.range.start,unit.range.end),unit.text);
  for(const step of practiceSteps(unit,'female')){
    const [slice]=practiceHighlightSlices(week,unit,step);
    assert(slice.before.startsWith('Okay. '));
    assert.equal(slice.selected,step.text);
    assert.equal(slice.before+slice.selected+slice.after,week.lines[2].en);
  }
  const invalid=structuredClone(week);
  invalid.practice.units.find(u=>u.id===unit.id).range.start=-1;
  assert.equal(practiceForLine(invalid,2),null);
  const middle=structuredClone(week);
  middle.practice.units.find(u=>u.id===unit.id).range.start+=2;
  assert.equal(practiceForLine(middle,2),null);
});
test('runtime rejects a merged finished sentence even if its text matches the script',()=>{
  const week=structuredClone(weeks[1]);
  const goal=week.practice.units.find(u=>u.lines.includes(11));
  goal.lines.unshift(10);goal.text=week.lines[10].en+' '+goal.text;goal.chunks.unshift(week.lines[10].en);
  assert.equal(practiceForLine(week,11),null);
});

test('independent question audio starts after the preceding sentence has finished',()=>{
  const plan=JSON.parse(fs.readFileSync(new URL('./week-02-practice-bubbles-v5.json',import.meta.url)));
  const original=JSON.parse(fs.readFileSync(new URL('./week-02-audio-boundaries.json',import.meta.url)));
  for(const voice of ['female','male']){
    const question=plan.tracks[voice].find(t=>plan.units[t.unit].id==='w2-turn-09-bubble-1');
    const preceding=original.tracks[voice].clips.find(c=>c.line===11);
    assert(question.start>=preceding.speechEnd);
    const priority=plan.tracks[voice].find(t=>plan.units[t.unit].id==='w2-priority-question');
    const mentioned=original.tracks[voice].clips.find(c=>c.line===7);
    assert(priority.start>=mentioned.speechEnd);
  }
});

test('Week 4 patient practice begins with the first displayed sentence, including Not really',()=>{
  const week=weeks.find(w=>w.id==='week-04');
  for(const index of [1,3,5,7,9,11,15,17]){
    const unit=practiceForLine(week,index);assert(unit,`line ${index+1} has practice`);
    for(const voice of ['female','male']){
      const steps=practiceSteps(unit,voice);
      assert.equal(steps[0].start,0);
      assert(week.lines[index].en.startsWith(steps[0].text));
      const selected=steps.map(s=>week.lines[index].en.slice(s.start,s.end));
      assert.deepEqual(selected,steps.map(s=>s.text));
      for(const sentence of unit.sentences||[unit]){
        const range=sentence.range||{start:0,end:unit.text.length};
        assert(steps.some(s=>s.start===range.start&&s.end===range.end&&s.text===sentence.text));
      }
    }
  }
  assert.equal(practiceSteps(practiceForLine(week,7),'female')[0].text,'Not really.');
});

test('multi-sentence practice resets prefixes at each sentence and rejects skipped or incomplete groups',()=>{
  const week=weeks.find(w=>w.id==='week-04');
  for(const unit of week.practice.units.filter(u=>u.sentences)){
    const steps=practiceSteps(unit,'female');
    for(const [index,sentence] of unit.sentences.entries()){
      const group=steps.filter(s=>s.sentenceIndex===index);
      assert(group.length>0);assert.equal(group[0].start,sentence.range.start);
      assert.equal(group.at(-1).end,sentence.range.end);
      for(const step of group){assert(step.start>=sentence.range.start&&step.end<=sentence.range.end);}
    }
  }
  const skipped=structuredClone(week),unit=skipped.practice.units.find(u=>u.sentences);
  unit.sentences.shift();assert.equal(practiceForLine(skipped,unit.lines[0]),null);
  const missing=structuredClone(week.practice.units.find(u=>u.sentences));
  delete missing.sentences[1].audio.patient;
  assert.deepEqual(practiceSteps(missing,'female'),[]);
});

test('Week 4 follows every user-selected slash, including the explicit cross-sentence chunk',()=>{
  const week=weeks.find(w=>w.id==='week-04');
  const plan=JSON.parse(fs.readFileSync(new URL('./week-04-all-manual-v7.json',import.meta.url)));
  const turns=plan.userTurns.map(text=>text.split('/').map(chunk=>chunk.trim()));
  const closing=turns.pop();turns.push(closing.slice(0,2),closing.slice(2));
  assert.equal(turns.length,week.lines.length);
  assert.equal(turns.flat().length,70);
  for(const [index,chunks] of turns.entries()){
    const unit=practiceForLine(week,index);assert(unit,`line ${index+1} exposes practice`);
    assert.equal(unit.userSelected,true);
    assert.deepEqual((unit.sentences||[unit]).flatMap(group=>group.chunks),chunks);
    for(const voice of ['female','male'])assert(practiceSteps(unit,voice).length>0);
  }
  assert.equal(practiceForLine(week,5).chunks[1],'over the last few weeks. Initially, I only felt it occasionally,');
});
