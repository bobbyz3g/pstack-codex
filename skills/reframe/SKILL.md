---
name: reframe
description: "Find the expert terms for a proposed system, distinguish plausible interpretations, and rewrite the user's description using verified terminology. Use $reframe when naming a domain or clarifying a requirement."
---

Start with the user's original description and relevant project files, code, and domain docs. If several problems fit, give the two or three plausible interpretations, one term for each, and an observable sign that distinguishes them. Explain which interpretation the evidence favors and what remains uncertain.

1. Aim for 8–12 terms, ranked by how much each would change what gets built. Define each in a plain sentence, tie it to the user's wording, give a linked example of a real project, paper, or system using it in that sense, and show what concrete request the term makes possible.
2. Compare two or three neighboring fields that solve a similar problem. Explain what transfers, where each analogy breaks, and which terms are worth borrowing.
3. Identify the missing distinctions or constraints that would materially change the design.
4. Rewrite the original description using the useful terms. Preserve the user's goals and distinguish proposed vocabulary and unresolved choices from agreed requirements.

Open each cited source with an available browsing or retrieval tool and verify the usage in context. Omit unverifiable citations. If source access is limited, identify the gap and give fewer supported examples instead of padding the list. Return the rewrite in chat; update shared project documentation only when requested.
