---
version: 1
slug: "docs-bootcamp-html"
primary_target: "docs/bootcamp.html"
related_targets: ["docs/bootcamp.css","docs/bootcamp.js","docs/bootcamp-session.json"]
---

# Bootcamp landing

Persuade surface at docs/bootcamp.html. User supplied all event copy. Both Instagram application guidance and free practice are equally important. Zoom session link must be easy to update when provided; do not invent a meeting URL. Existing GitHub Pages deployment and study pages stay in place. Phone readers follow shared announcement links.

## Direction contract
THESIS: An invitation to speak with another person, with readable event details and two equally visible actions.
OWN-WORLD: Inherit IGP's green, white, pale green, system Korean sans, flat surfaces and fine rules. A large green invitation field expands the existing identity for a public announcement.
STORY: Understand who this is for, when it happens and active participation requirements; choose application or free practice; find the session join link.
FIRST VIEWPORT: IGP wordmark, clear bootcamp title on green at left, schedule at right, equal-height application and practice links immediately under the introduction.
FORM: Precisely supplied announcement, composed as invitation, schedule, practice topics, role-play, requirements and application. Code-led extension of existing identity; no seed required for this bounded brief.
FINISH: Finish review disposition is ship. Documentation merges this route into the existing product and design guidance; no visual identity replacement or design sidecar migration. No raster assets ship on this route.

## Final behavior

- Public route: https://willow-baek.github.io/igp-patient-communication/bootcamp.html
- Hero application guidance links to `#apply`; the adjacent equal-height free practice action links to `free.html`. Application instructions lead to the official `@igpkorea` Instagram recruitment post and its required participation mission.
- Confirmed copy: November 18, Wednesday start; every Wednesday at 8pm. No timezone was supplied. Paired role-play alternates patient/customer and professional roles. Camera, microphone, role-play and advance mission participation are required.
- `docs/bootcamp-session.json` owns session updates. `zoomUrl` is currently blank; optional `sessionLabel` adds session-specific guidance. Until supplied, the page shows a pending state and hides the join action. The organizer supplies each link; replace it with all passcode/query parameters intact, deploy and verify the public join link each time. Do not invent a meeting URL or register an automated schedule.
- Existing study routes, dialogue source and audio remain unchanged. Free practice continues to use the existing shared learning implementation and published-week list.

## Finish review evidence

Disposition: **ship** (finish review handoff, 2026-11-16). Required announcement content and valid desktop/mobile presentation were confirmed in `output/bootcamp-desktop.jpg`, `output/bootcamp-preview.jpg` and `output/bootcamp-mobile-top.jpg` (390×844). Browser checks found no horizontal overflow at 320px/390px; the application CTA reached `#apply`, and the free CTA opened `free.html` with Week 1 only. Node VM checks passed pending, valid Zoom with query parameters preserved, and invalid host/protocol cases; HTML links and IDs were verified. Documentation inspection confirms blank session configuration, responsive rules, visible focus styles and reduced-motion support. This record is a readiness review; deployment success is verified separately before reporting publication.

Root `DESIGN.md` records only the route-specific extension. Existing design tokens and pre-existing `.impeccable/design.json` metadata are preserved.
