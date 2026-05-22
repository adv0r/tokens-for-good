# `skills/` — agent capabilities

Each subfolder defines a single agent-invokable action. The contract is:
read the `SKILL.md`, follow the workflow, return when done. Skills compose
under [`tb-session`](./tb-session/SKILL.md), the orchestrator.

## The 8 skills

| Order | Skill | Purpose |
|---|---|---|
| — | [`tb-session`](./tb-session/SKILL.md) | orchestrator + 3 modes (interactive / confirmed / autonomous) |
| 1 | [`tb-discover`](./tb-discover/SKILL.md) | find candidate repos via `gh search` |
| 2 | [`tb-vet-repo`](./tb-vet-repo/SKILL.md) | apply the blacklist + cooldown gate (HARD-FAIL tripwire) |
| 3 | [`tb-contribute`](./tb-contribute/SKILL.md) | a single, parametrized skill (`--type=...`) replacing 11 v1 skills |
| 4 | [`tb-pr-craft`](./tb-pr-craft/SKILL.md) | assemble PR title + body and re-check the tripwire |
| — | [`tb-triage`](./tb-triage/SKILL.md) | on-demand sweep of all open PRs |
| — | [`tb-pr-followup`](./tb-pr-followup/SKILL.md) | scheduled per-PR checkpoints (24h / 48h / 7d) |
| — | [`tb-self-improve`](./tb-self-improve/SKILL.md) | end-of-session: events → lesson lifecycle proposals |

## Composition

Within `tb-session`, the typical happy path is:

```
tb-discover → tb-vet-repo → tb-contribute (--type=typo) → tb-pr-craft
```

`tb-pr-followup` runs at session start (or via launchd) and only acts on
PRs whose `next_checkpoint_at` has elapsed. `tb-triage` is an on-demand
human-invoked sweep. `tb-self-improve` runs at session end.

## Adding a new skill

This bar is high. The 8-skill list is intended to be stable. Before adding:

1. Could the new behavior live as a contribution-type entry in
   `kb/contribution-types.yaml` (parametrizing `tb-contribute`)? Most
   "I want a new contribution kind" cases land here.
2. Is it a sub-step of an existing skill? Document it inline.
3. Only if neither fits, propose a new SKILL.md and update this README.
