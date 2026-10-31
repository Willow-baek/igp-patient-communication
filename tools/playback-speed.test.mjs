// Regression coverage for real app playback paths, including load() rate resets.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {resolveAudio} from '../docs/audio-source.mjs';

const script=fs.readFileSync(new URL('../docs/app.js',import.meta.url),'utf8').replace(/^import .*?;\n/,'');
const content=JSON.parse(fs.readFileSync(new URL('../docs/weeks.json',import.meta.url))).weeks;
function app(weekIndex=1,voice='female'){
  const elements=new Map(),listeners=new Map(),timers=new Map();let timerId=0;
  const element=id=>{
    if(!elements.has(id))elements.set(id,{value:'1',textContent:'',disabled:false,
      classList:{add(){},remove(){}},setAttribute(){},append(){},scrollIntoView(){}});
    return elements.get(id);
  };
  class Media{
    constructor(){this.defaultPlaybackRate=1;this.playbackRate=1;this.plays=[];}
    load(){this.playbackRate=this.defaultPlaybackRate;queueMicrotask(()=>this.onloadedmetadata?.());}
    play(){this.plays.push({url:this.src,rate:this.playbackRate});return Promise.resolve();}
    pause(){}
  }
  const sandbox={resolveAudio,Audio:Media,localStorage:{getItem(){return null;}},
    document:{querySelector:element,querySelectorAll(){return [];},addEventListener:(name,fn)=>listeners.set(name,fn)},
    window:{addEventListener(){}},matchMedia:()=>({matches:false,addEventListener(){}}),
    fetch:()=>new Promise(()=>{}),setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id),
  };
  vm.createContext(sandbox);
  vm.runInContext(script+'\nglobalThis.controller={play,stop,audio,setWeek(w,v){week=w;physioVoice=v;},getRate(){return playbackRate;}};',sandbox);
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
