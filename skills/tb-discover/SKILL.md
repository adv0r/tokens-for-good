---
name: tb-discover
description: Find candidate repos for low-impact contributions via gh search and deterministic heuristics. Yields one candidate (repo + suggested type) at a time so tb-vet-repo can gate before any work.
---

# tb-discover

Use when [`tb-session`](../tb-session/SKILL.md) needs a new candidate, or
when the user explicitly asks "find me something to fix".

## Inputs

- Round size (already set by tb-session).
- Per-type probe caps from `kb/contribution-types.yaml`.
- Already-visited repos from `state.db.prs`:

  ```sql
  SELECT DISTINCT repo FROM prs WHERE opened_at > date('now', '-30 days');
  ```

## Workflow

1. **Pick a contribution type** to look for. Default order:
   `typo` → `broken-link` → `stale-issue-triage` → `docs-clarify`.
2. **Search** with `gh search` using the per-type query (examples below).
   Limit results to ~50 to avoid bloat.
3. **Filter out**:
   - Repos in `kb/repos-policy.yaml` with `category: blacklist` (any severity).
   - Repos visited in the last 30 days (state.db query above).
   - Repos with `archived: true` or `disabled: true`.
4. **Lightweight quality gate per candidate**:
   - Min stars ≥ 50 (avoid abandoned hobby repos).
   - Last commit < 6 months ago (avoid deads).
   - At least one merged PR from a non-bot in the last 30 days.
5. **Yield ONE candidate** as `{repo, type, suggested_fix_path}`.

## Per-type discovery queries

### typo

```
gh search code 'language:markdown "the the" OR "a a"' --limit 50
gh search code 'language:rst "the the"' --limit 50
```

Then verify by reading 5 lines of context per hit before proposing.

### broken-link

```
# external scan; uses lychee on a clone
gh repo clone <candidate> /tmp/<candidate>
lychee --no-progress --max-concurrency 5 /tmp/<candidate>
```

Look for 404s in markdown/rst. Avoid PR-template links and changelog
hand-written links.

### stale-issue-triage

```
gh search issues --updated "<2024-01-01" --state open --comments 0 --limit 50
```

Filter to repos in `friendly` and where the issue body references a
function/feature that no longer exists in main.

## Outputs

- One candidate dict per call:
  ```
  {repo: "owner/name", type: "typo", suggested_fix_path: "docs/foo.md", evidence: "..."}
  ```
- Increments `events.kind = 'candidate_yielded'`.

## Constraints

- **Probe cap honoured**: never yield a candidate where the repo has had
  ≥`probe_cap` PRs of the same type in the last 30 days.
- **Never yield a blacklisted repo.** Defence in depth — `tb-vet-repo` will
  also catch this, but discovery should pre-filter.
- **No bulk yields.** One candidate per call; the orchestrator decides
  whether to ask for the next one.
