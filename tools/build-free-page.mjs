// Keep the free entry page identical to the main page except its display scope
// and home link. Content, audio, styles and application code are shared.
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../docs/index.html', import.meta.url), 'utf8');
if (!source.includes('<html lang="ko">') || !source.includes('href="./"'))
  throw new Error('The main entry shell changed; review the free page builder.');
const page = source
  .replace('<html lang="ko">', '<html lang="ko" data-release-config="free-weeks.json">')
  .replace('href="./"', 'href="./free.html"');
fs.writeFileSync(new URL('../docs/free.html', import.meta.url), page);
