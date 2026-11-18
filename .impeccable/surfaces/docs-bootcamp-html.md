---
version: 1
slug: "docs-bootcamp-html"
primary_target: "docs/bootcamp.html"
related_targets: ["docs/bootcamp.css","docs/bootcamp.js","docs/bootcamp-session.json"]
---

# Bootcamp landing

Persuade surface at docs/bootcamp.html. User supplied event copy. Application is the sole hero action, followed immediately by session access and a matching practice row. Existing GitHub Pages deployment, study content and audio remain in place.

## Direction contract
THESIS: An invitation to speak with another person, followed by a clear path to the live session and this week's dialogue.
OWN-WORLD: Inherit IGP's green, white, pale green, system Korean sans, flat surfaces and fine rules. A large green invitation field extends the existing identity.
STORY: Understand audience, schedule and active participation; apply, find session access and practise the latest public dialogue.
FIRST VIEWPORT: IGP wordmark, bootcamp title and confirmed schedule, one application action in the hero. Immediately below: 온라인 스피킹 세션 then matching 이번 주 대화문 연습하기 row with 지금 바로 연습하기 action.
FORM: Preserve supplied announcement, practice topics, paired role-play, requirements and application copy.
FINISH: Delta finish review disposition is ship. Existing identity and sidecar remain unchanged. No raster assets ship on this route.

## Final behavior

- Public route: https://willow-baek.github.io/igp-patient-communication/bootcamp.html
- Hero application guidance links to `#apply`; application instructions lead to official `@igpkorea` recruitment guidance and its required participation mission. All study links resolve to the last published id in `docs/free-weeks.json` through `free.html#week-id`. Use 지금 바로 연습하기 for the practice CTA.
- Confirmed start: Wednesday November 18, 2026; weekly Wednesday 20:00 Korea time (`Asia/Seoul`). Paired role-play alternates patient/customer and professional roles. Camera, microphone, role-play and advance mission participation are required.
- `docs/bootcamp-session.json` owns session updates. `zoomUrl` is currently blank; `sessionLabel` is optional. Without a link, show days/hours/minutes/seconds until the weekly Korea-time target using browser current instant and timezone-independent `docs/bootcamp-time.mjs` math. An open page retains zero after its target is reached while waiting for the link. Fresh visits after the start target the next Wednesday.
- Poll configuration every 30 seconds and when a hidden tab becomes visible. A supplied valid URL shows the join action without refresh, with the seconds countdown continuing immediately below it. Clearing `zoomUrl` hides only the join action; the countdown stays visible. The organizer supplies each link; preserve all passcode/query parameters, deploy and verify the public join link each time. Do not invent links or register external automated schedules.
- Existing study routes, dialogue source, audio and announcement content remain unchanged.

## Finish review evidence

Disposition: **ship** (delta finish review handoff, 2026-11-16). `output/bootcamp-countdown-desktop.jpg` confirms full-page desktop presentation; `output/bootcamp-countdown-mobile.jpg` confirms 390×650 presentation. Browser checks found no horizontal overflow at 320px/390px, observed countdown ticks 39 → 29 → 21, and confirmed the practice CTA opens the latest public week (currently Week 1). All 42 tests passed, including six new tests. This current behavior and review replace the earlier equal hero actions, unspecified timezone and pending-label contract. Deployment success is verified separately before reporting publication.

Root `DESIGN.md` records only the route-specific extension. Existing design tokens and pre-existing `.impeccable/design.json` metadata are preserved.

2026-11-18 update: the Zoom action and live timer coexist. The button comes first in the DOM, followed by the countdown, with a 16px column gap on desktop and mobile. Reaching zero keeps the action available and uses entry guidance when a link is active. Existing Korea-time target selection and configuration polling remain.
