import test from 'node:test';
import assert from 'node:assert/strict';
import {createBrowserVoice} from '../docs/shadow-voice.mjs';
function setup(voices){const utterances=[];let canceled=0;const voice=createBrowserVoice({speechSynthesis:{getVoices:()=>voices,speak:u=>utterances.push(u),cancel:()=>canceled++},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}}});return{voice,utterances,get canceled(){return canceled;}};}
test('example synthesis chooses English rather than the default Korean voice and preserves the full sentence',()=>{
 const a=setup([{lang:'ko-KR',default:true},{lang:'en-US'},{lang:'en-AU'}]);let ended=0;
 a.voice.speak('How did your back pain first start?',{rate:.9,onEnd:()=>ended++,onError:()=>assert.fail()});
 const u=a.utterances[0];assert.equal(u.lang,'en-AU');assert.equal(u.rate,.9);assert.equal(u.text,'How did your back pain first start?');u.onend();assert.equal(ended,1);
});
test('cancel discards the old utterance callbacks so a stopped example cannot advance',()=>{
 const a=setup([{lang:'en-US'}]);a.voice.speak('Hello',{onEnd:()=>assert.fail(),onError:()=>assert.fail()});const u=a.utterances[0];a.voice.cancel();assert.equal(u.onend,null);assert.equal(u.onerror,null);assert.equal(a.canceled,1);
});
test('unsupported speech reports a recoverable failure',()=>{
 const voice=createBrowserVoice({});let errors=0;voice.speak('Hello',{onEnd:()=>assert.fail(),onError:()=>errors++});assert.equal(errors,1);
});
