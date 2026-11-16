// Session links are supplied by the organizer and updated before each session.
const status = document.querySelector('#session-status');
fetch('bootcamp-session.json', {cache:'no-cache'})
  .then(response => {if (!response.ok) throw new Error('Session unavailable'); return response.json();})
  .then(session => {
    if (!session.zoomUrl) return;
    const url = new URL(session.zoomUrl);
    if (url.protocol !== 'https:' || url.username || url.password ||
        !(url.hostname === 'zoom.us' || url.hostname.endsWith('.zoom.us') ||
          url.hostname === 'zoom.com' || url.hostname.endsWith('.zoom.com'))) throw new Error('Invalid Zoom URL');
    const link = document.querySelector('#zoom-link');
    link.href = url.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label','Zoom 세션 입장하기 (새 탭)');
    link.hidden = false;
    document.querySelector('#zoom-pending').hidden = true;
    status.textContent = session.sessionLabel || '아래 버튼을 눌러 Zoom 세션에 참여해 주세요.';
  })
  .catch(() => {status.textContent = 'Zoom 링크를 불러오지 못했어요. 잠시 후 새로고침해 주세요.';});
