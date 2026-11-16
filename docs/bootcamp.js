import {nextSessionAt, remainingTime, zoomSessionUrl} from './bootcamp-time.mjs?v=1';

const $ = selector => document.querySelector(selector);
const status = $('#session-status');
const countdown = $('#session-countdown');
const target = nextSessionAt();
const sessionDate = new Intl.DateTimeFormat('ko-KR', {
  timeZone:'Asia/Seoul', month:'long', day:'numeric', weekday:'short',
}).format(target);
$('#countdown-date').textContent = `${sessionDate} 저녁 8시까지 · 한국시간`;
countdown.hidden = false;
let linkOpen = false;
let checking = false;
function setStatus(text) {
  if (status.textContent !== text) status.textContent = text;
}
function tick() {
  if (linkOpen) return;
  const time = remainingTime(target);
  for (const unit of ['days','hours','minutes','seconds'])
    $(`#countdown-${unit}`).textContent = String(time[unit]).padStart(2,'0');
  if (time.ended) setStatus('세션 시작 시간이 되었어요. Zoom 링크가 열리면 입장해 주세요.');
}

// Re-read the organizer's link so an already-open page can also become joinable.
async function refreshSession() {
  if (checking) return;
  checking = true;
  try {
    const response = await fetch('bootcamp-session.json', {cache:'no-cache'});
    if (!response.ok) throw new Error('Session unavailable');
    const session = await response.json();
    const url = zoomSessionUrl(session.zoomUrl);
    const link = $('#zoom-link');
    linkOpen = Boolean(url);
    link.hidden = !linkOpen;
    countdown.hidden = linkOpen;
    if (linkOpen) {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label','Zoom 세션 입장하기 (새 탭)');
      setStatus(session.sessionLabel || '아래 버튼을 눌러 Zoom 세션에 참여해 주세요.');
    } else {
      link.removeAttribute('href');
      setStatus('Zoom 링크가 열리면 이곳에서 입장할 수 있어요.');
      tick();
    }
  } catch {
    // Keep a working countdown on a failed refresh; never expose a stale join link.
    linkOpen = false;
    $('#zoom-link').hidden = true;
    $('#zoom-link').removeAttribute('href');
    countdown.hidden = false;
    setStatus('Zoom 링크를 확인하지 못했어요. 잠시 후 다시 확인합니다.');
    tick();
  } finally {
    checking = false;
  }
}

tick();
refreshSession();
const clock = setInterval(tick, 1000);
const links = setInterval(() => {if (!document.hidden) refreshSession();}, 30000);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {tick(); refreshSession();}
});
window.addEventListener('pagehide', () => {clearInterval(clock); clearInterval(links);});
window.addEventListener('pageshow', event => {if (event.persisted) location.reload();});

// Open the latest released conversation when more weeks are made public.
fetch('free-weeks.json', {cache:'no-cache'})
  .then(response => {if (!response.ok) throw new Error('Release unavailable'); return response.json();})
  .then(release => {
    const id = release.publishedWeekIds?.at(-1);
    if (typeof id !== 'string' || !/^week-\d+$/.test(id)) return;
    document.querySelectorAll('[data-weekly-practice]').forEach(link => {
      link.href = `free.html#${encodeURIComponent(id)}`;
    });
  }).catch(() => {});
