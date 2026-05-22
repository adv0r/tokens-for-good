---
name: tb-session
description: Orchestrator skill — entry point for any "burn tokens" session. Runs onboarding, refreshes state, sweeps follow-ups, then optionally proceeds to discover→vet→contribute. Three modes (interactive / confirmed / autonomous).
---

# tb-session

Use when the user says any of: "burn tokens", "dono token", "brucio token",
"donate tokens", "tfg session", or starts a new agent session and wants
to act on the Token for good initiative.

## Inputs

- (optional) Mode flag: `--interactive` | `--confirm` (default) | `--auto`.
- (optional) Round size: integer N for max PRs/comments to open.
- Local state at `~/.local/share/token-for-good/`.
- Public framework files in this repo.

## Workflow

1. **Onboarding (run once per machine)**
   - If `~/.local/share/token-for-good/state.db` does not exist → run
     `scripts/tfg init` and `scripts/tfg refresh`.
   - If `user-state.json` is missing or has placeholder values, prompt the
     user (interactive) or fail loudly (auto).

2. **Refresh state**
   - `scripts/tfg refresh` — pulls latest PR data from `gh search`.
   - `scripts/tfg stats` — read the helpful-signal rate.

3. **Mode dispatch**
   - **interactive**: ask the user before each step (discovery query,
     candidate selection, contribution type).
   - **confirmed** (default): pick from `user-state.json.session_defaults`,
     show the plan, ask once for global confirmation, then execute without
     further prompts.
   - **auto**: read `session_defaults`, execute the plan without prompts.
     Restricted to **tier-1 contribution types** in **friendly** repos with
     `probe_cap` honoured.

4. **Followups first**
   - `scripts/tfg followup` — for each PR at checkpoint, hand control to
     [`tb-pr-followup`](../tb-pr-followup/SKILL.md).

5. **Triage if requested**
   - `scripts/tfg triage` lists open PRs. In confirmed/auto modes, only
     act on a PR if there's new activity (comment, review, status change).

6. **Discovery loop (until round size hit or stop condition)**
   - [`tb-discover`](../tb-discover/SKILL.md) yields a candidate.
   - [`tb-vet-repo`](../tb-vet-repo/SKILL.md) HARD-FAILs or passes.
   - [`tb-contribute`](../tb-contribute/SKILL.md) `--type=<chosen>`.
   - [`tb-pr-craft`](../tb-pr-craft/SKILL.md) → `gh pr create`.

7. **End of session**
   - [`tb-self-improve`](../tb-self-improve/SKILL.md) — propose lesson
     lifecycle updates from the event log.
   - `scripts/tfg lessons render && scripts/tfg policy render && scripts/tfg pr-history render`.
   - `scripts/tfg stats --update-readme`.
   - Commit the rendered changes if the user asks (otherwise leave for the
     human).

## Outputs

- New rows in `prs` and `events` tables.
- Updated `kb/lessons.md`, `kb/repos-policy.md`, `kb/pr-history.md` if
  rendering ran.
- Updated `README.md` STATS block.

## Constraints

- **Never** opens a PR before `tb-vet-repo` has returned OK. The tripwire
  fires again inside `tb-pr-craft` for defence in depth.
- **Stop conditions** (any one):
  - 3 consecutive cold-close PRs in the round.
  - AgentScan-style flag triggered.
  - User says "stop".
  - Round size reached.
- In `--auto` mode, **only tier-1** contribution types in **friendly**
  repos. Anything else requires confirmed/interactive.
- Probe cap per repo per session = 1 (untested/neutral) or 2 (friendly),
  never higher.

## Failure mode bias

If anything is ambiguous, prefer the cheaper default: **don't open a PR**.
End the session early and report what was learned.
