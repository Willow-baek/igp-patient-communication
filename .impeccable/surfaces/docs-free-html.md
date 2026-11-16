---
version: 1
slug: "docs-free-html"
primary_target: "docs/free.html"
related_targets: ["docs/free-access.mjs", "docs/free-access.css", "docs/free-entry.mjs", "docs/free-access.json", "tools/build-free-page.mjs"]
---

# Free practice entry

A bounded extension of the existing IGP identity: shared-password convenience entry on `free.html` only. The generated page preserves the shared app version in `data-study-app`; the original full study route and public static assets remain accessible. This is not server authentication.

Before entry, hide study UI and defer study data loading. A correct password opens the unchanged shared app and published-week selection. Store only a version:digest marker in localStorage; configuration rotation or site-data clearing asks again. Blocked storage still permits the current visit, with a new prompt on revisit. The configuration contains salt, SHA-256 digest and version; never document the plaintext password or invent expiry.

Use the existing green, paper, ink and system Korean sans. One centered column, maximum 420px, presents the IGP mark, instructions, password field, submit button, browser-memory note and bootcamp return link. Fields and button are at least 52px high with 8px corners. Wrong input has a visible message, invalid state and input focus; successful entry focuses the study main content.

## Verification handoff

Finish review disposition: **ship**, with no material findings and 10 relevant tests independently passed. Evidence supplied by parent: `output/free-access-desktop.jpg` shows initial entry; `output/free-access-mobile.jpg` shows wrong-password feedback at 390×844. Browser checks confirmed wrong input blocked, correct input opened Week 1, remembered reload and no overflow at 320px/390px. All 47 tests passed; after the latest builder-version change, 10 focused tests passed. Deployment success is verified separately before reporting publication. Existing design tokens and sidecar remain unchanged.
