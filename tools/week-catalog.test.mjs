import {installWeekStudy,patternMarkup} from '../docs/week-study.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {setImmediate as tick} from 'node:timers/promises';
import {selectPublishedWeeks} from '../docs/week-catalog.mjs';
import {resolveAudio} from '../docs/audio-source.mjs';

const content=JSON.parse(fs.readFileSync(new URL('../docs/weeks.json',import.meta.url),'utf8'));
const study=JSON.parse(fs.readFileSync(new URL('../docs/week-04-study.json',import.meta.url),'utf8'));
const release=JSON.parse(fs.readFileSync(new URL('../docs/free-weeks.json',import.meta.url),'utf8'));
const appSource=fs.readFileSync(new URL('../docs/app.js',import.meta.url),'utf8').replace(/^import .*?;\n/gm,'');

test('free release reuses canonical Week 1 and adding IDs reveals weeks in source order',()=>{
  assert.deepEqual(release.publishedWeekIds,['week-01']);
  const initial=selectPublishedWeeks(content.weeks,release.publishedWeekIds);
  assert.equal(initial.length,1);assert.equal(initial[0],content.weeks[0]);
  assert.deepEqual(selectPublishedWeeks(content.weeks,['week-03','week-01','week-02']).map(w=>w.id),['week-01','week-02','week-03']);
  assert.deepEqual(selectPublishedWeeks(content.weeks,[]),[]);
  for(const invalid of [undefined,null,'all',['week-99']])assert.throws(()=>selectPublishedWeeks(content.weeks,invalid));
});

async function load({free=false,hash='',failedRelease=false,failedStudy=false,staleStudy=false}={}){
  const elements=new Map(),requests=[],replaced=[];
  function element(id){
    if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',disabled:false,hidden:false,style:{},append(){},setAttribute(){},classList:{add(){},remove(){}}});
    return elements.get(id);
  }
  const sandbox={createBrowserVoice:()=>({}),selectPublishedWeeks,resolveAudio,installWeekStudy,patternMarkup,createWorkbook:()=>({mount(){},stop(){},handleClick(){return false;}}),
    createPractice:()=>({decorate(){},close(){},syncPlayback(){}}),Audio:class {},
    localStorage:{getItem(){return null;}},
    document:{documentElement:{dataset:free?{releaseConfig:'free-weeks.json'}:{}},querySelector:element,querySelectorAll(){return [];},addEventListener(){}},
    window:{addEventListener(){}},location:{hash},history:{replaceState(...args){replaced.push(args[2]);}},
    matchMedia:()=>({matches:false,addEventListener(){}}),setTimeout,clearTimeout,
    fetch:async url=>{requests.push(url);return {ok:!((url==='free-weeks.json'&&failedRelease)||(url==='week-04-study.json'&&failedStudy)),json:async()=>url==='weeks.json'?content:url==='week-04-study.json'?(staleStudy?{...study,baseScriptRevision:'stale'}:study):release};},
  };
  vm.createContext(sandbox);vm.runInContext(appSource,sandbox);await tick();
  return {elements,requests,replaced};
}

test('main entry retains all weeks and never loads the free release list',async()=>{
  const result=await load({hash:'#week-04'});
  assert.deepEqual(result.requests,['weeks.json','week-04-study.json']);
  assert(result.elements.get('#content').innerHTML.includes('패턴 쉐도잉'));
  assert.equal((result.elements.get('#content').innerHTML.match(/data-play=/g)||[]).length,27);
  const nav=result.elements.get('#weeks').innerHTML;
  for(const week of content.weeks)assert(nav.includes(`data-week="${week.id}"`));
  assert(result.elements.get('#content').innerHTML.includes(content.weeks[3].shortTitle));
});

test('free entry cannot select a hidden week with its URL hash',async()=>{
  const result=await load({free:true,hash:'#week-04'});
  assert.deepEqual(result.requests,['weeks.json','free-weeks.json']);
  const nav=result.elements.get('#weeks').innerHTML;
  assert(nav.includes('data-week="week-01"'));
  for(const week of content.weeks.slice(1))assert(!nav.includes(`data-week="${week.id}"`));
  assert(result.elements.get('#content').innerHTML.includes(content.weeks[0].title));
  assert.deepEqual(result.replaced,['#week-01']);
});

test('a failed free release request does not fall back to displaying the full catalogue',async()=>{
  const result=await load({free:true,failedRelease:true});
  assert(result.elements.get('#content').innerHTML.includes('class="error"'));
  assert(!result.elements.get('#weeks')?.innerHTML);
});

test('free entry adds only its entry check while sharing the main layout, assets and guide',()=>{
  const main=fs.readFileSync(new URL('../docs/index.html',import.meta.url),'utf8');
  const free=fs.readFileSync(new URL('../docs/free.html',import.meta.url),'utf8');
  assert(free.includes('data-free-locked'));
  assert(free.includes('id="access-password"'));
  const shared=free
    .replace(/ data-study-app="app\.js\?v=\d+"/,'')
    .replace('<html lang="ko" data-free-locked data-release-config="free-weeks.json">','<html lang="ko">')
    .replace('href="./free.html"','href="./"')
    .replace('<link rel="stylesheet" href="free-access.css?v=1">','')
    .replace(/<section id="free-access"[\s\S]*?<\/section>/,'')
    .replace('src="free-entry.mjs?v=1"',main.match(/src="app\.js\?v=\d+"/)[0]);
  assert.equal(shared,main);
});


test('missing study module falls back to the canonical Week 4 dialogue',async()=>{
  const result=await load({hash:'#week-04',failedStudy:true});
  const html=result.elements.get('#content').innerHTML;
  assert.equal((html.match(/data-play=/g)||[]).length,20);
  assert(!html.includes('role="tablist"'));assert(html.includes('대화는 그대로 연습'));
});


test('a stale study module keeps normal dialogue and does not show the workbook',async()=>{
 const result=await load({hash:'#week-04',staleStudy:true});const html=result.elements.get('#content').innerHTML;
 assert.equal((html.match(/data-play=/g)||[]).length,20);assert(!html.includes('role="tablist"'));
});
