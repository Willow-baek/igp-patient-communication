// This settings page deliberately has no Google Analytics tag.
(() => {
  const key = 'igp-analytics-excluded';
  const status = document.querySelector('#analyticsStatus');
  function show() {
    try {
      const excluded = localStorage.getItem(key) === '1';
      status.textContent = excluded ? '설정 완료: 이 브라우저의 접속은 집계에서 제외됩니다.' : '현재 이 브라우저의 접속은 집계 대상입니다.';
      document.querySelector('#exclude').disabled = excluded;
      document.querySelector('#include').disabled = !excluded;
    } catch {
      status.textContent = '설정을 저장할 수 없어요. 브라우저의 사이트 데이터 저장을 허용한 뒤 다시 시도해 주세요. 저장이 차단된 동안에는 집계하지 않습니다.';
    }
  }
  function setExcluded(excluded) {
    try {
      if (excluded) localStorage.setItem(key, '1');
      else localStorage.removeItem(key);
      show();
    } catch {
      status.textContent = '설정을 저장하지 못했어요. 사이트 데이터 저장을 허용한 뒤 다시 눌러 주세요.';
    }
  }
  document.querySelector('#exclude').addEventListener('click', () => setExcluded(true));
  document.querySelector('#include').addEventListener('click', () => setExcluded(false));
  // Personal setup link: do not share this activation link with study members.
  const url = new URL(location.href);
  if (url.searchParams.get('analytics') === 'off') {
    setExcluded(true);
    url.searchParams.delete('analytics');
    history.replaceState(null, '', url);
  } else show();
  window.addEventListener('storage', show);
})();
