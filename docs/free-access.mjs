// A convenience entry check only. Static site assets remain public.
export async function passwordMatches(password, config, cryptoProvider = globalThis.crypto) {
  const data = new TextEncoder().encode(`${config.salt}:${password}`);
  const buffer = await cryptoProvider.subtle.digest('SHA-256', data);
  const digest = Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2,'0')).join('');
  return digest === config.digest;
}

export function accessMarker(config) {
  return `${config.version}:${config.digest}`;
}

export async function requestFreeAccess() {
  const $ = selector => document.querySelector(selector);
  const gate = $('#free-access');
  const form = $('#access-form');
  const input = $('#access-password');
  const submit = $('#access-submit');
  const feedback = $('#access-feedback');
  const key = 'igp-free-access';
  function unlock() {
    input.value = '';
    gate.hidden = true;
    document.documentElement.removeAttribute('data-free-locked');
  }
  let config;
  try {
    const response = await fetch('free-access.json', {cache:'no-cache'});
    if (!response.ok) throw new Error('Access config unavailable');
    config = await response.json();
    if (typeof config.version !== 'string' || typeof config.salt !== 'string' || !/^[a-f0-9]{64}$/.test(config.digest))
      throw new Error('Invalid access config');
    if (!globalThis.crypto?.subtle) throw new Error('Password check unavailable');
  } catch {
    feedback.textContent = '입장 정보를 불러오지 못했어요. 잠시 후 새로고침해 주세요.';
    return false;
  }
  try {
    if (localStorage.getItem(key) === accessMarker(config)) {
      unlock();
      return true;
    }
  } catch {}
  feedback.textContent = '';
  submit.disabled = false;
  return new Promise(resolve => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (submit.disabled) return;
      if (!input.value) {
        feedback.textContent = '안내받은 비밀번호를 입력해 주세요.';
        input.focus();
        return;
      }
      submit.disabled = true;
      input.setAttribute('aria-invalid','false');
      feedback.textContent = '';
      try {
        if (!await passwordMatches(input.value,config)) {
          input.setAttribute('aria-invalid','true');
          feedback.textContent = '비밀번호가 맞지 않아요. 다시 확인해 주세요.';
          input.focus();
          input.select();
          return;
        }
        try {localStorage.setItem(key,accessMarker(config));} catch {}
        unlock();
        resolve(true);
      } catch {
        feedback.textContent = '입장 확인을 완료하지 못했어요. 다시 시도해 주세요.';
      } finally {
        submit.disabled = false;
      }
    });
  });
}
