import {practiceForLine,practiceSteps,practiceHighlightSlices} from './practice-model.mjs?v=2';
import {createLongPress,createMouseClicks} from './long-press.mjs?v=2';

const closeIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
const backIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m14 6-6 6 6 6M5 6v12"/></svg>';
const playIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m9 5 11 7-11 7Z"/></svg>';
const nextIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m10 6 6 6-6 6M19 6v12"/></svg>';
const restartIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/></svg>';
const stopIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6h12v12H6z"/></svg>';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function createPractice({getWeek,getVoice,stop,play,toggleBubble,captureBubble}){
  let unit=null,anchor=null,stage=0,playing=false,panelLine=null;
  const originals=new Map();
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
    return `<section class="practice-panel" id="practicePanel" aria-label="구간별 대화 연습"><div class="practice-actions" role="group" aria-label="구간 연습 조작"><button data-practice="previous" aria-label="이전 구간" ${stage===0?'disabled':''}>${backIcon}</button><button data-practice="play" class="practice-listen" aria-label="${playing?'구간 음성 정지':'구간 음성 재생'}" aria-pressed="${playing}">${playing?stopIcon:playIcon}</button><button data-practice="next" aria-label="${stage===steps.length-1?'처음부터 다시 연습':'다음 구간'}">${stage===steps.length-1?restartIcon:nextIcon}</button><button class="practice-close" data-practice="close" aria-label="구간 연습 닫기">${closeIcon}</button></div></section>`;
  }
  function restoreBubbles(){
    for(const saved of originals.values())if(saved.button.isConnected){
      saved.button.innerHTML=saved.html;saved.button.className=saved.classes;saved.button.lang=saved.lang;
      saved.button.setAttribute('aria-label',saved.label);
    }
    originals.clear();
  }
  function highlight(){
    const step=practiceSteps(unit,getVoice())[stage];
    const slices=practiceHighlightSlices(getWeek(),unit,step);
    for(const part of slices){
      const button=$(`.bubble[data-bubble="${part.index}"]`);if(!button)continue;
      if(originals.get(part.index)?.button!==button)originals.set(part.index,{button,html:button.innerHTML,classes:button.className,lang:button.lang,label:button.getAttribute('aria-label')});
      button.innerHTML=`<span class="bubble-text"><span class="practice-rest">${esc(part.before)}</span>${part.selected?`<mark class="practice-current">${esc(part.selected)}</mark>`:''}<span class="practice-rest">${esc(part.after)}</span></span>`;
      button.lang='en';button.classList.remove('translated');button.classList.add('practice-reading');
      button.setAttribute('aria-label',`${part.index+1}번째 대사: ${getWeek().lines[part.index].en}. 현재 연습 구간: ${part.selected||'다른 말풍선에 표시됨'}`);
    }
    panelLine=slices.filter(p=>p.selected).at(-1)?.index??anchor;
  }
  function draw(focusAction){
    $('#practicePanel')?.remove();
    if(!unit)return;
    highlight();
    const row=$(`#line-${panelLine}`);if(!row){close();return;}
    row.insertAdjacentHTML('beforeend',markup());markExpanded();
    if(focusAction){
      $(`#practicePanel [data-practice="${focusAction}"]`)?.focus({preventScroll:true});
      $('#practicePanel')?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    }
  }
  function open(index){
    const candidate=practiceForLine(getWeek(),index);
    if(!candidate||!practiceSteps(candidate,getVoice()).length)return;
    mouseClicks.cancel();gesture.cancel();stop();restoreBubbles();unit=candidate;anchor=index;stage=0;playing=false;draw('play');
  }
  function close({restoreFocus=false,preserveMouse=false}={}){
    gesture.cancel();if(!preserveMouse)mouseClicks.cancel();const previous=anchor;
    if(playing)stop();restoreBubbles();unit=null;anchor=null;panelLine=null;stage=0;playing=false;
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
      if(!eligible(button)){if(unit)close();return false;}
      const toggle=()=>{if(unit)close({preserveMouse:true});toggleBubble(button);};
      if(event.detail===0||isTouch(event)){toggle();return true;}
      mouseClicks.click(button,event.detail,toggle,()=>captureBubble(button));
      return true;
    },
    handleClick(button){
      const action=button.dataset.practice;if(!action)return false;
      if(action==='close'){close({restoreFocus:true});return true;}
      const steps=practiceSteps(unit,getVoice());if(!steps.length)return true;
      if(action==='play'){
        if(playing)stop();else play(panelLine,false,{url:steps[stage].url,start:0,end:null});
      }else{
        stop();stage=action==='previous'?Math.max(0,stage-1):(stage+1)%steps.length;draw(action);
      }
      return true;
    },
  };
}
