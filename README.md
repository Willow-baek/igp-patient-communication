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

실제 음성은 아직 등록되지 않았습니다. 음성 없이도 대본·한영 전환·대본 가리기·복습 완료가 작동합니다. 브라우저 TTS는 실제 녹음 대신 사용하지 않습니다.

## 로컬 미리보기
`python3 -m http.server 8080 --directory docs` 후 `http://localhost:8080` 접속.

## 공개 범위
사이트, 대본, 업로드한 음성은 공개됩니다. 실제 환자 개인정보를 올리지 마세요. Week 1의 John/Alex는 학습 대본 속 인물입니다. 한국어는 학습용 번역 초안입니다. 복습 상태는 각 브라우저에만 저장됩니다.
