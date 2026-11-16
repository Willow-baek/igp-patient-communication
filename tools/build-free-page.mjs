// Content, audio, styles and app code remain shared. The free entry adds a
// convenience password screen; this is not server-side access control.
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../docs/index.html', import.meta.url), 'utf8');
if (!source.includes('<html lang="ko">') || !source.includes('href="./"'))
  throw new Error('The main entry shell changed; review the free page builder.');
const appSource = source.match(/src="(app\.js\?v=\d+)"/)?.[1];
if (!appSource) throw new Error('The shared study entry is missing.');
const gate = `<section id="free-access" aria-labelledby="access-title"><div class="access-content"><div class="access-brand">IGP</div><h1 id="access-title">이번 주 대화문,<br>함께 연습해요.</h1><p>참여자에게 안내된 공통 비밀번호를 입력해 주세요.</p><form id="access-form"><label for="access-password">비밀번호</label><input id="access-password" type="password" autocomplete="current-password" required aria-describedby="access-feedback access-note"><p id="access-feedback" role="status">입장 정보를 확인하고 있어요.</p><button id="access-submit" type="submit" disabled>대화문 연습 시작하기</button></form><p class="access-note" id="access-note">한 번 입력하면 이 브라우저에서 기억해요.<br>공용 기기에서는 사용 후 브라우저의 사이트 데이터를 지워 주세요.</p><a class="access-home" href="bootcamp.html">부트캠프 안내로 돌아가기</a><noscript><p>입장하려면 브라우저에서 JavaScript를 켜 주세요.</p></noscript></div></section>`;
const page = source
  .replace('<html lang="ko">', `<html lang="ko" data-free-locked data-release-config="free-weeks.json" data-study-app="${appSource}">`)
  .replace('href="./"', 'href="./free.html"')
  .replace('</head>', '<link rel="stylesheet" href="free-access.css?v=1"></head>')
  .replace('<body>', `<body>${gate}`)
  .replace(/src="app\.js\?v=\d+"/, 'src="free-entry.mjs?v=1"');
fs.writeFileSync(new URL('../docs/free.html', import.meta.url), page);
