import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto,createHash} from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';
import {setImmediate as flush} from 'node:timers/promises';
import {passwordMatches,accessMarker} from '../docs/free-access.mjs';
const config={version:'test-v1',salt:'fixture-salt',digest:createHash('sha256').update('fixture-salt:review-pass').digest('hex')};
const code=fs.readFileSync(new URL('../docs/free-access.mjs',import.meta.url),'utf8').replace(/^export /gm,'');

test('entry verifier matches the configured password without storing plaintext',async()=>{
  assert(await passwordMatches('review-pass',config,webcrypto));
  for(const value of ['wrong','', 'review-pass '])assert.equal(await passwordMatches(value,config,webcrypto),false);
  assert.notEqual(accessMarker(config),accessMarker({...config,version:'test-v2'}));
});
async function gate({saved,storageBlocked=false,failed=false,configuration=config}={}){
  const nodes=new Map();let locked=true;
  const element=id=>{
    if(!nodes.has(id))nodes.set(id,{hidden:false,disabled:id==='#access-submit',value:'',textContent:'',
      addEventListener(name,cb){this[name]=cb;},setAttribute(k,v){this[k]=v;},focus(){},select(){}});
    return nodes.get(id);
  };
  const sandbox={crypto:webcrypto,TextEncoder,fetch:async()=>({ok:!failed,json:async()=>configuration}),
    document:{querySelector:element,documentElement:{removeAttribute(){locked=false;}}},
    localStorage:{getItem(){if(storageBlocked)throw Error();return saved;},setItem(k,v){if(storageBlocked)throw Error();saved=v;}},
  };
  vm.createContext(sandbox);vm.runInContext(code,sandbox);
  const pending=sandbox.requestFreeAccess();await flush();
  return {element,pending,locked:()=>locked,saved:()=>saved};
}
test('first visit stays at entry; wrong input stays locked and correct input persists entry',async()=>{
  const a=await gate();assert(a.locked());assert.equal(a.element('#access-submit').disabled,false);
  a.element('#access-password').value='wrong';await a.element('#access-form').submit({preventDefault(){}});
  assert(a.locked());assert(a.element('#access-feedback').textContent.includes('맞지'));
  a.element('#access-password').value='review-pass';await a.element('#access-form').submit({preventDefault(){}});
  assert.equal(await a.pending,true);assert.equal(a.locked(),false);assert.equal(a.saved(),accessMarker(config));assert.equal(a.element('#access-password').value,'');
});
test('returning browser skips the form, but changing password version asks again',async()=>{
  const a=await gate({saved:accessMarker(config)});assert.equal(await a.pending,true);assert.equal(a.locked(),false);
  const b=await gate({saved:accessMarker(config),configuration:{...config,version:'test-v2'}});assert(b.locked());assert.equal(b.element('#access-submit').disabled,false);
});
test('a browser with blocked storage can still enter for the current page',async()=>{
  const a=await gate({storageBlocked:true});a.element('#access-password').value='review-pass';await a.element('#access-form').submit({preventDefault(){}});
  assert.equal(await a.pending,true);assert.equal(a.locked(),false);
});
test('failed or malformed entry settings keep the page closed with recovery guidance',async()=>{
  for(const options of [{failed:true},{configuration:{...config,digest:'invalid'}}]){
    const a=await gate(options);assert.equal(await a.pending,false);assert(a.locked());assert(a.element('#access-submit').disabled);assert(a.element('#access-feedback').textContent.includes('새로고침'));
  }
});
