import {practiceForLine,practiceSteps} from './practice-model.mjs?v=1';
import {createLongPress,createMouseClicks} from './long-press.mjs?v=2';

const closeIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
const backIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m14 6-6 6 6 6M5 6v12"/></svg>';
const playIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m9 5 11 7-11 7Z"/></svg>';
const nextIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m10 6 6 6-6 6M19 6v12"/></svg>';
const restartIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/></svg>';
const stopIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6h12v12H6z"/></svg>';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function createPractice({getWeek,getVoice,stop,play,toggleBubble,captureBubble}){
  let unit=null,anchor=null,stage=0,playing=false;
  const $=s=>document.querySelector(s);
  const gesture=createLongPress({open:button=>open(Number(button.dataset.bubble))});
  const mouseClicks=createMouseClicks();
  let pointer={type:'mouse',target:null};
  const isTouch=event=>['touch','pen'].includes(event.pointerType||pointer.type);
  const eligible=button=>button?.matches('.bubble[data-bubble]')&&practiceForLine(getWeek(),Number(button.dataset.bubble));
  function markExpanded(){document.querySelectorAll('.bubble[data-bubble]').forEach(button=>{
    const candidate=practiceForLine(getWeek(),Number(button.dataset.bubble));
    if(candidate){button.setAttribute('aria-expanded',String(candidate===unit));button.setAttribute('aria-controls','practicePanel');button.setAttribute('aria-keyshortcuts','Shift+Enter');button.removeAttribute('title');button.setAttribute('aria-description','마우스 더블클릭, 터치 길게 누르기, 또는 Shift+Enter로 구간 연습 열기');}
  });}
  function markup(){
    const steps=practiceSteps(unit,getVoice()),step=steps[stage];
    if(!step)return '';
    return `<section class="practice-panel" id="practicePanel" aria-label="구간별 대화 연습"><p class="practice-text" lang="en">${esc(step.text)}</p><div class="practice-actions" role="group" aria-label="구간 연습 조작"><button data-practice="previous" aria-label="이전 구간" ${stage===0?'disabled':''}>${backIcon}</button><button data-practice="play" class="practice-listen" aria-label="${playing?'구간 음성 정지':'구간 음성 재생'}" aria-pressed="${playing}">${playing?stopIcon:playIcon}</button><button data-practice="next" aria-label="${stage===steps.length-1?'처음부터 다시 연습':'다음 구간'}">${stage===steps.length-1?restartIcon:nextIcon}</button><span class="practice-position" role="status" aria-label="${stage+1} / ${steps.length}단계">${stage+1} / ${steps.length}</span><button class="practice-close" data-practice="close" aria-label="구간 연습 닫기">${closeIcon}</button></div></section>`;
  }
  function draw(focusAction){
    $('#practicePanel')?.remove();
    if(!unit)return;
    const row=$(`#line-${anchor}`);if(!row){unit=null;return;}
    row.insertAdjacentHTML('beforeend',markup());markExpanded();
    if(focusAction)$(`#practicePanel [data-practice="${focusAction}"]`)?.focus({preventScroll:true});
  }
  function open(index){
    const candidate=practiceForLine(getWeek(),index);
    if(!candidate||!practiceSteps(candidate,getVoice()).length)return;
    mouseClicks.cancel();gesture.cancel();stop();unit=candidate;anchor=index;stage=0;playing=false;draw('play');
    $('#practicePanel')?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  function close({restoreFocus=false}={}){
    gesture.cancel();mouseClicks.cancel();const previous=anchor;
    if(playing)stop();unit=null;anchor=null;stage=0;playing=false;
    $('#practicePanel')?.remove();markExpanded();
    if(restoreFocus)$(`.bubble[data-bubble="${previous}"]`)?.focus({preventScroll:true});
  }
  function syncPlayback(active){
    playing=active;
    const button=$('#practicePanel [data-practice="play"]');
    if(button){button.innerHTML=playing?stopIcon:playIcon;button.setAttribute('aria-label',playing?'구간 음성 정지':'구간 음성 재생');button.setAttribute('aria-pressed',String(playing));}
  }
  function decorate(){
    mouseClicks.cancel();markExpanded();

    if(unit){unit=practiceForLine(getWeek(),anchor);if(unit)draw();else close();}
  }
  document.addEventListener('pointerdown',event=>{const button=event.target.closest?.('.bubble');pointer={type:event.pointerType,target:button};if(eligible(button))gesture.start(button,event);});
  document.addEventListener('dblclick',event=>{const button=event.target.closest?.('.bubble');if(eligible(button)&&!isTouch(event)){event.preventDefault();mouseClicks.doubleClick(button);open(Number(button.dataset.bubble));}});
  document.addEventListener('pointermove',gesture.move,{passive:true});
  document.addEventListener('pointerup',gesture.end);
  document.addEventListener('pointercancel',gesture.cancel);
  document.addEventListener('scroll',gesture.cancel,{capture:true,passive:true});
  window.addEventListener('blur',()=>{gesture.cancel();mouseClicks.cancel();});
  document.addEventListener('contextmenu',event=>{const button=event.target.closest?.('.bubble');if(eligible(button)&&isTouch(event))event.preventDefault();});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&unit){event.preventDefault();close({restoreFocus:true});}
    const button=event.target.closest?.('.bubble');
    if(event.key==='Enter'&&event.shiftKey&&eligible(button)){event.preventDefault();gesture.cancel();open(Number(button.dataset.bubble));}
  });
  return {decorate,close,syncPlayback,
    handleBubbleClick(button,event){
      if(gesture.consume(button))return true;
      if(!eligible(button))return false;
      if(event.detail===0||isTouch(event)){toggleBubble(button);return true;}
      mouseClicks.click(button,event.detail,()=>toggleBubble(button),()=>captureBubble(button));
      return true;
    },
    handleClick(button){
      const action=button.dataset.practice;if(!action)return false;
      if(action==='close'){close({restoreFocus:true});return true;}
      const steps=practiceSteps(unit,getVoice());if(!steps.length)return true;
      if(action==='play'){
        if(playing)stop();else play(anchor,false,{url:steps[stage].url,start:0,end:null});
      }else{
        stop();stage=action==='previous'?Math.max(0,stage-1):(stage+1)%steps.length;draw(action);
      }
      return true;
    },
  };
}
