// Run before loading Google Analytics. Preview/local visits never load the tag.
(() => {
  const id = 'G-E16NK3VL70';
  const key = 'igp-analytics-excluded';
  let excluded = false;
  try { excluded = localStorage.getItem(key) === '1'; } catch { excluded = true; }
  const published = location.hostname === 'willow-baek.github.io' &&
    location.pathname.startsWith('/igp-patient-communication/');
  window['ga-disable-' + id] = excluded || !published;
  // Stop collection in an already-open study tab when settings change elsewhere.
  window.addEventListener('storage', event => {
    if ((event.key === key || event.key === null) && event.newValue !== '0') {
      let nowExcluded = true;
      try { nowExcluded = localStorage.getItem(key) === '1'; } catch {}
      if (nowExcluded) {
        window['ga-disable-' + id] = true;
        location.reload();
      }
    }
  });
  if (window['ga-disable-' + id]) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', id);
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
  document.head.append(script);
})();
