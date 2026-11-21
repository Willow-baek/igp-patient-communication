import {createQuizSession,patternMarkup,phraseRanges} from './week-study.mjs?v=1';
const esc=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createWorkbook(){
  let patterns=null,quiz=null,host=null;
  const $=selector=>host?.querySelector(selector);
  function mark(text,p){return patternMarkup(text,phraseRanges(text,p.emphasis));}
  function draw(focus=false){
    if(!host||!quiz)return;
    const s=quiz.state;
    let body;
    if(s.phase==='intro'){
      body=`<p class="workbook-progress">패턴 ${s.question.patternIndex+1} / ${patterns.length}</p><h2 id="workbookHeading" lang="en">${esc(s.pattern.title)}</h2><p class="pattern-meaning">${esc(s.pattern.meaning)}</p><p class="pattern-explanation">${esc(s.pattern.explanation)}</p><p class="workbook-instruction">한국어 문장을 읽고, 영어 빈칸을 완성해 보세요.<br>이 패턴으로 세 문장을 연습합니다.</p><button class="primary" data-quiz="start">이 패턴 연습하기</button>`;
    }else if(s.phase==='question'){
      const p=s.pattern,q=s.question;
      body=`<p class="workbook-progress">${s.review?'오답 복습':`패턴 ${q.patternIndex+1} / ${patterns.length}`}<span>${s.cursor+1} / ${s.total} 문제</span></p><p class="quiz-pattern" lang="en">${esc(p.title)}</p><h2 id="workbookHeading" class="quiz-prompt">${esc(q.ko)}</h2><p class="quiz-sentence" lang="en">${esc(q.before)}<span class="quiz-blank" aria-label="빈칸">______</span>${esc(q.after)}</p><form id="quizForm" novalidate><label for="quizAnswer">빈칸에 들어갈 표현</label><input id="quizAnswer" name="answer" type="text" lang="en" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="영어로 입력해 주세요" value="${esc(s.input)}" ${s.checked?'readonly':''} aria-describedby="quizFeedback" aria-invalid="${s.empty||(s.checked&&!s.correct)}"><div id="quizFeedback" class="quiz-feedback ${s.checked?(s.correct?'correct':'incorrect'):''}" role="status">${s.empty?'<p>빈칸에 들어갈 표현을 먼저 입력해 주세요.</p>':s.checked?`<p>${s.correct?'맞았어요. 완성한 문장을 소리 내어 말해 보세요.':'정답을 확인하고, 완성 문장을 소리 내어 말해 보세요.'}</p><p class="quiz-answer" lang="en">${mark(q.before+q.answer+q.after,p)}</p>`:''}</div>${s.checked?`<button type="button" class="primary" data-quiz="next">${s.cursor===s.total-1?'결과 보기':'다음 문제'}</button>`:'<button class="primary" type="submit">정답 확인</button>'}</form>`;
    }else{
      body=`<h2 id="workbookHeading">${s.review?'틀린 문장을 다시 연습했어요':'여섯 가지 패턴을 연습했어요'}</h2><p class="quiz-result">처음 풀이에서 <strong>${s.firstTotal}문제 중 ${s.firstCorrect}문제</strong>를 맞혔어요.</p>${s.review?`<p>${s.mistakes.length?`${s.mistakes.length}문제를 한 번 더 연습해 보세요.`:'틀렸던 문제도 모두 확인했어요.'}</p>`:''}<ul class="pattern-results">${s.patternScores.map(p=>`<li><span lang="en">${esc(p.title)}</span><span>${p.correct} / ${p.total}</span></li>`).join('')}</ul><div class="quiz-result-actions">${s.mistakes.length?`<button class="primary" data-quiz="retry">틀린 ${s.mistakes.length}문제 다시 풀기</button>`:''}<button data-quiz="restart">처음부터</button></div>`;
    }
    host.innerHTML=`<div class="workbook-sheet">${body}</div>`;
    if(focus){const target=s.phase==='question'&&!s.checked?$('#quizAnswer'):s.phase==='question'?$('[data-quiz="next"]'):s.phase==='intro'?$('[data-quiz="start"]'):$('#workbookHeading');if(target){if(target.tagName==='H2')target.tabIndex=-1;target.focus({preventScroll:true});}}
  }
  document.addEventListener('input',event=>{if(host?.contains(event.target)&&event.target.id==='quizAnswer')quiz.setInput(event.target.value);});
  document.addEventListener('submit',event=>{if(host?.contains(event.target)&&event.target.id==='quizForm'){event.preventDefault();quiz.check();draw(true);}});
  return {
    mount(data){host=document.querySelector('#workbookView');if(!data||!host)return;if(patterns!==data.patterns){patterns=data.patterns;quiz=createQuizSession(patterns);}draw();},
    handleClick(button){const action=button.dataset.quiz;if(!action||!host?.contains(button))return false;if(['start','next','retry','restart'].includes(action)){quiz[action]();draw(true);}return true;},
  };
}
