// Practice metadata is tied to the exact script. Older content remains usable.
export function practiceForLine(week,index){
  const data=week?.practice;
  if(!data||data.scriptRevision!==week.scriptRevision)return null;
  const unit=Array.isArray(data.units)?data.units.find(u=>Array.isArray(u.lines)&&u.lines.includes(index)):null;
  if(!unit)return null;
  const lines=unit.lines.map(i=>week.lines[i]);
  if(lines.some(l=>!l)||new Set(lines.map(l=>l.speaker)).size!==1)return null;
  // A speaker turn may contain several sentences; practice cannot cross one.
  if(lines.slice(0,-1).some(l=>/[.!?][\"'”’)\]]*\s*$/.test(l.en)))return null;
  const joined=lines.map(l=>l.en).join(' ');
  let text=joined;
  if(unit.range){
    const {start,end}=unit.range;
    // A short response can precede the practice sentence in the same bubble.
    // Keep that response visible, but never include it in cumulative practice.
    if(lines.length!==1||!Number.isInteger(start)||!Number.isInteger(end)||start<0||end>joined.length||end<=start)return null;
    if(start>0&&!/[.!?][\"'”’)\]]*$/.test(joined.slice(0,start).trimEnd()))return null;
    if(end<joined.length&&!/[.!?][\"'”’)\]]*$/.test(joined.slice(start,end)))return null;
    text=joined.slice(start,end);
  }
  if(text!==unit.text)return null;
  if(unit.sentences){
    // A multi-sentence bubble starts at its first sentence. Prefix practice
    // restarts at each sentence boundary instead of merging finished sentences.
    if(lines.length!==1||unit.range||!Array.isArray(unit.sentences)||unit.sentences.length<2)return null;
    let cursor=0;
    for(const sentence of unit.sentences){
      const range=sentence.range;
      if(!range||range.start!==cursor||!Number.isInteger(range.end)||range.end<=cursor||range.end>text.length)return null;
      if(text.slice(cursor,range.end)!==sentence.text||!/[.!?]["'”’)\]]*$/.test(sentence.text))return null;
      if(/[.!?]["'”’)\]]*\s+\S/.test(sentence.text))return null;
      if(!Array.isArray(sentence.chunks)||!sentence.chunks.length||sentence.chunks.join(' ')!==sentence.text)return null;
      cursor=range.end;
      if(cursor<text.length){if(text[cursor]!==' ')return null;cursor++;}
    }
    if(unit.sentences.at(-1).range.end!==text.length)return null;
  }else if(!Array.isArray(unit.chunks)||unit.chunks.length<2||unit.chunks.join(' ')!==unit.text)return null;
  return unit;
}
export function practiceSteps(unit,voice){
  if(unit?.sentences){
    if(!Array.isArray(unit.sentences)||!unit.sentences.length)return [];
    const steps=[];
    for(const [sentenceIndex,sentence] of unit.sentences.entries()){
      const group=sentenceSteps({...sentence,speaker:unit.speaker},voice);
      if(!group.length||!Number.isInteger(sentence.range?.start))return [];
      steps.push(...group.map(step=>({...step,start:step.start+sentence.range.start,end:step.end+sentence.range.start,sentenceIndex})));
    }
    return steps;
  }
  return sentenceSteps(unit,voice);
}
function sentenceSteps(unit,voice){
  const track=unit?.audio?.[unit.speaker==='Patient'?'patient':voice];
  if(!track||!Array.isArray(unit.chunks)||!unit.chunks.length||track.chunks?.length!==unit.chunks.length||track.buildUp?.length!==unit.chunks.length-1||!track.full)return [];
  let offset=0;
  const steps=unit.chunks.map((text,i)=>{
    const start=offset,end=start+text.length;offset=end+1;
    return {text,url:unit.chunks.length===1?track.full:track.chunks[i],kind:unit.chunks.length===1?'full':'chunk',label:unit.chunks.length===1?'전체 말하기':'짧게 연습',start,end};
  });
  for(let count=2;count<=unit.chunks.length;count++)steps.push({
    text:unit.chunks.slice(0,count).join(' '),url:count===unit.chunks.length?track.full:track.buildUp[count-2],
    kind:count===unit.chunks.length?'full':'build',label:count===unit.chunks.length?'전체 말하기':'이어 말하기',
    start:0,end:steps[count-1].end,
  });
  return steps.every(s=>typeof s.url==='string'&&s.url)?steps:[];
}

// Map a learning range to the existing bubbles, including split original turns.
export function practiceHighlightSlices(week,unit,step){
  if(!step||!Number.isInteger(step.start)||!Number.isInteger(step.end)||step.start<0||step.end>unit.text.length||step.end<=step.start)return [];
  let offset=-(unit.range?.start||0);
  return unit.lines.map(index=>{
    const text=week.lines[index].en;
    const start=Math.min(text.length,Math.max(0,step.start-offset));
    const end=Math.min(text.length,Math.max(start,step.end-offset));
    offset+=text.length+1;
    return {index,before:text.slice(0,start),selected:text.slice(start,end),after:text.slice(end)};
  });
}
