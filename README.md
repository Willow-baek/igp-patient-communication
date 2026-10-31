# IGP Patient Communication

매주 한 주제씩 임상 영어 대화를 익히는 반응형 스터디 사이트.

- [공개 사이트](https://willow-baek.github.io/igp-patient-communication/)
- [학습·운영 원칙 및 주차 추가 절차](STUDY_PRINCIPLES.md)
- [이후 작업자를 위한 지침](AGENTS.md)
- 학습 방향: `PRODUCT.md` / 화면 기준: `DESIGN.md`

## 현재 동작

- Eng: 영어를 보며 쉐도잉. Kor: 한국어를 보고 영어 떠올리기. Blind: 빈 말풍선을 누르면 한국어, 다음에는 영어.
- 모든 모드에서 말풍선마다 클릭해 언어를 전환한다. 반대 언어는 진한 초록색과 짧은 페이드로 표시한다.
- 피지오 여성·남성 음성을 선택해도 환자의 보이스는 고정된다.
- 각 말풍선 옆 재생 버튼과 전체 듣기↔정지 버튼을 사용한다. 자동 반복과 별도 정지 버튼은 없다.
- 속도 선택은 문장별·전체 재생과 재생 중 변경에 적용되며, 다음 대사나 주차·보이스·언어 모드 전환 뒤에도 유지된다.
- Gap은 전체 듣기의 문장 사이에 따라 말할 시간을 주는 체크박스다. 원본 오디오의 끝 여백과 별개다.
- 모바일: 전체 듣기와 Gap은 Week 행 오른쪽. PC: 성별과 속도 사이. 모바일 언어·성별·속도는 한 줄이다.
- 복습 완료는 브라우저에 저장된다.

Week 2에는 목표 정하기 대본을 등록했다. 원문은 `W2/W2_script.md`에 보존하며, 피지오 남녀 음성과 환자 고정 음성을 14개 말풍선에 연결했다. 원본은 `docs/audio/week-02/original/`, 현재 조각은 `2026-10-31-v1/`에 보존한다. 분할 경계와 ASR 대조는 `tools/week-02-audio-*.json`에 기록했으며 직접 청취 검수는 별도다. 빈 주차에서는 재생 조절과 복습 완료를 표시하지 않는다.

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

## 대본·음성 수정

사용자의 최신 대본을 기준으로 수정한다. 다른 대사와 환자 음성은 필요한 부분만 교체한다. 내용이 달라진 음성·시간 매핑은 해제하고 새 파일을 연결한다. 미완성 전체 듣기는 문장을 몰래 건너뛰지 않게 비활성화한다.

원본에서 뒤쪽을 최대 약 0.5초 더 가져와 끝소리를 살리되 다음 말을 섞지 않는다. 파형과 실제 끝소리를 시간 추정보다 우선한다. 무음을 덧붙이지 않는다. 공유 경계를 바꾸면 다음 말풍선의 시작도 확인한다. 수정 파일은 새 경로를 사용한다.

현재 연결 상태의 기준은 항상 `docs/weeks.json`이다. `tools/`에는 과거 버전의 분할·검증 기록도 남아 있다. `tail-500ms/`는 폐기된 합성 무음 방식이며 현재 파일로 되돌리지 않는다. `natural-tail/`, `revised/`, `end-fix/` 등도 이름만 보고 현재 상태를 추정하지 않는다.

## 검증·배포

```sh
node --input-type=module --check < docs/app.js
node --test tools/playback-speed.test.mjs
python3 -m http.server 8080 --directory docs
```

로컬 미리보기: `http://localhost:8080`. 모든 오디오 경로, 남녀 전환 시 환자 음성 고정, 말풍선 전환, 전체 듣기 시작·정지·자연 종료, Gap, 모바일 320/390px와 PC를 변경 범위에 맞춰 확인한다. ASR 대조를 직접 청취 검수라고 보고하지 않는다.

`.github/workflows/pages.yml`이 main의 `docs/`를 GitHub Pages에 자동 배포한다. 코드 수정 시 JS/CSS 자산 버전도 갱신한다. 배포 성공 후 링크를 전달해 사용자가 청취 검수할 수 있게 한다.
