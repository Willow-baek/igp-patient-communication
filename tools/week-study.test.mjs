import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {installWeekStudy,patternMarkup,phraseRanges,normalizeAnswer,createQuizSession} from '../docs/week-study.mjs';
import {resolveAudio} from '../docs/audio-source.mjs';
import {practiceForLine,practiceSteps} from '../docs/practice-model.mjs';
const weeks=JSON.parse(fs.readFileSync(new URL('../docs/weeks.json',import.meta.url))).weeks;
const module=JSON.parse(fs.readFileSync(new URL('../docs/week-04-study.json',import.meta.url)));
const study=installWeekStudy(weeks,module)[3];
test('main study variant reconstructs the exact English/Korean dialogue and preserves other weeks',()=>{
 const result=installWeekStudy(weeks,module);
 for(let i=0;i<3;i++)assert.equal(result[i],weeks[i]);
 assert.notEqual(study, weeks[3]);assert.equal(study.lines.length,27);
 for(let i=0;i<20;i++)for(const lang of ['en','ko'])assert.equal(study.lines.filter(l=>l.sourceLine===i).map(l=>l[lang]).join(' '),weeks[3].lines[i][lang]);
 for(const line of study.lines.filter(l=>l.speaker==='Patient'))assert(!/[.!?]\s+\S/.test(line.en));
});
test('a changed source revision, changed line, broken order or incomplete workbook safely rejects study data',()=>{
 for(const change of [d=>d.baseScriptRevision='stale',d=>d.baseLines[0].en+='!',d=>d.lines.reverse(),d=>d.patterns[0].exercises.pop()]){
  const d=structuredClone(module);change(d);assert.equal(installWeekStudy(weeks,d),weeks);
 }
});
test('every sentence and practice stage has audio, correct text, and preserved patient voice',()=>{
 let count=0;
 for(let i=0;i<study.lines.length;i++){
  const line=study.lines[i];for(const voice of ['female','male']){
   const source=resolveAudio(line,study,voice);assert(source);assert(fs.existsSync(new URL('../docs/'+source.url,import.meta.url)));
   const unit=practiceForLine(study,i);
   if(unit){const steps=practiceSteps(unit,voice);assert(steps.length);for(const s of steps){assert(fs.existsSync(new URL('../docs/'+s.url,import.meta.url)));assert.equal(unit.text.slice(s.start,s.end),s.text);}}
  }
  if(line.speaker==='Patient')assert.deepEqual(resolveAudio(line,study,'female'),resolveAudio(line,study,'male'));
  if(practiceForLine(study,i))count++;
 }
 assert.equal(count,24);
 const before=study.lines.findIndex(l=>l.en.startsWith("It's become")),after=before+1;
 assert.equal(practiceForLine(study,before).chunks.at(-1),'over the last few weeks.');
 assert.equal(practiceForLine(study,after).chunks[0],'Initially, I only felt it occasionally,');
});
test('pattern formatting preserves text, escapes HTML and does not emphasize variable symptoms',()=>{
 for(const l of study.lines){const html=patternMarkup(l.en,l.patternRanges);assert.equal(html.replace(/<[^>]+>/g,''),l.en.replaceAll('&','&amp;').replaceAll("'",'&#39;').replaceAll('\"','&quot;'));}
 const line=study.lines[0],html=patternMarkup(line.en,line.patternRanges);
 assert(html.includes('>how</strong> your back pain <strong'));assert(!html.includes('>back pain<'));
 assert.equal(patternMarkup('<img>',[{start:0,end:5}]),'<strong class="pattern-frame">&lt;img&gt;</strong>');
 assert.equal(patternMarkup('text',[{start:0,end:99}]),'text');
 assert(phraseRanges('Have you seen a GP about pain?',['Have you seen','about']).length===2);
});
test('all 18 workbook answers reconstruct the source answer sentences, including approved knee correction',()=>{
 assert.equal(module.patterns.length,6);assert.equal(module.patterns.flatMap(p=>p.exercises).length,18);
 assert.equal(module.patterns[0].exercises[1].answer,'knee pain after your run');
 for(const p of module.patterns)for(const q of p.exercises){assert(q.ko&&q.before&&q.answer&&q.after);assert((q.before+q.answer+q.after).endsWith('?'));}
});
test('answer checking accepts case/space/final punctuation but rejects missing or different words',()=>{
 assert.equal(normalizeAnswer('  Back   PAIN.  '),'back pain');
 const q=createQuizSession(module.patterns);q.start();q.setInput('   ');q.check();assert(q.state.empty);assert(!q.state.checked);
 q.setInput('back ache');q.check();assert(q.state.checked);assert(!q.state.correct);q.setInput('back pain');assert.equal(q.state.input,'back ache');
});
test('quiz runs three questions per pattern, records first attempts, retries only mistakes, and restarts',()=>{
 const q=createQuizSession(module.patterns);let seen=0;
 while(q.state.phase!=='result'){
  if(q.state.phase==='intro'){assert.equal(q.state.cursor%3,0);q.start();}
  const s=q.state;q.setInput(seen===1?'wrong':s.question.answer.toUpperCase()+'?');q.check();q.check();q.next();seen++;
 }
 assert.equal(seen,18);assert.equal(q.state.firstCorrect,17);assert.deepEqual(q.state.mistakes,['1-2']);
 q.retry();assert.equal(q.state.total,1);assert.equal(q.state.question.id,'1-2');q.setInput(q.state.question.answer);q.check();q.next();
 assert.equal(q.state.phase,'result');assert.equal(q.state.mistakes.length,0);assert.equal(q.state.firstCorrect,17);
 q.restart();assert.equal(q.state.phase,'intro');assert.equal(q.state.cursor,0);assert.equal(q.state.firstCorrect,0);
});
