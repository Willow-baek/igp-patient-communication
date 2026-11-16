import {requestFreeAccess} from './free-access.mjs?v=1';
if (await requestFreeAccess()) {
  try {
    await import('./' + document.documentElement.dataset.studyApp);
    document.querySelector('#main').setAttribute('tabindex','-1');
    document.querySelector('#main').focus({preventScroll:true});
  } catch {
    document.querySelector('#content').textContent = '학습 화면을 불러오지 못했어요. 잠시 후 새로고침해 주세요.';
  }
}
