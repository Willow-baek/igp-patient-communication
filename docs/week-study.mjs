const escapeHtml=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function patternMarkup(text,ranges=[]){
  let cursor=0,result='';
  for(const {start,end} of ranges){
    if(!Number.isInteger(start)||!Number.isInteger(end)||start<cursor||end>text.length||end<=start)return escapeHtml(text);
    result+=escapeHtml(text.slice(cursor,start))+'<strong class="pattern-frame">'+escapeHtml(text.slice(start,end))+'</strong>';cursor=end;
  }
  return result+escapeHtml(text.slice(cursor));
}
export function phraseRanges(text,phrases){
  const ranges=[];let cursor=0;
  for(const phrase of phrases){const start=text.indexOf(phrase,cursor);if(start<0)continue;ranges.push({start,end:start+phrase.length});cursor=start+phrase.length;}
  return ranges;
}
export function installWeekStudy(weeks,data){
  const base=weeks.find(w=>w.id===data?.weekId);
  if(!base||base.id!=='week-04'||data.baseScriptRevision!==base.scriptRevision||JSON.stringify(data.baseLines)!==JSON.stringify(base.lines))return weeks;
  if(!Array.isArray(data.lines)||data.lines.length!==27||!Array.isArray(data.patterns)||data.patterns.length!==6||data.practice?.scriptRevision!==data.scriptRevision)return weeks;
  for(let i=0;i<base.lines.length;i++){
    const lines=data.lines.filter(l=>l.sourceLine===i);
    if(!lines.length||lines.some(l=>l.speaker!==base.lines[i].speaker)||lines.map(l=>l.en).join(' ')!==base.lines[i].en||lines.map(l=>l.ko).join(' ')!==base.lines[i].ko)return weeks;
  }
  if(data.lines.some((l,i)=>!Number.isInteger(l.sourceLine)||(i&&l.sourceLine<data.lines[i-1].sourceLine)))return weeks;
  const ids=new Set();
  for(const p of data.patterns){
    if(!p.id||!p.title||!p.meaning||!p.explanation||!Array.isArray(p.emphasis)||p.exercises?.length!==3)return weeks;
    for(const q of p.exercises){if(!q.id||ids.has(q.id)||typeof q.ko!=='string'||typeof q.before!=='string'||typeof q.after!=='string'||typeof q.answer!=='string'||!q.answer.trim())return weeks;ids.add(q.id);}
  }
  return weeks.map(w=>w===base?{...w,lines:data.lines,scriptRevision:data.scriptRevision,practice:data.practice,study:{patterns:data.patterns}}:w);
}
