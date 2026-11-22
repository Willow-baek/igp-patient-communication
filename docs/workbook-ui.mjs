import {patternMarkup,phraseRanges} from './week-study.mjs?v=2';
import {createShadowSession} from './shadow-session.mjs?v=1';
const esc=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createWorkbook({onStart=()=>{},getRate=()=>1,createVoice}={}){
  let patterns=null,session=null,host=null,mode='reading',lastId=null,lastComplete=false;
  const $=selector=>host?.querySelector(selector);
  const modes=[['reading','문장전체'],['hint','빈칸'],['ko','한국어'],['hidden','가리기']];
  function prompt(){
    const item=session.state.item;if(!item)return;
    const english=$('#shadowEnglish'),korean=$('#shadowKorean');
    english.hidden=mode==='ko'||mode==='hidden';korean.hidden=mode==='hidden';
    const ranges=phraseRanges(item.en,item.pattern.emphasis);
    if(mode==='hint'){
      let cursor=0,word=0,html='';
      for(const {start,end} of ranges){html+=esc(item.en.slice(cursor,start));html+=item.en.slice(start,end).split(/(\s+)/).map(part=>/^\s+$/.test(part)?part:word++%2?'<span class="shadow-mask" aria-label="가려진 표현">____</span>':'<strong class="pattern-frame">'+esc(part)+'</strong>').join('');cursor=end;}
      english.innerHTML=html+esc(item.en.slice(cursor));
    }else english.innerHTML=patternMarkup(item.en,ranges);
    const hidden=$('#shadowConcealed');hidden.hidden=mode!=='hidden';
    document.querySelectorAll('[data-shadow-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.shadowMode===mode)));
  }
  function draw(state=session.state){
    if(!host)return;
    const complete=state.phase==='complete';
    if(state.item?.id!==lastId||complete!==lastComplete||!$('#shadowStatus')){
      lastId=state.item?.id;lastComplete=complete;
      host.innerHTML=complete?`<div class="workbook-sheet"><h2>이번 쉐도잉을 마쳤어요</h2><p class="workbook-instruction">${state.total}개 예문이 모두 재생됐어요.<br>다시 섞어서 같은 패턴을 한 번 더 연습해 보세요.</p><button class="primary" data-shadow="restart">다시 섞어 연습하기</button></div>`:`<div class="workbook-sheet"><div class="workbook-progress"><span>패턴 ${state.item.patternIndex+1} / ${patterns.length}</span><span>예문 ${state.index+1} / ${state.total}</span></div><h2>듣고, 그대로 말해보세요</h2><p class="workbook-instruction">음성을 들은 뒤 문장 전체를 따라 말해 보세요.<br>예문은 무작위 순서로 이어집니다.</p><div class="shadow-modes" role="group" aria-label="문장 표시 방식">${modes.map(([id,label])=>`<button data-shadow-mode="${id}" aria-pressed="${mode===id}">${label}</button>`).join('')}</div><div class="shadow-prompt"><p id="shadowEnglish" class="shadow-english" lang="en"></p><p id="shadowKorean" class="shadow-korean">${esc(state.item.ko)}</p><p id="shadowConcealed" hidden>화면의 도움 없이 방금 들은 문장을 말해보세요.</p></div><p id="shadowStatus" class="shadow-status" role="status"></p><div class="shadow-actions"><button class="primary" data-shadow="toggle"></button><button data-shadow="replay">이 문장 다시</button><button data-shadow="next">다음 문장</button></div><p class="shadow-voice-note">시험용 예문은 기기의 영어 음성으로 읽습니다.</p><details class="shadow-explanation"><summary>이 패턴 살펴보기</summary><h3 lang="en">${esc(state.item.pattern.title)}</h3><p>${esc(state.item.pattern.meaning)}</p><p>${esc(state.item.pattern.explanation)}</p></details></div>`;
      if(!complete)prompt();
    }
    if(complete)return;
    const status=state.error|| (state.phase==='listen'?'듣는 중이에요.':state.phase==='repeat'?`이제 따라 말해보세요. ${state.remaining}초`:'시작을 누르면 이 예문부터 들려드려요.');
    if($('#shadowStatus').textContent!==status)$('#shadowStatus').textContent=status;
    const running=state.phase==='listen'||state.phase==='repeat';
    $('[data-shadow="toggle"]').textContent=running?'멈추기':'쉐도잉 시작';
    $('[data-shadow="toggle"]').setAttribute('aria-pressed',String(running));
  }
  return {
    mount(data){host=document.querySelector('#workbookView');if(!data||!host)return;if(patterns!==data.patterns){session?.stop();patterns=data.patterns;const voice=createVoice?.();session=createShadowSession({patterns,speak:(text,callbacks)=>{if(!voice){callbacks.onError();return;}voice.speak(text,callbacks);},cancel:()=>voice?.cancel(),getRate,onChange:state=>draw(state)});lastId=null;lastComplete=false;}draw();},
    stop(){session?.stop();},
    handleClick(button){
      if(!host?.contains(button))return false;
      if(button.dataset.shadowMode){mode=button.dataset.shadowMode;prompt();return true;}
      const action=button.dataset.shadow;if(!action||!session)return false;
      onStart();if(action==='toggle')session.toggle();else if(action==='replay')session.replay();else if(action==='next')session.next();else if(action==='restart')session.restart();return true;
    },
  };
}
