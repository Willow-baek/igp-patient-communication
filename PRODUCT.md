# Product
<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
IGP Patient Communication 스터디 참여자와 함께 연습할 소수 친구들.

## Product Purpose
환자와 마주한 상황을 이미 겪어본 것처럼 익숙하게 만들고, 필요한 영어가 자연스럽게 나오도록 한다. 반복해서 듣기·쉐도잉·한국어를 보고 떠올리기·대본 없이 말하기를 지원한다.

## Operating Context
매주 한 주제의 대본과 음성을 추가해 이전 주차와 함께 유지한다. 운영자가 ElevenLabs에서 피지오 여성/남성과 환자 인물별 고정 음성을 생성한다. 모바일·PC에서 공개 GitHub Pages 링크로 공유한다. 주 1회 스피킹 세션 참여를 독려한다.

## Capabilities and Constraints
문장별 재생, 전체 듣기↔정지 단일 버튼, Gap 체크박스, 속도 조절, Eng/Kor/Blind, 클릭식 말풍선 한영 전환, 기기별 복습 기록. 2주차의 긴 발화는 길게 눌러 추천 구간부터 점진적으로 연결하는 나눠 연습을 제공한다. 기존 ElevenLabs 역할별 음성 제작은 유지하며, 연결 구간은 원본에서 연속으로 추출한다. 단어 자유 선택과 자동 반복 옵션은 없다. 새 주차에서도 피지오 보이스 전환과 환자 고정 보이스를 구분한다.

## Product Principles
대화 중심의 간결한 화면. 제공된 최신 대본을 기준으로 하고 음성과 일치시킨다. 끝소리와 자연스러운 여백은 원본에서 확보한다. 개인 연습을 스피킹 세션의 실제 상호작용으로 이어간다.

## Evidence on Hand
사용자가 확정한 Week 1 대본과 교체 음성. 현재 자료와 연결의 기준은 `docs/weeks.json`. 상세 원칙은 `STUDY_PRINCIPLES.md`, 과거 분할·검증 기록은 `tools/`에 있다.
