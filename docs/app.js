import {resolveAudio} from './audio-source.mjs';
import {createPractice} from './practice-ui.mjs?v=8';
import {selectPublishedWeeks} from './week-catalog.mjs?v=1';
'use strict';
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const playIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m9 5 11 7-11 7Z"/></svg>';
const pauseIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
let weeks=[],week,mode='en',current=-1,sequence=false,generation=0,timer,toastTimer;
let singlePaused=false,loading=false,playingOverride=false,sidebarCollapsed=false;
let physioVoice='female';try{const saved=localStorage.getItem('igp-physio-voice');if(['male','female'].includes(saved))physioVoice=saved}catch{}
const bubbleLanguages=new Map();
let playbackRate='1',shadowGap=true;
const transport=$('#transport'),mobileLayout=matchMedia('(max-width:640px)');
function placeTransport(){const slot=$(mobileLayout.matches?'#mobileTransport':'#desktopTransport');if(slot)slot.append(transport)}
mobileLayout.addEventListener('change',placeTransport);
function updateLineButtons(){document.querySelectorAll('[data-play]').forEach(button=>{const index=Number(button.dataset.play);if(!week?.lines[index])return;const active=index===current&&!playingOverride&&!sequence;button.innerHTML=active&&!singlePaused?pauseIcon:playIcon;button.setAttribute('aria-label',`${index+1}번째 ${week.lines[index].speaker} 대사 ${active?(singlePaused?'이어서 재생':'일시정지'):'재생'}`);button.setAttribute('aria-pressed',String(active&&!singlePaused));});}
function setSidebar(collapsed){sidebarCollapsed=collapsed;const layout=$('.layout');layout.classList[collapsed?'add':'remove']('sidebar-collapsed');$('#weeks').hidden=collapsed;const button=$('#sidebarToggle');button.setAttribute('aria-expanded',String(!collapsed));button.setAttribute('aria-label',collapsed?'주차 목록 펼치기':'주차 목록 접기');try{localStorage.setItem('igp-sidebar-collapsed',String(collapsed))}catch{}}
try{sidebarCollapsed=localStorage.getItem('igp-sidebar-collapsed')==='true'}catch{}
setSidebar(sidebarCollapsed);
function updateTransport(){updateLineButtons();const button=$('#playAll');button.textContent=current>=0||sequence?'정지':'전체 듣기';button.disabled=!week?.lines.length||!week.lines.every(l=>source(l));button.setAttribute('aria-pressed',String(current>=0||sequence))}
const audio=new Audio();audio.preload='metadata';
// load() resets playbackRate to defaultPlaybackRate; keep both in sync.
function applyPlaybackRate(){const rate=Number(playbackRate);audio.defaultPlaybackRate=rate;audio.playbackRate=rate;}
let done=[];try{done=JSON.parse(localStorage.getItem('igp-completed')||'[]');if(!Array.isArray(done))done=[]}catch{}
const toast=t=>{$('#toast').textContent=t;$('#toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').style.display='none',4000)};
function stop(){practice?.syncPlayback(false);generation++;sequence=false;clearTimeout(timer);audio.pause();audio.onended=null;audio.ontimeupdate=null;current=-1;singlePaused=false;loading=false;playingOverride=false;document.querySelectorAll('.line.active').forEach(e=>e.classList.remove('active'));updateTransport();}
function source(line){return resolveAudio(line,week,physioVoice)}
function available(){return week.lines.some(l=>source(l))}
function nav(){ $('#currentWeek').textContent=week?.label||'주차별 학습';$('#weeks').innerHTML=weeks.map(w=>`<button class="week ${week?.id===w.id?'active':''}" data-week="${esc(w.id)}" ${week?.id===w.id?'aria-current="page"':''}><strong>${esc(w.label)} ${done.includes(w.id)?'· 완료':''}</strong><span>${esc(w.shortTitle||w.title)}</span></button>`).join('');}
function bubbleLanguage(i){return bubbleLanguages.get(i) || (mode==='hidden'?'hidden':mode)}
function bubbleMarkup(line,i){
  const language=bubbleLanguage(i);
  const text=language==='en'?line.en:language==='ko'?line.ko:'';
  const action=language==='en'?'한국어로 전환':'영어로 전환';
  const translated=mode==='hidden'?language==='en':language!==mode;
  return `<button class="bubble ${translated?'translated':''}" data-bubble="${i}" lang="${language==='en'?'en':'ko'}" aria-label="${esc(`${i+1}번째 대사: ${text}. ${language==='hidden'?'한국어 대사 확인':action}`)}"><span class="${language==='hidden'?'concealed':'bubble-text'}">${esc(text)}</span></button>`;
}
function modeHint(){return mode==='en'?'음성을 듣고 쉐도잉해 보세요. 말풍선을 누르면 한국어로 바뀝니다.':mode==='ko'?'한국어를 보고 외운 영어 대사를 떠올려 말해 보세요. 말풍선을 누르면 영어로 바뀝니다.':'대본 없이 말해 보세요. 말풍선을 누르면 한국어, 한 번 더 누르면 영어가 보여요.'}
function render(){ $('#mobileTransport').append(transport);transport.hidden=!week.lines.length;nav();updateTransport();if(!week.lines.length){$('#content').innerHTML=`<div class="empty"><h1>${esc(week.title)}</h1><p>새 대화가 준비되면 이곳에서 연습할 수 있어요.</p></div>`;return}
$('#content').innerHTML=`<h1>${esc(week.title)}</h1><details class="study-info"><summary>학습 안내 · 오늘의 상황</summary><p class="intro">${esc(week.description)}</p><p>${esc(week.scenario)}</p></details><div class="study-controls"><div class="modes" role="group" aria-label="대본 표시"><button data-mode="en" aria-pressed="${mode==='en'}">Eng</button><button data-mode="ko" aria-pressed="${mode==='ko'}">Kor</button><button data-mode="hidden" aria-pressed="${mode==='hidden'}">Blind</button></div><div class="voice-choice"><span id="voiceLabel" class="control-label">피지오</span><div role="group" aria-labelledby="voiceLabel" class="voice-switch"><button data-voice="female" aria-pressed="${physioVoice==='female'}">여성</button><button data-voice="male" aria-pressed="${physioVoice==='male'}">남성</button></div></div><div id="desktopTransport"></div><label class="speed"><span class="speed-label">속도</span> <select id="speed" aria-label="재생 속도"><option value="0.75" ${playbackRate==='0.75'?'selected':''}>0.75×</option><option value="0.9" ${playbackRate==='0.9'?'selected':''}>0.9×</option><option value="1" ${playbackRate==='1'?'selected':''}>1×</option><option value="1.1" ${playbackRate==='1.1'?'selected':''}>1.1×</option><option value="1.25" ${playbackRate==='1.25'?'selected':''}>1.25×</option></select></label></div><p class="mode-hint" role="status">${modeHint()}</p><div class="dialogue-title"><h2>${esc(week.shortTitle || '대화 연습')}</h2><span>Physio / Patient</span></div><section id="dialogue" aria-label="연습 대화">${week.lines.map((l,i)=>`<article class="line ${l.speaker==='Patient'?'patient':''}" id="line-${i}"><div class="speaker">${esc(l.speaker)}</div>${bubbleMarkup(l,i)}<button data-play="${i}" aria-label="${i+1}번째 ${esc(l.speaker)} 대사 재생" ${!source(l)?'disabled':''}>${playIcon}</button></article>`).join('')}</section><div class="playbar"><button class="complete" id="complete" aria-pressed="${done.includes(week.id)}">${done.includes(week.id)?'복습 완료됨':'오늘의 복습 완료'}</button></div><section class="summary"><h2>이번 주, 이것만 기억해요</h2><ul>${week.expressions.map(t=>`<li lang="en">${esc(t)}</li>`).join('')}</ul><p>처음에는 함께 읽고, 익숙해지면 대본을 가린 채 Physio 역할을 말해 보세요. 정확한 암기보다 따뜻하고 분명한 전달에 집중해요.</p></section><footer>IGP Patient Communication<br>복습 기록은 이 기기에 저장되며 다른 참여자와 공유되지 않습니다.</footer>`;placeTransport();updateTransport();practice.decorate();}
async function play(i,all=false,override=null){if(!override)practice?.close();stop();const token=generation;sequence=all;playingOverride=Boolean(override);async function run(n){if(token!==generation)return;const l=week.lines[n],src=override||source(l);if(!src){if(all&&n+1<week.lines.length)return run(n+1);stop();return}current=n;loading=true;document.querySelectorAll('.line.active').forEach(e=>e.classList.remove('active'));const row=$(`#line-${n}`);row.classList.add('active');row.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});updateTransport();practice?.syncPlayback(Boolean(override));audio.src=src.url;applyPlaybackRate();let finished=false;function finish(){if(finished||token!==generation)return;finished=true;audio.pause();audio.onended=null;audio.ontimeupdate=null;if(!all||n+1>=week.lines.length){stop();return}const delay=shadowGap?Math.max(1800,(l.en.split(' ').length/2.7)*1000):300;timer=setTimeout(()=>run(n+1),delay)}audio.onended=finish;audio.ontimeupdate=()=>{if(src.end!==null&&audio.currentTime>=src.end)finish()};try{await new Promise((resolve,reject)=>{audio.onloadedmetadata=()=>resolve();audio.onerror=()=>reject(new Error('load'));audio.load()});if(token!==generation)return;audio.currentTime=src.start;loading=false;applyPlaybackRate();if(!singlePaused)await audio.play()}catch(error){if(token===generation&&singlePaused&&error.name==='AbortError')return;if(token===generation){stop();toast('음성을 불러오지 못했어요. 연결을 확인한 뒤 다시 눌러 주세요.')}}}await run(i)}
async function toggleLine(i){
  if(current!==i||sequence||playingOverride)return play(i);
  singlePaused=!singlePaused;
  updateTransport();
  if(singlePaused){audio.pause();return;}
  if(loading)return;
  const token=generation;
  try{applyPlaybackRate();await audio.play();if(token===generation&&singlePaused)audio.pause();}
  catch(error){if(token===generation&&singlePaused&&error.name==='AbortError')return;if(token===generation){stop();toast('음성을 불러오지 못했어요. 연결을 확인한 뒤 다시 눌러 주세요.')}}
}
function refreshBubble(button,index){
  const template=document.createElement('template');template.innerHTML=bubbleMarkup(week.lines[index],index);
  const next=template.content.firstElementChild;
  button.innerHTML=next.innerHTML;button.lang=next.lang;button.className=next.className;
  button.setAttribute('aria-label',next.getAttribute('aria-label'));
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)button.querySelector('span').animate([{opacity:.45},{opacity:1}],{duration:150,easing:'ease-out'});
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(practice.handleClick(b))return;if(b.dataset.voice){stop();physioVoice=b.dataset.voice;try{localStorage.setItem('igp-physio-voice',physioVoice)}catch{}render()}else if(b.dataset.week){practice.close();stop();bubbleLanguages.clear();week=weeks.find(w=>w.id===b.dataset.week);history.replaceState(null,'','#'+encodeURIComponent(week.id));render()}else if(b.dataset.mode){practice.close();stop();mode=b.dataset.mode;bubbleLanguages.clear();render()}else if(b.dataset.play!==undefined){toggleLine(Number(b.dataset.play))}else if(b.dataset.bubble!==undefined){if(!practice.handleBubbleClick(b,e))toggleBubble(b)}else if(b.id==='playAll'){if(current>=0||sequence)stop();else play(0,true)}else if(b.id==='complete'){const id=week.id;done=done.includes(id)?done.filter(x=>x!==id):[...done,id];try{localStorage.setItem('igp-completed',JSON.stringify(done))}catch{toast('이 브라우저에서 기록 저장을 허용하지 않았어요.')}b.textContent=done.includes(id)?'복습 완료됨':'오늘의 복습 완료';b.setAttribute('aria-pressed',String(done.includes(id)));nav()}else if(b.id==='sidebarToggle'){setSidebar(!sidebarCollapsed)}else if(b.id==='guideToggle'){$('#guide').hidden=!$('#guide').hidden;b.setAttribute('aria-expanded',String(!$('#guide').hidden))}});
document.addEventListener('change',e=>{if(e.target.id==='speed'){playbackRate=e.target.value;applyPlaybackRate()}else if(e.target.id==='gap')shadowGap=e.target.checked});
function toggleBubble(button){const i=Number(button.dataset.bubble);bubbleLanguages.set(i,bubbleLanguage(i)==='ko'?'en':'ko');refreshBubble(button,i);}
function captureBubble(button){const i=Number(button.dataset.bubble),had=bubbleLanguages.has(i),saved=bubbleLanguages.get(i);return()=>{if(had)bubbleLanguages.set(i,saved);else bubbleLanguages.delete(i);refreshBubble(button,i);};}
const practice=createPractice({getWeek:()=>week,getVoice:()=>physioVoice,stop,play,toggleBubble,captureBubble});
window.addEventListener('pagehide',()=>{practice.close();stop();});
fetch('weeks.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(async data=>{
  const releaseFile=document.documentElement.dataset.releaseConfig;
  if(releaseFile){
    const response=await fetch(releaseFile,{cache:'no-cache'});
    if(!response.ok)throw Error();
    const release=await response.json();
    weeks=selectPublishedWeeks(data.weeks,release.publishedWeekIds);
  }else weeks=data.weeks;
  if(!weeks.length){$('#content').innerHTML='<div class="empty"><h1>첫 대화를 준비하고 있어요</h1><p>새 주제가 등록되면 이곳에 표시됩니다.</p></div>';return;}
  let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{}
  const requested=weeks.find(w=>w.id===id);
  week=requested||weeks[0];
  if(id&&!requested)history.replaceState(null,'','#'+encodeURIComponent(week.id));
  render();
}).catch(()=>{$('#content').innerHTML='<p class="error">학습 자료를 불러오지 못했어요. 네트워크를 확인한 뒤 새로고침해 주세요.</p>'});
