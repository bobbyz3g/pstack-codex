---
name: how
description: "Use for \"how does X work\", code walkthroughs before changing something, and placement / ownership / layering questions (\"where should this live\", \"which package owns this\", \"is this the right layer\"). Explains subsystem architecture, runtime flow, onboarding mental models. Use $how for a code walkthrough; historical motivation is a separate investigation."
---

# How

Explore the codebase to answer "how does X work?" questions.

If the scope is ambiguous, state your interpretation and explore. The user can redirect.

## 1. Explain

When delegation is available and permitted, spawn one subagent using the current Codex tools and inherit the session model. Give it the user's question, repository path, scoped files, and the following brief. Read-only is a task constraint, not an assumed tool parameter. The delegate must not edit files, commit, or start mutating commands. If delegation is unavailable or prohibited, explore and explain directly, and say so.

> You are writing an architectural explanation for a senior engineer. Explore the codebase and write an explanation that a senior engineer unfamiliar with this area could read and walk away with a solid mental model. They should understand the architecture well enough to start working in it confidently. You have read-only access to the codebase.

## 2. Present

Present the explanation, citing the relevant files and symbols. Distinguish observed code paths from assumptions; do not claim runtime verification without running it.

When a subagent was used, present its output. Light edits for clarity or context from the conversation are fine. Do not substantially rewrite it.
