---
name: tb-triage
description: On-demand sweep of all open PRs across the cohort. Surfaces new comments, status changes, and merge-or-close events so the operator can react. Read-only — does NOT close, comment, or push.
---

# tb-triage

Use when the user says "triage", "sweep", "any updates?", or when
[`tb-session`](../tb-session/SKILL.md) needs a snapshot of the cohort.

## Inputs

- `state.db.prs` — current cohort.
- `gh` for current PR state.

## Workflow

1. **Refresh first**: `scripts/tfg refresh` to make sure `state.db` is
   current.
2. **Query**:
   ```sql
   SELECT * FROM prs
   WHERE state IN ('open', 'draft')
   ORDER BY opened_at;
   ```
3. **Per PR, fetch latest**:
   ```bash
   gh pr view <url> --json state,comments,reviews,closedAt,mergedAt,statusCheckRollup
   ```
4. **Classify**:
   - **NEW_COMMENT**: a comment from a non-author since `last_checked_at`.
   - **NEW_REVIEW**: a review since `last_checked_at`.
   - **STATE_CHANGED**: open → merged / closed.
   - **CI_FAILED**: status rollup has a failed check.
   - **NO_CHANGE**: nothing new.
5. **Print a triage report** to stdout, grouped by classification.
6. **Recommend next action per PR** (without executing it):
   - NEW_COMMENT (helpful) → use `templates/reply-ack-feedback.md`.
   - STATE_CHANGED (merged) → use `templates/reply-thank-merge.md`,
     update `helpful_signal=+1`, log `events.kind='pr_merged'`.
   - STATE_CHANGED (closed, silent within < 2h, core maintainer) → apply
     lesson L001: propose adding org to blacklist.
   - CI_FAILED → diagnose the diff; do NOT push amend without human nod.

## Outputs

- A printed report.
- Updated `last_checked_at` for every PR scanned.
- New `events` rows: `kind='triage_observed'`, `kind='ci_failed_observed'`, etc.

## Constraints

- **Read-only.** This skill never opens a PR, posts a comment, closes an
  issue, or pushes a commit. Recommendations are surfaced; the operator
  (or a separate skill invocation) acts.
- **No auto-blacklist.** Even when L001 conditions clearly apply, this
  skill only **proposes** the policy edit; the human has to commit it.
- **No merge celebration spam.** A merged PR gets `helpful_signal=+1` in
  state.db plus a thank-merge reply queued; not posted automatically.
