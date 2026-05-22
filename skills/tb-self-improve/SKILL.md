---
name: tb-self-improve
description: End-of-session reflection. Reads the events log + recent state changes and proposes lesson lifecycle updates (candidate → active → confirmed → retired). Surfaces drafts; the human commits.
---

# tb-self-improve

Use at the end of a session, before commits, to capture meta-learnings.
Manual invocation only — the agent never auto-mutates `lessons.yaml`.

## Inputs

- `state.db.events` since the last self-improve run.
- `kb/lessons.yaml` (current lesson state).
- `kb/repos-policy.yaml` (recent additions).

## Workflow

1. **Pull events** since the last `kind='self_improve_run'` event.
2. **Aggregate signals**:
   - For each lesson with `status` ∈ {`candidate`, `active`}, count new
     supporting / contradicting events.
3. **Lifecycle proposals**:
   - `candidate → active`: ≥ 1 confirming event AND no contradicting
     events in the last 30 days.
   - `active → confirmed`: ≥ 4 independent confirming events (covers L001,
     L003, L005, L008, L009 already).
   - `confirmed → retired`: ≥ 2 contradicting events in the last 30 days,
     OR a manual operator override.
4. **New-lesson candidate generation** (rare):
   - Look for ≥ 3 events with the same `payload_json` shape that don't
     match an existing lesson rule. Propose a new `Lxxx` entry as
     `status: candidate`.
5. **Render proposals** as a YAML diff to stdout. Example:
   ```diff
     - id: L004
       title: Auto-typo-batching pipelines exist
   -   status: candidate
   -   confidence: LOW
   +   status: active
   +   confidence: MEDIUM
       citation_count: 0
   ```
6. **Increment `citation_count`** for every lesson that was cited by an
   event since last run.
7. **Operator commits**: human reviews the diff, updates `kb/lessons.yaml`
   manually, runs `tfg lessons render`, commits.
8. **Log**: `events.kind = 'self_improve_run'`, payload = list of proposed
   transitions.

## Outputs

- A YAML diff printed to stdout.
- Updated `citation_count` in `state.db.lessons`.
- One new event row.

## Positive signal detection (NEW in v2.1)

In addition to flagging silent closures as blacklist triggers, scan recent
events for POSITIVE signals:

- `pr_merged` events (basic positive signal, score +1)
- Comments containing thank-you patterns (regex below) → score +1
- Explicit invitations like "more PRs welcome", "feel free to send more" → score +2
- GitHub reactions (👍❤️🎉) on our PRs → score +0.3 each
- `pr_merged_within_24h` → score +0.5 bonus (very engaged maintainer)

Thank-you regex (positive):

```
thank|thanks|appreciate|much appreciated|nice work|great work|exactly what|love this|grateful
```

Cautionary regex (false positive guard) — skip the match if the line contains:

```
no thanks|not thanks|less thanks|sarcasm
```

…or the line starts with `but `.

For each positive signal:

1. Upsert into `repo_type_affinity` (repo, contribution_type), adjust score.
2. If `score >= 2 AND positive_count >= 2 AND last_negative_at IS NULL`:
   propose promotion of repo `neutral → friendly` (write a row to the events
   table as `kind='lesson_candidate'`; surface in `tfg stats`).
3. If repo is already `friendly` AND `score >= 5 AND positive_count >= 3`:
   propose promotion `friendly → highly-friendly`.
4. Auto-add a `success_examples` link in `repos-policy.yaml` (PR URL +
   contribution type). Operator commits.

Negative signals (existing behavior, kept) decrement score and update
`last_negative_at`. Score is monotonic per direction — we never "forgive"
past silent-closes by merging on the next PR.

## Constraints

- **Never auto-edits `kb/lessons.yaml`.** Always proposes, never commits.
- **Never auto-edits `kb/repos-policy.yaml`.** Promotion proposals go to the
  events table; operator commits.
- **Never deletes a lesson.** Retired lessons stay in the YAML with
  `retired_at` + `retired_reason`.
- **No promotion past evidence.** Don't move from `candidate` to
  `confirmed` in one step; require the intermediate `active` stage.
- **Conservative on retirement.** A single contradicting event is not
  enough; require ≥ 2 within 30 days.

## Sample output

```
== tb-self-improve proposals (1 lifecycle, 0 new candidates) ==

L004 Auto-typo-batching pipelines exist
  current:  candidate / LOW   citations: 0
  evidence: 1 confirming event since last run (neovim/neovim PR labeled)
  propose:  active / MEDIUM
  diff:
    - status: candidate
    - confidence: LOW
    + status: active
    + confidence: MEDIUM
```
