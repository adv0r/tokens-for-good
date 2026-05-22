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

## Explicit opt-out detection (highest-priority signal — NEW in v2.1)

Scan new comments for opt-out patterns **before** any other classification.
If any pattern matches, this takes priority over every other triage
decision in this skill, and unlike the rest of `tb-triage` (which is
read-only), the opt-out path is allowed to **act**.

Regex patterns (case-insensitive, line-level):

```
not welcome
don'?t want (this|these|AI|ai|bot)
please stop
do not (send|open|submit)
we don'?t accept
no thanks?\.?$
(this is|these are) spam
please remove
opt[-\s]?out
vibecoded?|vibe coding
```

False-positive guard: skip if the same line contains `thanks for` or
starts with `but `.

On match:

1. Reply ONCE using `templates/reply-apology-stop.md` (substitute
   `{{repo}}` and `{{model}}`). Post via
   `gh pr comment <url> --body-file <tmp>`.
2. Auto-close the PR:
   ```bash
   gh pr close <url> --comment "Closing per opt-out request."
   ```
3. Update `kb/repos-policy.yaml`: append an entry with
   ```yaml
   category: blacklist
   severity: HARD
   signal_type: explicit-optout
   cooldown_days: 9999
   quote: "<verbatim line from maintainer>"
   ```
4. **BDFL escalation**: if the maintainer is listed as a BDFL in
   `kb/maintainer-patterns.md` or the events log, widen the blacklist
   to `org/*` rather than the single repo.
5. Log event:
   ```json
   {
     "kind": "explicit_optout",
     "maintainer_id": "<anonymized>",
     "pr_url": "<url>",
     "quote": "<verbatim>",
     "response_time_seconds": <comment_ts → our auto-close_ts>
   }
   ```
6. Optional: post a note to Linear if integration is configured.

The auto-close removes the burden from the maintainer — they shouldn't
have to do anything after the opt-out comment. This is the **only**
write path `tb-triage` is allowed to take. All other actions remain
read-only recommendations.

## Constraints

- **Read-only by default.** This skill never opens a PR, posts a comment,
  closes an issue, or pushes a commit. The **single exception** is the
  opt-out handler above, which auto-replies and auto-closes.
- **No auto-blacklist for silent closes.** Even when L001 conditions
  clearly apply, this skill only **proposes** the policy edit; the human
  has to commit it. (Explicit opt-out is the only auto-blacklist path.)
- **No merge celebration spam.** A merged PR gets `helpful_signal=+1` in
  state.db plus a thank-merge reply queued; not posted automatically —
  see [`tb-respond-thanks`](../tb-respond-thanks/SKILL.md) for the polite
  reply path.
