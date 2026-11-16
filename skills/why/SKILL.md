---
name: why
description: "Use for 'why does X work this way', 'why we picked Y', design rationale, regressions, postmortems, or data-backed thresholds. Returns a cited read on decisions and tradeoffs. Use $why for design rationale; runtime behavior is a separate code walkthrough."
---

# Why

Answer from the record, not the code: read the commits and PR discussions that introduced the target and each later change, and other sources if the trail is thin. Cite what the authors wrote, mark your own inferences as inferences, and say what the record does not answer.

Keep the investigation read-only. Use available local Git history and connected sources; report missing history or inaccessible discussions as evidence gaps. Do not infer an author's intent from the current code alone.
