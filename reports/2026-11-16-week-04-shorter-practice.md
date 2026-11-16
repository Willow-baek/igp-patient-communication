# Week 4 나눠 연습을 더 짧게

사용자가 지정한 범위는 본문 말풍선이 아니라 **쪼개기 연습의 구간**이다. 20개 본문 말풍선·영어/한국어 원문·일반 재생·전체 듣기·현재 승인된 볼륨을 유지했다.

긴 구간을 의미 단위로 더 나눴다. 예를 들어 첫 환자 문장은 `It started about six weeks ago / during a particularly busy period at work.`, GP 처방 설명은 `They prescribed ibuprofen / and advised me to keep moving / and avoid prolonged bed rest.`다. 치료사의 마지막 설명도 `It gives me a better understanding / of your medical history / and how your symptoms have developed.`로 세분화했다. 짧은 문장과 연결 발음 때문에 안전한 내부 경계가 없는 표현은 통째 유지한다. 단어 수 상한을 적용하지 않았다.

첫 문장부터 시작하고 `Not really.`도 포함하는 순서, 문장마다 누적 연결을 초기화하는 동작을 유지한다. 각 연결 파일은 보존된 전체 녹음의 연속 구간이며 합성 무음·페이드·조각 이어 붙이기를 쓰지 않는다. 여성은 승인된 +10.43dB 보정 전체 녹음을 그대로 소스로 사용하며 추가 게인은 적용하지 않는다. 새 여성 연습의 최고 true peak는 -6.86dBTP다.

계획·원본 시간·경계 검토는 `tools/week-04-practice-shorter-v4.json`, 새 자산은 `docs/audio/week-04/practice-shorter-2026-11-16-v4/`에 보존한다. 기존 파일을 덮어쓰지 않는 새 공개 경로다. 원본의 실제 쉼을 먼저 확인하고, 연결 발음에서는 의미와 파형·단어 시간 정보를 함께 확인했다. 독립 컷 대조에서 단어 끝이나 다음 단어가 포함된 경계는 양쪽 조각을 함께 재검증해 조정했다. 조정 중 사용하지 않게 된 작업 컷은 공개 자산에서 제외하고 로컬 `work/`에 보존했다.

현재 재생 파일은 일반 31개 + 연습 75개 = 106개다. 독립 ASR에서 105개가 원문과 일치했다. `and advised me to keep moving` 한 구간은 두 모델 모두 advise로 인식하지만, 전체 원본에서는 advised로 인식되고 해당 단어는 컷 경계에서 떨어진 내부에 온전히 포함된다. 원본 음성과 원문을 유지하고 이 인식의 모호함을 검증 파일에 기록했다. ASR·파형 대조는 직접 청취 검수와 구분한다.

테스트 31개 통과. 모든 현재 파일의 존재·해시·문장별 강조 범위, 첫 문장 시작 및 문장별 누적 범위를 확인했다. Chrome에서 짧은 첫 구간 재생, 다음 구간·문장 전체·다음 문장 이동, 짧아진 처방 설명, `Not really.` 첫 단계 유지를 확인했다.

재현 시 기존 Week 4 원본 대사·초기 연습·여성 추가 보정·첫 문장 복원 빌드 뒤 `python tools/build-week-04-shorter-practice.py`를 **마지막으로** 실행한다. 새로운 파일만 ASR 대조하려면 `python tools/verify-week-04-audio.py --missing`, 다른 모델로 모호한 파일만 확인하려면 `--retry --base`를 사용한다. 이전 ASR 파일 기록은 `previousAssets`와 `previousVersions`에 보존한다.
