import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const code = readFileSync(new URL('../docs/analytics.js', import.meta.url), 'utf8');
function run({hostname='willow-baek.github.io', pathname='/igp-patient-communication/', excluded=false, blocked=false}={}) {
  const scripts=[], listeners={};
  let saved=excluded?'1':null, reloads=0;
  const window={addEventListener:(name,fn)=>listeners[name]=fn};
  const location={hostname,pathname,reload:()=>reloads++};
  const localStorage={getItem(){if(blocked)throw Error('blocked');return saved;}};
  vm.runInNewContext(code,{window,location,localStorage,document:{createElement:()=>({}),head:{append:s=>scripts.push(s)}}});
  return {window,scripts,excludeInOtherTab(){saved='1';listeners.storage({key:'igp-analytics-excluded',newValue:'1'});},get reloads(){return reloads;}};
}
test('normal public visits load the existing GA measurement tag',()=>{
  const r=run();assert.equal(r.scripts.length,1);assert.match(r.scripts[0].src,/G-E16NK3VL70$/);assert.equal(r.window.dataLayer[1][0],'config');
});
test('excluded browsers never load GA, including after changing country/network',()=>{
  const r=run({excluded:true});assert.equal(r.scripts.length,0);assert.equal(r.window['ga-disable-G-E16NK3VL70'],true);
});
test('localhost, file previews and unrelated hosted paths never load GA',()=>{
  for(const options of [{hostname:'localhost'},{hostname:'127.0.0.1'},{hostname:''},{pathname:'/another-site/'}]) assert.equal(run(options).scripts.length,0);
});
test('unavailable storage fails closed',()=>assert.equal(run({blocked:true}).scripts.length,0));
test('excluding another tab immediately disables tracking in an open study tab',()=>{
  const r=run();r.excludeInOtherTab();assert.equal(r.window['ga-disable-G-E16NK3VL70'],true);assert.equal(r.reloads,1);
});
