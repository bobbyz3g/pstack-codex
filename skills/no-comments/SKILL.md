---
name: no-comments
description: "Review comments and suppressions, remove redundant narration when cleanup is requested, and identify code changes that would make workaround explanations unnecessary. Use $no-comments."
---

# No comments

Review comments with a fresh perspective, then act on supported findings within the user's scope. This skill includes its own reviewer instructions and does not require poteto-mode, architect, or why.

## Scope and mode

Use the caller's files or diff. Otherwise inspect the diff from the merge base with the base branch (default main), including tracked working-tree changes. Preserve unrelated changes and do not sweep unrelated files.

Review or analysis requests, including a bare `$no-comments`, are read-only. An explicit cleanup or fix request authorizes in-scope edits. Reuse existing authorization. Commits, pushes, and PR changes require their own authorization or an established workflow.

## Review

Read [the reviewer brief](references/comment-reviewer.md). When delegation is available and permitted, give one fresh subagent its absolute path, the repository path, scope, and a read-only assignment. Inherit the session model; do not require a Cursor agent type or model rule. If delegation is unavailable or prohibited, perform the review directly and disclose that no independent review ran.

Inspect the findings against the actual code and history. Reject scope escapes, unsupported claims, deletion of protected comments, and proposed application-code changes from the reviewer. If the report is materially invalid, retry once with the specific failure; after a second invalid report, leave those findings unresolved.

## Apply authorized cleanup

Remove redundant narration, banners, and dead commented-out code. Preserve legal notices, public API contracts, proven external constraints, and tool directives that remain necessary.

For comments explaining a surprising internal design or workaround, identify the exact code that should become clearer. Make a trivial in-scope improvement directly. When a structural change is needed, first sketch the caller's usage and affected types or module responsibilities; implement only within the authorized scope. Report larger redesigns as follow-up work rather than deleting the only explanation of an unresolved constraint.

Inspect each lint or type suppression's actual rule. When it hides a correctness problem, fix the cause before removing the suppression; otherwise leave it and report the unresolved problem. Do not mechanically delete directives or weaken checks.

For a constraint such as "do not remove" or "do not change wording", trace the symbol and relevant commits or PR discussions. Offer a type, runtime check, test, or lint only if it would enforce the actual constraint and fits the requested scope. When authorized, encode the constraint before removing its comment. If the evidence or authorization is insufficient, retain the comment and explain the open question.

Use the project's relevant checks for any code or directive changes, unless the user has asked not to run them; then report them as unverified. A comment-only cleanup does not require inventing a new test suite.

## Report

Name the scope, whether the work was review-only or applied, removed comments, retained constraints, code fixes, any reviewer retry, checks actually run, and unresolved findings. Do not describe suggestions as completed fixes.
