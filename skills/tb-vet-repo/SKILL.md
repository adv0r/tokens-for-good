---
name: tb-vet-repo
description: HARD-FAIL gate before any contribution. Reads kb/repos-policy.yaml, applies blacklist + cooldown + per-type probe-cap, and returns OK or BLACKLISTED.
---

# tb-vet-repo

Use **every** time before opening a PR or issue. Even when discovery
already pre-filtered, vet again — defence in depth.

The shell shortcut is `scripts/tfg vet <repo>`.

## Inputs

- `repo`: `owner/name` string (or wildcard match like `astral-sh/*`).
- (optional) `contribution_type`: from `kb/contribution-types.yaml`.
- `kb/repos-policy.yaml`: source of truth.
- `state.db.prs`: query for cooldown enforcement.

## Workflow

1. **Wildcard match**. For each policy entry whose `repo` field is a glob
   like `jupyter/*`, treat the candidate as matched if it starts with
   `jupyter/`.
2. **Severity logic**:
   - `category: blacklist, severity: HARD` → return `BLACKLISTED` with the
     matching policy. Caller MUST abort.
   - `category: blacklist, severity: SOFT` and last PR within
     `cooldown_days` → return `BLACKLISTED (cooldown)`. Caller aborts.
   - `category: blacklist, severity: SOFT` past cooldown → return
     `OK (cooldown elapsed)` with a warning to the operator.
3. **Cooldown check**:
   ```sql
   SELECT MAX(opened_at) FROM prs WHERE repo = ?;
   ```
   If `today - last_pr_at < cooldown_days` (read from `repos-policy.yaml`
   or default 7), return `BLACKLISTED (cooldown)`.
4. **Probe-cap check** (when `contribution_type` is provided):
   ```sql
   SELECT COUNT(*) FROM prs
   WHERE repo = ? AND contribution_type = ?
   AND opened_at > date('now', '-30 days');
   ```
   If count ≥ `probe_cap` from `kb/contribution-types.yaml`, return
   `BLACKLISTED (probe-cap)`.
5. **Return OK** if none of the above triggers. Friendly repos return
   `OK (friendly)` with a note from policy.

## Outputs

```
status: OK | BLACKLISTED
reason: hard | soft | cooldown | probe-cap
matched_policy: <entry from repos-policy.yaml> | null
notes: <human-readable>
exit_code: 0 (OK) | 2 (BLACKLISTED)
```

`scripts/tfg vet` exits with `2` on BLACKLISTED so calling shell scripts
can `||` cleanly.

## Constraints

- **No bypass switch.** There is no `--force` flag. If the repo is
  blacklisted, the operator must edit `kb/repos-policy.yaml` and commit
  the change (in a separate PR) before re-running.
- **Wildcard matches are HARD only.** Soft cooldowns require explicit repo
  match (no wildcards) so we don't accidentally muffle a single bad
  experience into an org-wide soft-blacklist.
- **No state mutation.** This skill is read-only. Mutating events go via
  `tb-pr-craft` or `tb-self-improve`.

## Failure modes

- **YAML parse error**: fail closed (treat as BLACKLISTED, surface error).
- **state.db missing**: assume cohort empty (cooldown/probe-cap check is a
  no-op).
- **gh down / network down**: vet still works (no network calls in this
  skill).
