---
name: tb-contribute
description: Single parametrized skill that handles all contribution types. Reads kb/contribution-types.yaml for the chosen --type, applies the right pre-checks and template, and prepares the change for tb-pr-craft. Replaces 11 separate v1 skills.
---

# tb-contribute

Use when [`tb-vet-repo`](../tb-vet-repo/SKILL.md) has returned OK and the
agent is ready to perform the actual change.

## Inputs

- `--repo`: the vetted target.
- `--type`: a key from `kb/contribution-types.yaml` (e.g. `typo`,
  `broken-link`, `docs-clarify`, `stale-issue-triage`, …).
- `--target-path` (optional): file path within the repo, for code-touching
  types.
- `--evidence`: short string explaining why this fix is real (e.g. line
  number + 5 lines of context).

## Workflow

1. **Load type config** from `kb/contribution-types.yaml`:
   ```yaml
   typo:
     tier: 1
     risk: minimal
     probe_cap: 3
     open_issue_first: false
     output_format: pr      # default
     body_template: pr-body-trivial.md
     pre_checks: [doubled_articles, codespell_verified]
   ```

2. **Honour `output_format`**:
   - `pr` (default): clone (or fetch) repo, branch, edit, commit.
   - `issue`: prepare an issue body via the matching reply-template; do
     NOT touch code; jump to step 6.
   - `comment`: prepare a comment body for an existing issue/PR; do NOT
     touch code; jump to step 6.

3. **Honour `open_issue_first`**:
   - If `true` and `output_format == pr`: pause, file an issue first
     using `templates/pr-body-standard.md`-style body framed as "would a
     PR for this be welcome?". Wait for response (do NOT auto-open the PR).

4. **Run `pre_checks`**:
   - `doubled_articles`: regex scan for `\b(the|a|an|is|to|of)\s+\1\b` in
     diff context.
   - `codespell_verified`: every codespell hit must have manual context
     verification (lesson L009).
   - `lychee_verified`: confirm the link genuinely 404s (not a transient).
   - All checks must pass; on fail, abort and log
     `events.kind = 'pre_check_failed'`.

5. **Make the change**:
   - For `pr`: branch as `tb-<type>-<short-slug>`, edit single file, commit
     with a single subject line, no body, no AI co-author trailer.
   - Keep diff narrow: ideal is `+N/-0` for trivial, `+N/-1` for typo
     fixes, `+N/-N` for swaps.

6. **Hand off to `tb-pr-craft`** with:
   ```
   {
     repo: "...",
     type: "...",
     output_format: pr | issue | comment,
     diff_or_body: "...",
     body_template: "...",
     issue_link: "..."   # if open_issue_first: true was honoured
   }
   ```

## Outputs

- A clean working tree branch ready for PR (when `output_format == pr`).
- An issue or comment body string (when `output_format ∈ {issue, comment}`).
- Event row: `events.kind = 'change_prepared'`.

## Constraints

- **One change per invocation.** No multi-file refactors, no batch edits.
- **One commit per PR**, subject only, no body.
- **Never touch generated files** (`dist/`, `node_modules`, vendored
  binaries, lockfiles unless that's the entire point of the contribution
  type).
- **Native-language gating**: types with `require_native_language: true`
  read `user-state.json.languages` and abort if the target file's locale
  isn't covered.
- **HARD-FAIL on `tier: 4` cold contact**: types with `probe_cap: 0` and
  `open_issue_first: false` → abort. (None should exist; this is a
  defensive check for malformed yaml.)

## Examples

```bash
# typo in a docs file
tfg vet astropy/astropy && \
  tb-contribute --repo astropy/astropy --type typo \
                --target-path docs/intro.rst \
                --evidence "line 42: 'the the example'"

# stale-issue triage (no PR, just a comment)
tfg vet some/friendly && \
  tb-contribute --repo some/friendly --type stale-issue-triage \
                --target-path "issues/1234"
```
