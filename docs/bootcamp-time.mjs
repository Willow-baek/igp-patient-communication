// Wednesday 20:00 Asia/Seoul is 11:00 UTC; Korea has no daylight saving.
const firstSession = Date.parse('2026-11-18T20:00:00+09:00');
const week = 7 * 24 * 60 * 60 * 1000;

export function nextSessionAt(now = Date.now()) {
  return firstSession + Math.max(0, Math.ceil((now - firstSession) / week)) * week;
}

export function remainingTime(target, now = Date.now()) {
  const seconds = Math.max(0, Math.ceil((target - now) / 1000));
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds % 86400 / 3600),
    minutes: Math.floor(seconds % 3600 / 60),
    seconds: seconds % 60,
    ended: seconds === 0,
  };
}

export function zoomSessionUrl(value) {
  if (!value) return null;
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password ||
      !(url.hostname === 'zoom.us' || url.hostname.endsWith('.zoom.us') ||
        url.hostname === 'zoom.com' || url.hostname.endsWith('.zoom.com')))
    throw new Error('Invalid Zoom URL');
  return url.href;
}
