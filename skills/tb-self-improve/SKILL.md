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

## Constraints

- **Never auto-edits `kb/lessons.yaml`.** Always proposes, never commits.
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
