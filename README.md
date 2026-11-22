# IGP Patient Communication

매주 한 주제씩 임상 영어 대화를 익히는 반응형 스터디 사이트.

- [기존 전체 학습 사이트](https://willow-baek.github.io/igp-patient-communication/)
- [최신 대화문 기준 원본 — Google Docs](https://docs.google.com/document/d/12ICQDlhwW27aswKXWDUX8OxQ6GnuPGyWQXOxxTHngME/edit): 주차 추가·수정과 음성 생성용 대본 작성 전에 해당 주차 Day 2의 최신 내용을 직접 확인한다.
- [학습·운영 원칙 및 주차 추가 절차](STUDY_PRINCIPLES.md)
- [이후 작업자를 위한 지침](AGENTS.md)
- 학습 방향: `PRODUCT.md` / 화면 기준: `DESIGN.md`

## 부트캠프 안내 페이지

[공개 부트캠프 안내](https://willow-baek.github.io/igp-patient-communication/bootcamp.html)는 `docs/bootcamp.html`에서 제공한다. 상단 초대 영역에는 참여 신청 안내만 둔다. 바로 아래에 ‘온라인 스피킹 세션’, 같은 형식의 ‘이번 주 대화문 연습하기’ 행을 순서대로 배치한다. 연습 버튼 이름은 ‘지금 바로 연습하기’이며, 모든 학습 링크는 `docs/free-weeks.json`의 마지막 공개 주차 id를 사용해 `free.html#주차id`로 연결한다. 신청은 공식 인스타그램 `@igpkorea` 모집 게시물의 참여 미션을 따른다. 기존 전체·무료 학습 페이지와 대본·오디오는 유지한다.

확정 일정은 **2026년 11월 18일 수요일 시작, 매주 수요일 한국 시간 저녁 8시(Asia/Seoul)**다. 환자·고객과 전문가 역할을 번갈아 맡는 2인 1조 역할극이며, 카메라·마이크 사용, 역할극, 사전 미션 참여가 필수다.

매회 사용자가 보내는 Zoom 링크는 `docs/bootcamp-session.json`의 `zoomUrl`에 교체한다. `sessionLabel`은 선택적인 회차 안내다. Zoom 링크 등록 여부와 관계없이 브라우저의 현재 시각과 한국 시간 수요일 20시를 기준으로 일·시·분·초 카운트다운을 계속 표시한다. 입장 버튼이 활성화되어도 그 바로 아래에서 초 단위로 갱신한다. 열린 페이지의 목표 시각에 도달하면 0을 유지하며 입장 가능 여부에 맞게 안내하고, 시작 후 새로 방문하면 다음 수요일을 목표로 한다. `docs/bootcamp-time.mjs`의 계산은 기기 시간대와 무관하다. 설정은 30초마다, 숨겨진 탭이 다시 보일 때 갱신해 새로고침 없이 입장 버튼을 표시하며 타이머는 그 바로 아래에서 계속 갱신한다. `zoomUrl`을 비우면 입장 버튼만 비활성화하고 카운트다운은 계속 표시한다. 실제 링크의 암호 등 전체 쿼리 매개변수를 보존하고, 교체할 때마다 배포 성공과 공개 페이지 입장 링크를 확인한다. 링크를 만들거나 외부 자동 실행 일정을 등록하지 않는다.

## 무료 공개 페이지

[무료 공개 링크](https://willow-baek.github.io/igp-patient-communication/free.html)는 현재 Week 1만 표시한다. 기존 전체 학습 페이지는 모든 주차를 유지한다. 두 페이지는 `docs/weeks.json`의 대본·오디오와 같은 화면·재생·나눠 연습 기능을 사용하며, 자료를 복사하지 않는다. 같은 브라우저의 설정·복습 기록과 운영자 집계 제외 설정도 공유한다.

무료 공개 주차는 `docs/free-weeks.json`의 `publishedWeekIds`에서 관리한다. 다음 주차를 열 때 `week-02`, 이후 `week-03`을 순서대로 추가해 배포한다. 새 자료를 원본에 추가하는 것만으로 무료 페이지에 자동 공개되지는 않는다. 공개하지 않은 주차의 해시로 접속해도 첫 공개 주차로 이동한다. 이 설정은 공개 사이트의 표시 범위를 정한다. `free.html`에만 참여자 공통 비밀번호를 확인하는 편의용 입장 화면을 제공한다. 서버 인증은 아니며 기존 전체 페이지와 정적 자료·오디오는 계속 공개되어 직접 접근할 수 있다.

입장 전에는 학습 화면을 숨기고 학습 데이터를 불러오지 않는다. 올바른 비밀번호를 입력하면 같은 공유 앱을 실행한다. `docs/free-access.json`에는 평문 비밀번호 대신 `salt`, SHA-256 `digest`, `version`을 저장한다. 브라우저는 `version:digest` 확인값을 localStorage에 기억하며 설정 교체 또는 사이트 데이터 삭제 시 다시 입력한다. 저장이 차단되어도 현재 페이지에는 입장할 수 있지만 재방문 시 다시 입력한다. 비밀번호 변경은 새 salt·digest·version으로 설정을 교체하며 문서에 평문을 기록하지 않는다.

`docs/free.html`은 `docs/index.html`에서 생성한다. 화면을 수정한 뒤 로컬 미리보기 전 `node tools/build-free-page.mjs`를 실행한다. 배포 워크플로도 같은 명령으로 무료 페이지를 갱신하므로 두 화면을 따로 편집하지 않는다. 생성기는 입장 화면·스타일과 `free-entry.mjs`를 삽입하고 원본의 공유 앱 버전을 `data-study-app`에 보존한다.

## Week 4 패턴 쉐도잉 시험 적용

기존 전체 앱의 Week 4에서만 `대화 연습 / 패턴 쉐도잉` 두 탭을 제공한다. 기본은 대화이며 왼쪽 목록은 주차 선택만 담당한다. 무료 앱과 다른 주차에는 적용하지 않는다. `docs/weeks.json`과 기존 v7 구분은 그대로 보존한다. 기존 앱은 `docs/week-04-study.json`을 추가로 읽어 대본 버전·원본 말풍선 일치를 검사하고 Week 4만 교체한다. 설정이 없거나 낡았거나 로딩이 실패하면 6초 안에 기존 20개 말풍선으로 복귀하며 쉐도잉은 표시하지 않는다.

시험 대화는 영어 원문을 바꾸지 않고 7개의 여러 문장 환자 발화를 문장별로 나눠 27개 말풍선으로 표시한다. 한국어도 같은 문장 경계를 따른다. 정상 재생·일시정지·이어 듣기·전체 듣기는 각 문장에 맞는다. 나눠 연습은 24개 말풍선에 제공하며 짧은 완성 문장 3개는 일반 재생을 사용한다. v7 수동 구분을 유지하되 마침표를 가로지르던 `over the last few weeks. Initially, ...` 한 구간만 경계에서 나눈다. 기존 앱의 시험 버전은 이 문장 경계를 우선한다. 영어의 고정 패턴 구조를 기본 볼드로 표시하고 한국어에는 적용하지 않는다. 나눠 연습 중에는 구간 강조가 우선하며 닫으면 볼드를 복원한다.

Sally의 워크북 6개 패턴·18개 예문을 점수·입력·채점 없는 패턴 쉐도잉으로 구성한다. 한 라운드의 예문을 중복 없이 무작위로 섞어 문장 전체 음성→따라 말할 시간→다음 예문으로 진행한다. 실제 음성 길이와 문장 단어 수를 반영해 따라 말할 시간을 확보한다. 18개 뒤에는 끝나며 다시 섞기는 사용자가 직접 시작한다. 멈추기·이 문장 다시·다음 문장을 제공한다. 멈춘 뒤 시작하면 현재 문장 처음부터 재생한다. 탭·주차 이동, 브라우저 탭 숨김·페이지 종료 시 재생과 타이머를 중단한다.

표시 방식은 보고 말하기 / 힌트로 말하기 / 한국어만 / 모두 가리기다. 힌트는 영어 패턴의 일부만 가리고 재료 단어는 유지한다. 한국어만은 영어를 숨기고, 모두 가리기는 영어·한국어 모두 숨긴다. 표시 방식은 수동 선택이며 예문마다 자동으로 4단계를 반복하지 않는다. 패턴 설명은 접힌 영역으로 둔다. 새로고침하면 진행을 초기화한다. 무료 앱과 다른 주차는 유지한다.

시험용 예문 음성만 기기의 영어 SpeechSynthesis를 사용한다(2026-11-22 사용자 선택). 호주→영국→미국→그 외 영어 순서로 기기 음성을 고르고 원래 대화의 ElevenLabs 음성은 유지한다. 예문 음성은 `docs/shadow-voice.mjs`, 진행은 `docs/shadow-session.mjs`로 분리해 추후 녹음으로 교체할 수 있다. 마이크·음성 인식·타이핑·자동 채점은 사용하지 않는다. 음성 재생이 실패하면 현재 예문을 유지하고 다시 시도하도록 안내하며 건너뛰지 않는다. 문제 1-2의 원본 정답표 `neck pain` 오류는 사용자 승인으로 `knee pain after your run`을 사용한다.

재현: 기존 v7 빌드 뒤 `python tools/build-week-04-study.py`. `tools/week-04-workbook-patterns.json`이 교재 내용이며 원본 주차 JSON을 수정하지 않는다. 기존 문장별 음성을 재사용하고 환자 원본의 19.495초 쉼에서 새 경계를 만들었다. 새 파일 5개는 `sentence-study-2026-11-22-v1/`, 경계·해시·ASR 기록은 `tools/week-04-sentence-study-audio.json`이다. 새 파일 5개 ASR 문구가 모두 일치했으며 직접 청취 검수는 별도다. 오디오 생성 시 게인·무음·페이드·조각 이어 붙이기는 추가하지 않는다.

## 현재 동작

상단 왼쪽 목록 아이콘으로 주차 목록을 접거나 펼친다. 접기 상태는 브라우저에 기억하며 모바일에서 목록을 접어도 현재 주차·전체 듣기·Gap은 유지한다. 왼쪽 소개 문구와 하단 장식 문구는 표시하지 않는다. 피지오는 밝은 배경·차분한 역할 이름, 환자는 조금 진한 그린 배경·진한 녹색 이름으로 구분한다.

- Eng: 영어를 보며 쉐도잉. Kor: 한국어를 보고 영어 떠올리기. Blind: 빈 말풍선을 누르면 한국어, 다음에는 영어.
- 모든 모드에서 말풍선마다 클릭해 언어를 전환한다. 반대 언어는 진한 초록색과 짧은 페이드로 표시한다.
- 피지오 여성·남성 음성을 선택해도 환자의 보이스는 고정된다.
- 말풍선 옆 재생 버튼은 해당 말풍선과 배경색을 맞춘다. 환자·피지오·반대 언어·호버 상태에 같은 색을 사용한다.
- 각 말풍선 옆 버튼은 재생 → 일시정지 → 멈춘 위치에서 이어 듣기로 전환한다. 다른 대사·주차·보이스·언어 모드 전환이나 전체 듣기 시작 시 이전 위치를 해제한다. 전체 듣기↔정지는 기존 단일 버튼을 유지한다. 자동 반복과 별도 정지 버튼은 없다.
- 속도 선택은 문장별·전체 재생과 재생 중 변경에 적용되며, 다음 대사나 주차·보이스·언어 모드 전환 뒤에도 유지된다.
- Gap은 전체 듣기의 문장 사이에 따라 말할 시간을 주는 체크박스다. 원본 오디오의 끝 여백과 별개다.
- 모바일: 전체 듣기와 Gap은 Week 행 오른쪽. PC: 성별과 속도 사이. 모바일 언어·성별·속도는 한 줄이다.
- 각 주차에서 나눠 연습 자료가 있는 긴 말풍선은 마우스 더블클릭, 터치·펜 입력은 550ms 길게 누르면 아래에 나눠 연습 영역이 열린다. 짧은 클릭은 한영 전환이며, 스크롤·포인터 취소는 길게 누르기를 취소한다. 키보드는 Shift+Enter, 닫기는 Escape도 지원한다.
- 연습 중에는 기존 말풍선의 영어 원문에서 현재 구간만 강조한다. 연결 단계에서는 강조 범위가 넓어지며, 중복 문장·진행 숫자는 표시하지 않는다. 아래에는 아이콘 조작부만 둔다. 닫으면 원래 한영·Blind 표시로 돌아오며, 아이콘에는 접근 가능한 이름을 유지한다.
- 추천 구간별 연습 → 앞 구간부터 점진적으로 연결 → 전체 발화 순서다. 한 번에 하나만 열리며 단계 이동은 수동이다. 남녀·환자 음성과 속도 설정을 함께 사용한다. 단어 자유 선택·자동 반복은 제공하지 않는다.
- 복습 완료는 브라우저에 저장된다.

Week 2에는 목표 정하기 대본을 등록했다. 원문은 `W2/W2_script.md`에 보존하며, 피지오 남녀 음성과 환자 고정 음성을 14개 말풍선에 연결했다. 원본은 `docs/audio/week-02/original/`, 현재 조각은 `2026-10-31-v1/`에 보존한다. 분할 경계와 ASR 대조는 `tools/week-02-audio-*.json`에 기록했으며 직접 청취 검수는 별도다. 빈 주차에서는 재생 조절과 복습 완료를 표시하지 않는다.

Week 3에는 허리 통증 문진 대본을 추가했다. 제공된 영어 원문은 `W3/W3_script.md`에 보존하고, 18개 말풍선에 피지오 여성 Rachel·남성 Australian Neutral과 환자 John C 음성을 연결했다. 11개 말풍선에는 나눠 연습을 제공한다. 원본과 남성 한 문장의 재생성 파일은 `docs/audio/week-03/original/`, 일반 재생은 `2026-11-09-v1/`, 나눠 연습은 `practice-2026-11-09-v1/`에 있다. 경계·음성 인식 대조는 `tools/week-03-*.json`에 기록한다. ASR 검증은 직접 청취 검수와 구분한다.

Week 4에는 기존 Google Docs 원본 [IGP Patient Communication_v1](https://docs.google.com/document/d/12ICQDlhwW27aswKXWDUX8OxQ6GnuPGyWQXOxxTHngME/edit)의 Day 2 Patient History Dialogue를 등록했다. 영어 원문과 출처는 `W4/W4_script.md`에 보존하며, 2026-11-16 리더 수정본의 19개 발화를 유지한다. 마지막 치료사 발화만 녹음의 문장 사이 쉼에 맞춰 둘로 나눠 20개 말풍선으로 표시한다. 치료사·환자별 생성용 원문은 `W4/W4_physio_script.txt`, `W4/W4_patient_script.txt`, 초기 대본은 `W4/history/2026-11-16-initial/`에 있다.

피지오 여성 Rachel·남성 Australian Neutral, 환자 John C를 기존 보이스·설정 및 Eleven Multilingual v2로 생성했다. 다운로드 원본은 `W4/W4_PT_female.mp3`, `W4/W4_PT_male.mp3`, `W4/W4_pt.mp3`와 `docs/audio/week-04/original/`에 해시를 대조해 보존한다. 일반 재생은 `2026-11-16-v1/`, 여성 보정본은 `volume-balanced-2026-11-16/`, 나눠 연습은 현재 사용자 지정 구분으로 20개 말풍선 모두에 제공한다. 기존 구간은 `practice-2026-11-16-v1/`, 누락된 환자 문장은 `practice-patient-first-2026-11-16-v3/`, 더 짧게 나눈 최신 구간은 `practice-shorter-2026-11-16-v4/`에 있다. 여성은 처음 남성 대사 LUFS 중앙값에 맞춰 +8.43dB 보정했고, 사용자 청취 피드백으로 2dB 더 높였다(원본 대비 총 +10.43dB). 현재 파일은 `volume-up-2026-11-16-v2/` 아래에 있으며 일반·전체 원본 참조·나눠 연습에 동일하게 적용했다. 나눠 연습은 원본의 의미 단위 중 실제 파형에서 안정적인 쉼이 확인된 구간만 제공한다. 합성 무음·페이드·조각 이어 붙이기는 하지 않는다.

재현 순서: `python tools/build-week-04-audio.py` → `python tools/balance-female-audio.py tools/female-volume-balance-2026-11-16-week-04.json` → `python tools/build-practice-audio.py tools/week-04-practice-boundaries.json` → `python tools/balance-female-audio.py tools/female-volume-week-04-2026-11-16-v2.json` → `python tools/build-week-04-first-sentence-practice.py` → `python tools/build-week-04-shorter-practice.py` → `python tools/build-week-04-incident-tail.py` → `python tools/build-week-04-patient-manual-practice.py` → `python tools/build-week-04-all-manual-practice.py`. `imageio-ffmpeg`가 필요하다. 원본·단어 시간 정보·파형 경계는 `tools/week-04-audio-boundaries.json`, 나눠 연습 계획은 `tools/week-04-practice-boundaries.json`, ASR 대조는 `tools/week-04-audio-verification.json`에 기록한다. 현재 연결 기준은 `docs/weeks.json`이며 ASR 검증은 사람의 직접 청취 검수와 구분한다.

## 매주 자료 추가

1. `STUDY_PRINCIPLES.md`의 절차를 읽고, 최신 대본과 환자 인물 정보, 피지오 남녀·환자 고정 음성을 확인한다.
2. 긴 발화를 의미·호흡 단위로 나누고 한국어를 맞춘다. 사용자가 표시한 슬래시를 따른다.
3. `docs/weeks.json`의 `weeks`에 고유 id(`week-02`)를 추가한다. `week-template.json`은 구조 참고용이며 예시 내용을 그대로 발행하지 않는다. 기존 주차를 유지한다.
4. `docs/audio/week-02/` 아래에 파일을 넣고 다음 규칙으로 연결한다.
5. 끝소리와 다음 첫소리, 문장별·전체 재생, 모드·보이스·Gap·반응형 동작을 검증한다.
6. main에 push하고 GitHub Actions 성공을 확인한다. 특정 주차는 사이트 URL 뒤 `#week-02`로 공유한다.

### 권장 입력 파일

```text
W2/
  W2_script.md
  W2_PT_female.mp3
  W2_PT_male.mp3
  W2_pt.mp3
```

역할별 긴 파일이나 문장별 파일 모두 가능하다. 일부 수정만 한 경우 `W2/revised/`에 변경 문장만 이어 붙인 남녀 파일을 넣어도 된다. 원본은 보존한다.

### JSON 음성 연결

피지오 문장:

```json
{"speaker":"Physio","en":"...","ko":"...","audioVoices":{"female":"audio/week-02/female/01.m4a","male":"audio/week-02/male/01.m4a"}}
```

환자 문장:

```json
{"speaker":"Patient","en":"...","ko":"...","audio":"audio/week-02/patient/01.m4a"}
```

주차에 `patient.id`와 `patient.name`을 기록한다. 같은 환자는 같은 보이스를 사용한다. 연결 경로는 `docs/` 기준이다. 브라우저 TTS로 원본 음성을 대체하지 않는다.

긴 파일을 직접 참조하는 기존 구조도 `docs/audio-source.mjs`에서 지원한다. 피지오는 `physioAudio.female/male` + 문장별 `segments.female/male.{start,end}`, 환자는 `patientAudio` + 문장별 `start/end`를 쓴다. 문장별 파일이 우선한다. 일반 단일 `audio`만으로 새 피지오 남녀 버전을 연결하지 않는다. 짧은 파일로 분할하면 끝 경계를 더 정확히 관리할 수 있다.

Week 3 첫 문장의 나눠 연습은 사용자 요청에 따라 `Can you tell me more about / what's been happening / with your back?`으로 변경했다. 원문과 전체 듣기는 유지한다. 재생성 순서는 기존 대사·나눠 연습 빌드 → 여성 음량 보정 → `python tools/build-week-03-opening-practice.py`이며, 마지막 단계는 이 한 말풍선만 바꾼다. 경계와 검증은 `tools/week-03-opening-practice-v2.json`에 기록한다.

## 보이스 음량 맞추기

여성 보이스가 작다는 청취 피드백에 따라 Week 1·2·3의 여성 음량을 각각 +12.96dB, +8.95dB, +11.35dB 올렸다. 각 주차의 현재 남성 대사 음량 중앙값을 기준으로 잡고, 여성 일반 재생·나눠 연습·전체 원본 참조에 주차별 동일 게인을 적용했다. 원본과 이전 컷은 그대로 보존한다. 현재 여성 파일은 각 주차의 `volume-balanced-2026-11-09/` 아래에 있으며 `docs/weeks.json`이 연결 기준이다.

재생성은 기존 대사·나눠 연습 빌드 뒤 `python tools/balance-female-audio.py tools/female-volume-balance-2026-11-09.json` 순서로 한다. 기록에는 원본 해시와 보정 전후 LUFS·true peak를 남긴다. 일정한 게인만 적용하며 압축·리미터·페이드·분할 경계 변경은 하지 않는다. 다음 주차에서도 먼저 보이스별 음량을 측정하고 피크 여유를 확인해 같은 방식으로 맞춘다.

## 대본·음성 수정

사용자의 최신 대본을 기준으로 수정한다. 다른 대사와 환자 음성은 필요한 부분만 교체한다. 내용이 달라진 음성·시간 매핑은 해제하고 새 파일을 연결한다. 미완성 전체 듣기는 문장을 몰래 건너뛰지 않게 비활성화한다.

원본에서 뒤쪽을 최대 약 0.5초 더 가져와 끝소리를 살리되 다음 말을 섞지 않는다. 파형과 실제 끝소리를 시간 추정보다 우선한다. 무음을 덧붙이지 않는다. 공유 경계를 바꾸면 다음 말풍선의 시작도 확인한다. 수정 파일은 새 경로를 사용한다.

현재 연결 상태의 기준은 항상 `docs/weeks.json`이다. `tools/`에는 과거 버전의 분할·검증 기록도 남아 있다. `tail-500ms/`는 폐기된 합성 무음 방식이며 현재 파일로 되돌리지 않는다. `natural-tail/`, `revised/`, `end-fix/` 등도 이름만 보고 현재 상태를 추정하지 않는다.

## 검증·배포

### 운영자 접속 집계 제외

`https://willow-baek.github.io/igp-patient-communication/analytics-settings.html?analytics=off`를 본인이 사용하는 각 브라우저에서 한 번 열면 접속 제외가 저장된다. 이 설정 링크는 팀원에게 공유하지 않는다. 상태 확인·해제는 `analytics-settings.html`에서 한다. 설정 페이지 자체는 집계하지 않는다.

설정은 `igp-analytics-excluded`라는 브라우저 저장값으로 유지되므로 국가·IP·와이파이·모바일 데이터 변경과 무관하다. 기기·브라우저별로 설정하며, 시크릿 모드·사이트 데이터 삭제·브라우저의 저장 데이터 자동 정리 후에는 재설정이 필요할 수 있다. 같은 브라우저를 공유하면 그 브라우저를 쓰는 다른 사람도 제외된다. 이미 열린 다른 학습 탭도 제외 설정을 받으면 수집을 중단하고 새로고침한다. 해제 후에는 기존 학습 탭을 새로고침한다.

`analytics.js`는 공개 호스트의 프로젝트 경로에서만 GA를 불러온다. localhost·로컬 미리보기·저장 접근이 차단된 브라우저는 수집하지 않는다. 과거 GA 기록은 변경하지 않으며, 공개 사이트를 통한 운영자 방문도 제외 설정 이전 기록에는 남아 있다.

```sh
node --input-type=module --check < docs/app.js
node --test tools/*.test.mjs
python3 -m http.server 8080 --directory docs
```

로컬 미리보기: `http://localhost:8080`. 모든 오디오 경로, 남녀 전환 시 환자 음성 고정, 말풍선 전환, 전체 듣기 시작·정지·자연 종료, Gap, 모바일 320/390px와 PC를 변경 범위에 맞춰 확인한다. ASR 대조를 직접 청취 검수라고 보고하지 않는다.

`.github/workflows/pages.yml`이 main의 `docs/`를 GitHub Pages에 자동 배포한다. 배포 산출물 이름은 실행·재실행별로 고유하게 만들고, 업로드 뒤 API에서 파일이 조회되는 것을 확인한 후 배포해 조회 지연·중복 산출물 오류를 방지한다. 코드 수정 시 JS/CSS 자산 버전도 갱신한다. 배포 성공 후 링크를 전달해 사용자가 청취 검수할 수 있게 한다.

## 나눠 연습 자료 추가

현재 나눠 연습 범위는 Week 1의 3개, Week 2의 8개, Week 3의 11개, Week 4의 20개 말풍선이다. Week 1~3의 48개 대사 검토에서는 26개를 일반 재생으로 유지했다. Week 4에서도 안정적인 내부 쉼이 없거나 짧은 완성 문장은 일반 재생으로 연습한다. 더블클릭한 말풍선 안에서만 짧은 구간부터 전체 말풍선까지 이어 연습한다. 같은 화자의 차례여도 마침표·물음표·느낌표로 끝난 문장은 다음 문장과 묶지 않는다. 짧은 “That makes sense.”는 기존 단독 재생을 사용한다.

`weeks.json`의 선택적 `practice`는 `scriptRevision`과 일치해야 한다. 각 unit은 원문 말풍선의 0부터 시작하는 `lines`와 원문과 정확히 일치하는 `text`를 가진다. 한 문장 연습은 `chunks`·`audio`, 여러 문장을 순서대로 연습하는 자료는 `sentences` 배열에 문장별 `text`, 문자 `range`, `chunks`, `audio`를 둔다. `sentences`는 첫 문장에서 시작해 말풍선 전체를 빠짐없이 덮어야 한다. 피지오는 female/male, 환자는 patient만 둔다. 대본이 바뀌거나 자료가 없으면 해당 연습을 노출하지 않는다.

`tools/week-02-practice-boundaries.json`은 최초 경계 이력이고 `tools/week-02-practice-tail-v2.json`은 끝 여유 조정 기록이다. `tools/week-02-practice-fine-v3.json`은 긴 구간을 세분화한 기록이며, `tools/week-02-practice-sentences-v4.json`은 문장별 분리 이력이다. 최신 `tools/week-02-practice-bubbles-v5.json`에 말풍선별 독립 범위와 원본 경계를 기록하고 `tools/build-practice-audio.py`로 각 구간과 누적 구간을 원본에서 직접 추출한다. 연결 연습과 전체 발화도 원본의 연속 구간이며 조각을 합치지 않는다. 일반 HTML 오디오 재생을 공유하므로 속도와 음높이 보정 동작을 유지하고, 구간 끝은 파일 종료로 처리한다. 모든 단어 조합을 만들지 않고 검수한 추천 구간과 누적 구간만 생성한다.

생성 예시: `python tools/build-practice-audio.py tools/week-02-practice-bubbles-v5.json` (imageio-ffmpeg 필요). 새 음성이나 경계 수정은 새 자산 버전 경로를 사용한다. 바뀐 질문과 말풍선은 `practice-v5/`를 사용한다. 현재 연결의 기준은 `docs/weeks.json`이다. 최신 계획 파일의 기존 `audio` 연결은 유지하고 `tracks`에 지정한 역할만 교체한다. `assetVersion`으로 새 자산 경로를 지정한다. 각 구간 끝에 원본 여유 0.1~0.3초를 목표로 더하되, 다음 단어가 붙는 곳은 경계별로 더 짧게 제한한다. 합성 무음은 추가하지 않는다. 말풍선별로 분리한 구간의 ASR 기록은 `tools/week-02-practice-bubbles-v5-verification.json`이며 직접 청취 검수와 구분한다. 이전 파일과 검증 기록은 유지한다.

사용자가 지정한 Week 3 첫 문장 구분은 유지한다. 그 외 구간은 실제 녹음의 쉼을 먼저 확인하고 의미 단위를 다음 기준으로 삼는다. 단어 수 상한에 맞추지 않으며, 자연스럽게 이어지는 명사구·전치사구를 짧은 조각으로 기계적으로 쪼개지 않는다. 영어 원문과 일반 재생용 말풍선은 유지한다.

최신 전체 검토 기록은 `tools/practice-breath-review-2026-11-09.json`, ASR 검증은 `tools/practice-breath-verification-2026-11-09.json`이다. 소스는 음량이 보정된 현재 말풍선 파일이며 추가 게인을 적용하지 않는다. 새 연습 파일은 각 주차의 `practice-breath-2026-11-09-v3/`에 있다. Week 3 첫 문장은 요청한 구분과 검증한 `practice-opening-2026-11-09-v2/`를 유지한다. 기존 빌드·음량 보정·첫 문장 빌드를 마친 뒤 **마지막으로** `python tools/build-breath-practice.py`를 실행해야 현재 연결을 재현한다. 이전 경계 파일은 이력으로 보존한다.

기존 1~3주차에서 한 말풍선에 “Okay.”, “I see.”처럼 짧은 응답과 질문·설명이 함께 있으면, `unit.range`에 해당 문장의 0부터 시작하는 문자 범위를 저장해 질문·설명만 연습한다. 화면의 원문 전체는 유지하고 선택한 문장 안에서만 강조·누적 연결한다. 다른 완성 문장을 함께 누적하지 않는다.


Week 4 환자의 여러 문장이 있는 말풍선은 첫 문장부터 순서대로 연습한다. “Not really.” 같은 짧은 첫 문장도 통째로 첫 단계에 포함한다. 다음 문장으로 넘어가면 그 문장 안에서만 추천 구간·누적 연결·문장 전체를 연습하며, 앞 문장을 함께 누적하지 않는다. 짧은 한 문장뿐인 14번 환자 대사는 일반 재생을 사용한다. 기존 볼륨·전체 듣기·말풍선 원문·기존 구간 경계는 유지한다. 순서 복원 자료와 새로 필요한 문장 파일의 경계는 `tools/week-04-practice-first-sentence-v3.json`에 보존한다.


사용자 요청에 따라 Week 4 본문 말풍선은 유지한 채 긴 나눠 연습 구간을 더 짧게 나눴다. “It started about six weeks ago / during a particularly busy period at work.”, “They prescribed ibuprofen / and advised me to keep moving / and avoid prolonged bed rest.”처럼 의미 단위로 구분한다. 첫 문장부터 시작하고 문장마다 누적 연결을 초기화하는 동작은 유지한다. 현재 여성 보정 전체 녹음과 환자 원본의 연속 구간에서 추출하며, 추가 게인은 적용하지 않는다. 짧은 구간의 기본 계획은 `tools/week-04-practice-shorter-v4.json`이다. 그 뒤 `python tools/build-week-04-incident-tail.py`로 아래 끝소리 수정을 적용하고, `python tools/build-week-04-patient-manual-practice.py`로 첫 환자 대사의 이전 구분을 재현한 뒤, 마지막으로 `python tools/build-week-04-all-manual-practice.py`를 실행해 최신 전체 대사 구분을 반영한다.

2026-11-17 사용자 청취 피드백으로 Week 4 첫 환자 말풍선의 나눠 연습 “any specific injury or incident” 끝을 원본 8.27초에서 8.42초로 0.15초 늘렸다. 같은 끝을 쓰는 누적 구간도 교체하고 다음 “that triggered it.”의 시작을 8.42초로 맞췄다. 세 파일은 `practice-incident-tail-2026-11-17-v5/`에 보존하며 일반 재생·대본·볼륨·나머지 연습 파일은 유지한다. 경계와 원본 해시는 `tools/week-04-incident-tail-v5.json`, 재현은 `tools/build-week-04-incident-tail.py`다. 파형·스펙트럼과 새 파일 세 개의 ASR 일치를 확인했다. 기존 컷도 ASR에서는 전체 단어로 인식되므로 ASR만으로 끝소리 보존을 단정하지 않으며, 직접 청취 검수로 보고하지 않는다.

2026-11-17 사용자가 Week 4 첫 환자 대사의 쪼개기 위치를 직접 지정했다. 첫 문장은 `It started / about six weeks ago / during a particularly busy period / at work.`, 두 번째 문장은 `I was sitting at my desk / for long hours, / but there wasn't any / specific injury or incident / that triggered it.`으로 연습한다. 두 문장은 계속 독립적으로 누적하며 본문·일반 재생·다른 말풍선·볼륨은 유지한다. `incident` 끝은 앞서 확인한 원본 8.42초를 유지한다. 최신 계획은 `tools/week-04-patient-manual-v6.json`, 파일은 `practice-patient-manual-2026-11-17-v6/`이며 해당 이전 버전의 재현 단계는 `python tools/build-week-04-patient-manual-practice.py`다. 이 구분은 아래 전체 사용자 지정 v7로 대체했다. 원본 연속 구간에서 추출한 새 파일 16개 모두 ASR로 기대 문장과 대조했으며 직접 청취 검수와 구분한다.

2026-11-17 사용자가 4주차 대화문 전체에 `/` 구분을 지정했다. 현재는 기존 20개 본문 말풍선 모두에서 치료사 남녀·환자 고정 보이스로 총 70개의 사용자 지정 구간을 연습한다. 원본의 마지막 치료사 차례는 기존처럼 두 본문 말풍선에 유지하며 선택한 구간도 각 말풍선 안에 둔다. 완성된 구간 끝에서 누적 연결을 다시 시작하되, 사용자가 한 구간으로 표시한 “over the last few weeks. Initially, I only felt it occasionally,”는 마침표를 가로질러도 그대로 유지한다. 첫 환자 대사의 이전 9구간은 이번 7구간으로 대체하며 `incident` 끝 8.42초는 유지한다. 최신 계획은 `tools/week-04-all-manual-v7.json`, 최종 재현은 `python tools/build-week-04-all-manual-practice.py`, 현재 파일은 `practice-all-manual-2026-11-17-v7/`다. 본문·일반 재생·전체 듣기·음량·기존 자산은 유지한다. 원본 대사별 단어 시간 재확인은 `tools/week-04-all-manual-word-review-v7.json`, 인접 조각 경계 검토는 `tools/week-04-all-manual-boundary-review-v7.json`, 현재 파일의 ASR 결과는 `tools/week-04-audio-verification.json`에 보존한다. 직접 청취 검수와 구분한다.

전체 수동 구분 v7의 검증 요약은 `tools/week-04-all-manual-validation-v7.json`이다. 새 연습 파일 163개 중 156개는 ASR 문구가 일치하고, 짧은 접속사·어미·연결 발음 등 7개는 인식 차이를 검토 항목으로 남겼다. 완성 연습 그룹 39개와 원본 대사별 재정렬 31개는 모두 대본과 일치했다. 이 결과는 직접 청취 확인을 대신하지 않는다.
