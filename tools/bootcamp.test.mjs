import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {setImmediate as flush} from 'node:timers/promises';
import {nextSessionAt,remainingTime,zoomSessionUrl} from '../docs/bootcamp-time.mjs';
const first=Date.parse('2026-11-18T20:00:00+09:00');

test('weekly sessions are Wednesday 20:00 Korea, including the first and week boundaries',()=>{
  assert.equal(nextSessionAt(Date.parse('2026-11-16T12:00:00Z')),first);
  assert.equal(nextSessionAt(first),first);
  assert.equal(nextSessionAt(first+1),Date.parse('2026-11-25T20:00:00+09:00'));
  assert.equal(nextSessionAt(Date.parse('2026-12-31T00:00:00Z')),Date.parse('2027-01-06T20:00:00+09:00'));
});
test('the same instant targets the same session across viewer timezones and daylight saving',()=>{
  const url=new URL('../docs/bootcamp-time.mjs',import.meta.url).href;
  const code=`import {nextSessionAt} from ${JSON.stringify(url)};console.log(nextSessionAt(Date.parse('2027-03-10T09:00:00Z')))`;
  for(const TZ of ['Asia/Seoul','Australia/Melbourne','America/New_York','UTC']){
    const result=Number(execFileSync(process.execPath,['--input-type=module','-e',code],{env:{...process.env,TZ},encoding:'utf8'}));
    assert.equal(result,Date.parse('2027-03-10T20:00:00+09:00'));
  }
});
test('remaining time uses the actual clock after a paused tab and clamps to zero',()=>{
  assert.deepEqual(remainingTime(first,first-((86400+2*3600+3*60+4)*1000)),{days:1,hours:2,minutes:3,seconds:4,ended:false});
  assert.equal(remainingTime(first,first-1).seconds,1);
  assert.deepEqual(remainingTime(first,first+1000),{days:0,hours:0,minutes:0,seconds:0,ended:true});
});
test('Zoom links preserve passcodes and reject unexpected hosts/protocols',()=>{
  const url='https://us02web.zoom.us/j/123456789?pwd=a%2Bb%3D&omn=456';
  assert.equal(zoomSessionUrl(url),url);
  assert.equal(zoomSessionUrl(''),null);
  for(const bad of ['https://zoom.us.example.com/j/1','javascript:alert(1)','http://zoom.us/j/1','https://user@zoom.us/j/1'])assert.throws(()=>zoomSessionUrl(bad));
});
const source=fs.readFileSync(new URL('../docs/bootcamp.js',import.meta.url),'utf8').replace(/^import .*;\n/m,'');
const release=JSON.parse(fs.readFileSync(new URL('../docs/free-weeks.json',import.meta.url),'utf8'));
async function app(){
  let now=first-65000,session={zoomUrl:''},failed=false;
  const intervals=new Map(),elements=new Map(),events=new Map(),practice=[{},{}];
  function element(id){
    if(!elements.has(id))elements.set(id,{hidden:false,textContent:'',setAttribute(k,v){this[k]=v;},removeAttribute(k){delete this[k];}});
    return elements.get(id);
  }
  class Clock extends Date {static now(){return now;}}
  vm.runInNewContext(source,{
    Date:Clock,Intl,URL,nextSessionAt:()=>nextSessionAt(now),remainingTime:target=>remainingTime(target,now),zoomSessionUrl,
    document:{hidden:false,querySelector:element,querySelectorAll:()=>practice,addEventListener:(name,cb)=>events.set(name,cb)},
    window:{addEventListener(){}},setInterval:(cb,ms)=>{intervals.set(ms,cb);return ms;},clearInterval(){},
    fetch:async path=>({ok:!failed,json:async()=>path==='free-weeks.json'?release:session}),
  });
  await flush();
  return {element,practice,tick:()=>intervals.get(1000)(),refresh:async()=>{await intervals.get(30000)();await flush();},advance:ms=>{now+=ms;},session:value=>{session=value;},fail:()=>{failed=true;},resume:()=>events.get('visibilitychange')()};
}
test('page ticks from actual current time and waits at zero until the link is supplied',async()=>{
  const a=await app();assert.equal(a.element('#countdown-minutes').textContent,'01');assert.equal(a.element('#countdown-seconds').textContent,'05');
  a.advance(1000);a.tick();assert.equal(a.element('#countdown-seconds').textContent,'04');
  a.advance(60000);a.tick();assert.equal(a.element('#countdown-seconds').textContent,'04');assert.equal(a.element('#countdown-minutes').textContent,'00');
  a.advance(9000);a.tick();assert.equal(a.element('#countdown-seconds').textContent,'00');assert(a.element('#session-status').textContent.includes('시작 시간이'));
  assert.deepEqual(a.practice.map(link=>link.href),['free.html#week-03','free.html#week-03']);
});
test('an open page toggles live Zoom without hiding the countdown',async()=>{
  const a=await app();assert.equal(a.element('#session-countdown').hidden,false);assert.equal(a.element('#zoom-link').hidden,true);
  const url='https://us02web.zoom.us/j/123?pwd=a%2Bb';a.session({zoomUrl:url,sessionLabel:'이번 주 세션'});await a.refresh();
  assert.equal(a.element('#session-countdown').hidden,false);assert.equal(a.element('#zoom-link').href,url);assert.equal(a.element('#zoom-link').hidden,false);
  a.session({zoomUrl:''});await a.refresh();assert.equal(a.element('#session-countdown').hidden,false);assert.equal(a.element('#zoom-link').hidden,true);assert.equal(a.element('#zoom-link').href,undefined);
  a.fail();await a.refresh();a.advance(1000);a.tick();assert.equal(a.element('#countdown-seconds').textContent,'04');
});

test('a live Zoom link keeps ticking and remains available when the counter reaches zero',async()=>{
  const a=await app();a.session({zoomUrl:'https://uni-sydney.zoom.us/j/88303049321'});await a.refresh();
  assert.equal(a.element('#session-countdown').hidden,false);assert.equal(a.element('#zoom-link').hidden,false);
  a.advance(1000);a.tick();assert.equal(a.element('#countdown-seconds').textContent,'04');
  a.advance(70000);a.tick();assert.equal(a.element('#countdown-seconds').textContent,'00');
  assert(a.element('#session-status').textContent.includes('Zoom 입장 버튼'));
  await a.refresh();assert(a.element('#session-status').textContent.includes('Zoom 입장 버튼'));
  assert.equal(a.element('#zoom-link').hidden,false);assert.equal(a.element('#session-countdown').hidden,false);
});
