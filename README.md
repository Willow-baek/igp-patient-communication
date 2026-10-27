# IGP Patient Communication
매주 새 주제와 음성을 추가하는 반응형 영어 대화 연습 사이트. GitHub Pages의 `docs/`를 배포합니다.

## 매주 자료 추가
1. `docs/weeks.json`의 `weeks` 배열에 새로운 주차 객체를 추가합니다 (`week-template.json` 참고).
2. `id`를 `week-02`처럼 고유하게 정하고 제목, 상황, 대본을 입력합니다.
3. `docs/audio/week-02/`에 음성을 추가하고 경로를 연결합니다.
4. main에 push하면 GitHub Actions가 자동 배포합니다. 특정 주차 공유: 사이트 URL 뒤에 `#week-02`.

## ElevenLabs 음성 연결
### 문장별 파일 (가장 간단)
`docs/audio/week-01/01.mp3` 등을 넣고 해당 문장의 `audio`를 `audio/week-01/01.mp3`로 설정하세요. 파일명과 대사 순서를 맞춰주세요. mp3/m4a/wav를 지원하며 웹 배포에는 mp3를 권장합니다.

### 전체 대화 파일
주차의 `audio`에 `audio/week-01/dialogue.mp3`를 설정하고, 각 문장에 초 단위 `start` / `end`를 넣으세요. 예: `"start": 0.2, "end": 5.8`. 문장별 `audio`가 있으면 우선 사용합니다. 타임스탬프 없는 문장은 비활성화되므로 임의로 균등 분할하지 마세요. 실제 파일을 들으며 경계를 확인해야 합니다.

Week 1 피지오 여성/남성 및 환자 음성이 등록되어 있습니다. 원본 3개와 경계 기록은 보존하고, 피지오 11개씩과 환자 5개로 자른 27개 m4a 파일을 재생합니다. 추가 주차는 음성 없이도 대본·한영 전환·대본 가리기·복습 완료가 작동합니다. 브라우저 TTS는 실제 녹음 대신 사용하지 않습니다.

## 로컬 미리보기
`python3 -m http.server 8080 --directory docs` 후 `http://localhost:8080` 접속.

## 공개 범위
사이트, 대본, 업로드한 음성은 공개됩니다. 실제 환자 개인정보를 올리지 마세요. Week 1의 John/Alex는 학습 대본 속 인물입니다. 한국어는 학습용 번역 초안입니다. 복습 상태는 각 브라우저에만 저장됩니다.

## 피지오 남녀 버전 / 환자 고정 음성
- 피지오 대사의 `audioVoices.female`, `audioVoices.male`에 각 음성 경로를 넣습니다. 선택한 버전이 없으면 재생이 비활성화되며 다른 성별 음성으로 대체하지 않습니다.
- 환자 대사는 기존 `audio` 하나를 사용합니다. `patient.id` / `patient.name`은 해당 주차의 환자를 식별합니다. 같은 환자 이름에는 같은 ElevenLabs voice를 사용하고, 생성한 대사별 파일을 연결하세요. 사이트는 피지오 전환과 무관하게 그 환자 파일을 유지합니다.
- 피지오 전체 녹음은 `physioAudio.female` / `.male`과 각 대사의 `segments.female: {start, end}` / `.male: {start, end}`로 연결할 수 있습니다. 환자 전체 녹음은 `patientAudio` 및 환자 대사의 `start` / `end`를 사용합니다.
- 피지오 스위치를 바꾸면 현재 재생이 정지되며 선택은 브라우저에 저장됩니다. 속도·반복·따라 말할 틈 설정은 유지됩니다.

## Week 1 짧은 대사 버전
사용자가 표시한 슬래시대로 피지오 11개, 환자 5개의 말풍선을 표시합니다. 여성/남성 피지오 음성은 `female-v2/`와 `male-v2/`, 환자는 기존 공통 `patient/` 파일입니다. 분할 경계와 자동 음성 인식 검증 결과는 tools/에 기록했습니다. Eng/Kor/Blind의 말풍선은 클릭으로 전환되며 반대 언어는 진한 초록색으로 표시합니다.

## 최신 대본 수정 (2026-10-27)
사용자가 보낸 최신 대본을 기준으로 `are you John Thompson`, `trip here today`, `see how your back moves`를 반영했습니다. revised 폴더에서 제공된 새 남녀 음성을 각 3개로 분리해 말풍선 1/8/11에 연결했습니다. 전체 듣기를 포함한 모든 대사 재생이 활성화되어 있습니다. 환자 음성과 나머지 대사는 기존 파일을 사용합니다. 수정 전 tools/ 검증 자료는 이전 음성의 기록이며, 최신 교체 음성의 검증 결과는 `tools/week-01-revised-audio-verification.json`에 있습니다.

ElevenLabs용 `W1_Physio_revised.txt`는 전체 피지오 대본, `W1_Physio_changed_lines.txt`는 변경된 3개 문장입니다. 환자 대본은 바뀌지 않았습니다.

## 문장 끝 여백
추가 무음 대신 원본 녹음에서 문장 끝부분을 최대 0.5초 더 가져옵니다. 다음 대사의 정렬된 시작점보다 80ms 앞에서 제한하고, 원본 끝에 도달한 경우 더 늘리지 않습니다. 현재 19개 구간을 늘렸고 8개는 다음 말 또는 원본 길이 때문에 기존 범위를 유지합니다. `natural-tail/` 파일을 재생하며 기존 원본과 이전 컷은 보존합니다. 27개 구간을 개별 ASR로 재확인해 대본과 일치했습니다. 검증 기록: `tools/week-01-natural-tail.json`. ‘따라 말할 틈’ 설정은 그대로입니다.

## 끝소리 재조정
사용자 청취 검수에서 짧게 끊겨 들린 ‘John is fine, thanks’, ‘…questions about your back’, ‘Great. Before we start’의 원본 파형을 다시 확인했습니다. 약한 끝소리가 남은 컷을 조정해 최대 다음 발화 직전까지 포함하고 조용한 샘플에서 잘랐습니다. 같은 경계를 공유하던 환자 다음 대사와 여성 마지막 질문의 시작도 맞췄습니다. 새 연결 파일: `end-fix/`. 무음은 추가하지 않았습니다. 기록: `tools/week-01-end-fix.json`.
