// Practice metadata is tied to the exact script. Older content remains usable.
export function practiceForLine(week,index){
  const data=week?.practice;
  if(!data||data.scriptRevision!==week.scriptRevision)return null;
  const unit=Array.isArray(data.units)?data.units.find(u=>Array.isArray(u.lines)&&u.lines.includes(index)):null;
  if(!unit||!Array.isArray(unit.chunks)||unit.chunks.length<2)return null;
  const lines=unit.lines.map(i=>week.lines[i]);
  if(lines.some(l=>!l)||new Set(lines.map(l=>l.speaker)).size!==1)return null;
  // A speaker turn may contain several sentences; practice cannot cross one.
  if(lines.slice(0,-1).some(l=>/[.!?][\"'”’)\]]*\s*$/.test(l.en)))return null;
  const joined=lines.map(l=>l.en).join(' ');
  if(joined!==unit.text||unit.chunks.join(' ')!==unit.text)return null;
  return unit;
}
export function practiceSteps(unit,voice){
  const track=unit?.audio?.[unit.speaker==='Patient'?'patient':voice];
  if(!track||track.chunks?.length!==unit.chunks.length||track.buildUp?.length!==unit.chunks.length-1||!track.full)return [];
  let offset=0;
  const steps=unit.chunks.map((text,i)=>{
    const start=offset,end=start+text.length;offset=end+1;
    return {text,url:track.chunks[i],kind:'chunk',label:'짧게 연습',start,end};
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
  let offset=0;
  return unit.lines.map(index=>{
    const text=week.lines[index].en;
    const start=Math.min(text.length,Math.max(0,step.start-offset));
    const end=Math.min(text.length,Math.max(start,step.end-offset));
    offset+=text.length+1;
    return {index,before:text.slice(0,start),selected:text.slice(start,end),after:text.slice(end)};
  });
}
