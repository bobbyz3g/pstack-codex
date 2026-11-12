---
name: correct
description: "Find recurring mistakes in repository history and prevent them with architecture, types, actionable checks, or behavioral tests. Use $correct to investigate repeated corrections or implement durable safeguards within the requested scope."
---

# Correct

Turn repeated corrections into repository constraints that catch the next occurrence. Contributors may see only a few files and copy the nearest example; make that local example lead to the supported behavior.

## Scope

Follow the user's request and applicable repository instructions. Analysis, review, or planning requests are read-only: report evidence and proposed safeguards without editing code, tests, CI, or agent instructions. An explicit request to fix or implement authorizes the corresponding changes. Invoking `$correct` alone starts with investigation; it does not authorize repository edits. Reuse authorization already given in the conversation.

Commits, pushes, pull requests, and releases require their own authorization or an explicitly established workflow. When commits are requested, keep each mistake class independently reviewable. This skill does not install a hook or apply itself to future conversations automatically.

## Find the mistake classes

Inspect relevant recent commits, reverts, available review comments, repository instructions, and workaround comments. Start with the requested area and expand only when evidence connects another area. Do not require a hosting-service connector when local history is sufficient.

Group distinct occurrences by their shared failure mechanism. A recurring class needs at least two concrete occurrences; a bug, its fix commit, and a review comment about that same bug count as one occurrence. Cite commits, files, or review links. If history is shallow or inaccessible, state that limit; do not manufacture repetition. A single correction may still deserve a targeted fix when requested, but label it as a single observed case.

## Choose the highest effective level

Consider these levels in order, using the smallest change that reliably prevents the demonstrated failure:

1. **Architecture:** one owner for state, one supported path for a task, hidden internals, or a single source of truth instead of hand-synchronized lists. Remove obsolete examples within scope. Do not turn a local error into a broad redesign without a concrete benefit and authorization for the expanded scope.
2. **Types:** make invalid states or unsupported calls unrepresentable where the language allows it.
3. **Actionable checks:** if bad code still compiles, use an existing lint or CI mechanism where possible. Diagnostics should name the supported file, type, or function. For existing widespread violations, consider preventing new occurrences without forcing unrelated cleanup.
4. **Behavioral tests:** exercise the actual failure at an observable boundary. Repair misleading tests within scope; avoid tests of wording, implementation details, or literal mappings.
5. **Documentation:** reserve agent rules for judgment calls that cannot be enforced mechanically.

Explain why a higher level is unsuitable when choosing a lower one. Prefer established tooling over an additional custom check that duplicates it.

## Implement and prove

For authorized fixes, prioritize the most frequent or consequential classes within scope. Preserve unrelated changes. Use the same verification command locally and in CI when adding an automated check.

Prove each new safeguard rejects a real past mistake: reproduce that mistake in an isolated temporary copy or worktree and run the new check, then verify the corrected version passes. Never reset, overwrite, or revert the user's working tree to demonstrate a failure. Ensure the negative result fails for the intended behavior, not missing dependencies, syntax errors, or incompatible historical APIs. If the original revision cannot run, use a faithful minimal reproduction and explain the limitation. If no negative proof is available, explicitly mark the safeguard unproven.

Use existing exception conventions. If an exception is actually necessary, place it near the violation with a reason, expiry, and real operator approval; never invent approval or add an exception merely to obtain a passing check.

## Keep the rule table useful

When instruction edits are authorized and a remaining judgment rule helps future contributors, maintain a concise table in the applicable repository agent instruction file: rule, enforcement, and any gap. Reuse an existing table. Remove redundant prose only after verifying the invariant is enforced and no judgment remains; do not remove unrelated user rules. Do not write global agent instructions or add a table during read-only analysis.

## Report

For each class, give the distinct evidence, selected level, why higher levels were unsuitable, changed files or proposed change, and negative/positive verification results. Separate observed facts from hypotheses and identify unavailable evidence or unproven checks. Report commit/push status only when those actions were requested.
