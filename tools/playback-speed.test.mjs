import {installWeekStudy,patternMarkup} from '../docs/week-study.mjs';
// Regression coverage for real app playback paths, including load() rate resets.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {resolveAudio} from '../docs/audio-source.mjs';

const script=fs.readFileSync(new URL('../docs/app.js',import.meta.url),'utf8').replace(/^import .*?;\n/gm,'');
const content=JSON.parse(fs.readFileSync(new URL('../docs/weeks.json',import.meta.url))).weeks;
function app(weekIndex=1,voice='female',{deferLoad=false}={}){
  const elements=new Map(),listeners=new Map(),timers=new Map();let timerId=0;
  const element=id=>{
    if(!elements.has(id))elements.set(id,{value:'1',textContent:'',disabled:false,
      classList:{add(){},remove(){}},setAttribute(){},append(){},scrollIntoView(){}});
    return elements.get(id);
  };
  class Media{
    constructor(){this.defaultPlaybackRate=1;this.playbackRate=1;this.plays=[];this.paused=true;this.currentTime=0;this.loads=0;}
    load(){this.loads++;this.playbackRate=this.defaultPlaybackRate;if(!deferLoad)queueMicrotask(()=>this.onloadedmetadata?.());}
    play(){this.paused=false;this.plays.push({url:this.src,rate:this.playbackRate});return Promise.resolve();}
    pause(){this.paused=true;}
  }
  const sandbox={createBrowserVoice:()=>({}),resolveAudio,installWeekStudy,patternMarkup,createWorkbook:()=>({mount(){},stop(){},handleClick(){return false;}}),createPractice:()=>({close(){},syncPlayback(){},handleClick(){return false;}}),Audio:Media,localStorage:{getItem(){return null;}},
    document:{querySelector:element,querySelectorAll(){return [];},addEventListener:(name,fn)=>listeners.set(name,fn)},
    window:{addEventListener(){}},matchMedia:()=>({matches:false,addEventListener(){}}),
    fetch:()=>new Promise(()=>{}),setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id),
  };
  vm.createContext(sandbox);
  vm.runInContext(script+'\nglobalThis.controller={play,stop,audio,toggleLine,setWeek(w,v){week=w;physioVoice=v;},getRate(){return playbackRate;}};',sandbox);
  const c=sandbox.controller;c.setWeek(content[weekIndex],voice);
  return {...c,element,select(value){element('#speed').value=value;listeners.get('change')({target:{id:'speed',value}});},
    async next(){assert.equal(timers.size,1);const [id,fn]=timers.entries().next().value;timers.delete(id);await fn();}};
}

test('every offered speed survives loading for both weeks, both voices, and both roles',async()=>{
  for(const weekIndex of [0,1])for(const voice of ['female','male'])for(const rate of ['0.75','0.9','1','1.1','1.25']){
    const a=app(weekIndex,voice);a.select(rate);
    const patientIndex=content[weekIndex].lines.findIndex(l=>l.speaker==='Patient');
    for(const index of [0,patientIndex]){
      await a.play(index);
      assert.equal(a.audio.plays.at(-1).rate,Number(rate));
      assert.equal(a.audio.defaultPlaybackRate,Number(rate));
    }
  }
});

test('changing speed during loading uses the latest selection',async()=>{
  const a=app();a.select('0.75');const loading=a.play(0);a.select('1.25');await loading;
  assert.equal(a.audio.plays.at(-1).rate,1.25);
});

test('live speed changes survive the next individual playback',async()=>{
  const a=app();await a.play(0);a.select('0.75');
  assert.equal(a.audio.playbackRate,.75);
  await a.play(1);assert.equal(a.audio.plays.at(-1).rate,.75);
});

test('full dialogue keeps the rate across patient/physio files and changes during gaps',async()=>{
  for(const voice of ['female','male']){
    const a=app(1,voice);a.select('0.75');await a.play(0,true);
    for(let i=1;i<content[1].lines.length;i++){
      a.audio.onended();
      if(i===1)a.select('1.25');
      await a.next();
      assert.equal(a.audio.plays.at(-1).rate,1.25);
    }
    assert.equal(a.audio.plays.length,content[1].lines.length);
    a.audio.onended();assert.equal(a.element('#playAll').textContent,'전체 듣기');
  }
});


test('practice audio uses the same selected speed as normal dialogue',async()=>{
  const unit=content[1].practice.units[0];
  for(const voice of ['female','male'])for(const rate of ['0.75','0.9','1','1.1','1.25']){
    const a=app(1,voice);a.select(rate);
    const url=unit.audio[voice].chunks[0];
    await a.play(unit.lines[0],false,{url,start:0,end:null});
    assert.equal(a.audio.plays.at(-1).url,url);
    assert.equal(a.audio.plays.at(-1).rate,Number(rate));
  }
});


test('same dialogue button pauses and resumes at the saved position without loading again',async()=>{
  for(const voice of ['female','male'])for(const index of [0,1]){
    const a=app(3,voice);a.select('0.75');await a.toggleLine(index);
    a.audio.currentTime=1.23;const loads=a.audio.loads;
    await a.toggleLine(index);assert.equal(a.audio.paused,true);assert.equal(a.audio.currentTime,1.23);
    await a.toggleLine(index);assert.equal(a.audio.paused,false);assert.equal(a.audio.currentTime,1.23);
    assert.equal(a.audio.loads,loads);assert.equal(a.audio.playbackRate,.75);
    a.audio.onended();await a.toggleLine(index);
    assert.equal(a.audio.loads,loads+1);assert.equal(a.audio.currentTime,0);
  }
});
test('pausing while metadata loads prevents unwanted playback and still allows resume',async()=>{
  const a=app(3,'female',{deferLoad:true});const pending=a.toggleLine(1);
  await a.toggleLine(1);a.audio.onloadedmetadata();await pending;
  assert.equal(a.audio.plays.length,0);assert.equal(a.audio.paused,true);
  await a.toggleLine(1);assert.equal(a.audio.plays.length,1);
});
test('another line or full-dialogue playback resets the paused position',async()=>{
  const a=app(3);await a.toggleLine(1);a.audio.currentTime=1.23;await a.toggleLine(1);
  await a.toggleLine(3);assert.equal(a.audio.paused,false);assert.equal(a.audio.currentTime,0);
  await a.toggleLine(3);await a.play(0,true);assert.equal(a.audio.paused,false);
  await a.toggleLine(0);assert.equal(a.audio.loads,4);assert.equal(a.audio.currentTime,0);
  a.stop();assert.equal(a.element('#playAll').textContent,'전체 듣기');
});


test('the 27-bubble Week 4 study dialogue plays all sentences in order for both voices',async()=>{
 const data=JSON.parse(fs.readFileSync(new URL('../docs/week-04-study.json',import.meta.url)));
 const w=installWeekStudy(content,data)[3];
 for(const voice of ['female','male']){
  const a=app(3,voice);a.setWeek(w,voice);await a.play(0,true);
  for(let i=1;i<w.lines.length;i++){a.audio.onended();await a.next();}
  assert.equal(a.audio.plays.length,27);
  assert.deepEqual(a.audio.plays.map(p=>p.url),w.lines.map(l=>resolveAudio(l,w,voice).url));
  a.audio.onended();assert.equal(a.element('#playAll').textContent,'전체 듣기');
 }
});
