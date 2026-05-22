---
name: tb-pr-followup
description: Per-PR scheduled checkpoint. Runs at 24h / 48h / 7d after PR open and decides whether to wait, send a polite ping, or mark the PR as silent-closed. Different cadence from on-demand tb-triage.
---

# tb-pr-followup

Use when `scripts/tfg followup` reports PRs whose `next_checkpoint_at <= now`,
or when the launchd job wakes the agent.

## Inputs

- `state.db.prs` rows with `next_checkpoint_at <= now AND state IN ('open','draft')`.
- Per-PR history: opened_at, last_checked_at, helpful_signal.

## Checkpoint cadence

| Age since opened | Default action | Why |
|---|---|---|
| 24h | observe-only | most maintainers respond within 24h on simple PRs |
| 48h | observe-only | give weekend or batch-merger maintainers time |
| 7d  | observe-only | by now we should have a signal |
| 14d | propose to close softly | silent past two weeks = no thanks |

We do NOT ping. The preamble already invited the maintainer to close at
zero cost; pinging reverses that promise.

## Workflow

1. For each PR in the followup queue:
   1. Refresh: `gh pr view <url> --json state,comments,reviews,closedAt,mergedAt`.
   2. **If merged** → `helpful_signal = +1`, queue a thank-merge reply,
      log event `kind='pr_merged'`. Schedule no further checkpoints.
   3. **If closed-not-merged**:
      - silent + < 2h since open + core-maintainer closer → apply L001:
        log `kind='pr_silent_close_observed'`, propose blacklist row in
        `repos-policy.yaml`. `helpful_signal = -1`.
      - explicit close with reasonable comment → `helpful_signal = 0`,
        queue an ack reply.
      - schedule no further checkpoints.
   4. **If still open**:
      - update `last_checked_at = now`.
      - set `next_checkpoint_at` to the next slot in the cadence (24h,
        48h, 7d, 14d) relative to `opened_at`.
      - log `kind='followup_observed'`.
   5. **If at 14d and still open**:
      - propose a soft close to the operator (do NOT close automatically).
      - `templates/reply-close-soft.md` is queued for review.

## Outputs

- Updated `prs.last_checked_at`, `prs.next_checkpoint_at`,
  `prs.helpful_signal`.
- Queued (not sent) replies in stdout.
- Event log entries.

## Constraints

- **No pinging maintainers.** Ever. Silence is a valid response and we
  honour it.
- **No auto-close.** Even at 14d the close is a human action.
- **Scheduled-only.** This skill only acts on PRs that have hit their
  checkpoint. For ad-hoc sweeps, use [`tb-triage`](../tb-triage/SKILL.md).
- **Idempotent.** Running followup twice on the same PR within 5 minutes
  produces the same state.
