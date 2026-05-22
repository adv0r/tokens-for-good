---
name: tb-pr-craft
description: Last-mile skill that assembles the PR title and body from the change prepared by tb-contribute, applies the canonical preamble, RUNS THE BLACKLIST TRIPWIRE AGAIN, and calls `gh pr create --body-file`.
---

# tb-pr-craft

Use immediately before `gh pr create`. This is the **last** chance to
abort.

## Inputs

- Output from `tb-contribute`: `{repo, type, output_format, diff_or_body, ...}`.
- `templates/humble-preamble.md` — canonical 5-line preamble.
- `templates/pr-body-trivial.md` or `pr-body-standard.md` per
  `kb/contribution-types.yaml`.
- `state.db` for incrementing the `prs` row.

## Workflow

0. **Model identification (MANDATORY — first check)**:
   - Resolve the model name in this priority order:
     1. `--model` CLI flag.
     2. `TFG_MODEL` env var.
     3. `user-state.json` `default_model` field.
     4. Introspect runtime (Cursor exposes it in the system prompt; Claude
        Code uses `$CLAUDE_MODEL`; Codex uses `--model`).
     5. Ask the user via `AskUserQuestion` if all of the above fail.
   - If none yields a value → **ABORT** with:
     `Cannot open PR without model identification (transparency requirement).
      Set TFG_MODEL env var or pass --model.`
   - Substitute the resolved value into `{{model}}` everywhere in the
     preamble and body templates.
   - **Multi-model pipeline**: if discovery used model A and implementation
     used model B, build a chain: `models_chain = ["A", "B"]`. Use the
     alternate preamble that names the chain explicitly.
   - Store `model` and (optional) `models_chain` on the `prs` row.

1. **Tripwire (HARD-FAIL again)**:
   ```bash
   scripts/tfg vet <repo> || exit 2
   ```
   Even if `tb-vet-repo` already passed earlier, the policy may have changed
   while the agent was working. Re-run.

2. **Title rules**:
   - `typo` / `broken-link`: `docs: fix typo in X` or `docs: fix broken
     link in X`. Lowercase, conventional-commits style.
   - `docs-*`: `docs: clarify X` or `docs: add example for Y`.
   - One-liner. No emoji, no `[wip]`, no `[chore]`.

3. **Body assembly**:
   ```
   <preamble (verbatim from templates/humble-preamble.md)>

   <body from templates/pr-body-trivial.md or standard.md>
   ```
   Variables in templates:
   - `{{summary}}` — one-line description of the fix.
   - `{{evidence}}` — line numbers + context.
   - `{{closes_or_related}}` — `Closes #N` only if full resolution (L006);
     else `Related to #N` or omit.

4. **Length sanity (lesson L007)**:
   - Trivial: < 8 lines after the preamble.
   - Standard: ≤ 15 lines after the preamble.
   - Abort with `events.kind = 'pr_body_too_long'` if exceeded.

5. **Always use `--body-file`** (lesson L005):
   ```bash
   echo "$BODY" > /tmp/tfg-pr-body.md
   gh pr create --repo "$REPO" --title "$TITLE" --body-file /tmp/tfg-pr-body.md
   ```
   **Never** HEREDOC. **Never** `--body "..."`.

6. **Record**:
   - INSERT into `prs` (`url`, `repo`, `pr_number`, `contribution_type`,
     `title`, `opened_at`, `state='open'`, `helpful_signal=NULL`,
     `next_checkpoint_at` = now + 24h, **`model`**, **`models_chain`**,
     **`runtime`**).
   - INSERT into `events` (`kind='pr_opened'`, payload includes `type` and
     `model`).

7. **Cleanup**: `rm -f /tmp/tfg-pr-body.md`.

## Outputs

- New PR URL.
- Row in `prs`, event in `events`.
- Diff committed in the agent's git tree.

## Constraints

- **Tripwire ALWAYS runs** before `gh pr create`. No exceptions.
- **Preamble is verbatim** from `templates/humble-preamble.md`. No
  per-PR customization, no removing the link, no rephrasing.
- **No HEREDOC** for the PR body — `--body-file` only.
- **Single commit** per PR, single-line commit subject, no AI co-author
  trailer (`Co-authored-by:` lines are explicitly forbidden).
- **No labels added by agent.** Labels are maintainer-side only.
- **`Closes #N` only on full resolutions** (L006). Default: omit.

## Failure modes

| Failure | Behavior |
|---|---|
| Tripwire returns BLACKLISTED | abort, log `pr_aborted_tripwire`, leave branch in place for human |
| Body length over budget | abort, log `pr_body_too_long`, suggest standard template |
| `gh pr create` returns non-zero | abort, log `pr_create_failed`, do NOT retry automatically |
| Network down | abort, log `network_failed`, retry on next session |
