// Practice metadata is tied to the exact script. Older content remains usable.
export function practiceForLine(week,index){
  const data=week?.practice;
  if(!data||data.scriptRevision!==week.scriptRevision)return null;
  const unit=Array.isArray(data.units)?data.units.find(u=>Array.isArray(u.lines)&&u.lines.includes(index)):null;
  if(!unit||!Array.isArray(unit.chunks)||unit.chunks.length<2)return null;
  const lines=unit.lines.map(i=>week.lines[i]);
  if(lines.some(l=>!l)||new Set(lines.map(l=>l.speaker)).size!==1)return null;
  const joined=lines.map(l=>l.en).join(' ');
  if(joined!==unit.text||unit.chunks.join(' ')!==unit.text)return null;
  return unit;
}
export function practiceSteps(unit,voice){
  const track=unit?.audio?.[unit.speaker==='Patient'?'patient':voice];
  if(!track||track.chunks?.length!==unit.chunks.length||track.buildUp?.length!==unit.chunks.length-1||!track.full)return [];
  const steps=unit.chunks.map((text,i)=>({text,url:track.chunks[i],kind:'chunk',label:'짧게 연습',position:`${i+1} / ${unit.chunks.length}`}));
  for(let count=2;count<=unit.chunks.length;count++)steps.push({
    text:unit.chunks.slice(0,count).join(' '),url:count===unit.chunks.length?track.full:track.buildUp[count-2],
    kind:count===unit.chunks.length?'full':'build',label:count===unit.chunks.length?'전체 말하기':'이어 말하기',
    position:count===unit.chunks.length?'':`앞에서 ${count}구간`,
  });
  return steps.every(s=>typeof s.url==='string'&&s.url)?steps:[];
}
