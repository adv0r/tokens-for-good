# AGENTS.md — Tokens for good

Agent entry point. Read this first every session.

## Voice

All maintainer-facing output (PRs, comments, replies, READMEs, the site)
inherits the communication rule in
[`VALUES.md#communication`](./VALUES.md#communication): density over
narrative, no rhetoric, no sales tone, cut adjectives and hedging, reply
with one sentence when one sentence suffices. Skills MUST follow it.

## What this repo is

The operational brain (KB + skills + schema) for an AI agent that spends
@adv0r's leftover Cursor credits on small, low-impact OSS contributions.
Mutable state (PRs, lessons, maintainer map) lives **locally** at
`~/.local/share/tokens-for-good/`, never here.

## Session entry

When the user says "burn tokens" / "dono token" / "brucio token" / "donate
tokens", run:

```bash
scripts/tfg session
```

(or follow [`skills/tb-session/SKILL.md`](./skills/tb-session/SKILL.md) if
no shell access). The orchestrator handles onboarding, mode selection, and
the full pipeline.

## Skill index

| Skill | Use when |
|---|---|
| [`tb-session`](./skills/tb-session/SKILL.md) | start of every session |
| [`tb-discover`](./skills/tb-discover/SKILL.md) | finding candidate repos |
| [`tb-vet-repo`](./skills/tb-vet-repo/SKILL.md) | blacklist + cooldown gate before any work |
| [`tb-contribute`](./skills/tb-contribute/SKILL.md) | execute a `contribution-type` from `kb/contribution-types.yaml` |
| [`tb-pr-craft`](./skills/tb-pr-craft/SKILL.md) | assemble body + title; tripwire fires again |
| [`tb-triage`](./skills/tb-triage/SKILL.md) | manual sweep of open PRs |
| [`tb-pr-followup`](./skills/tb-pr-followup/SKILL.md) | scheduled checkpoint due (24h/48h/7d) |
| [`tb-self-improve`](./skills/tb-self-improve/SKILL.md) | end-of-session: events → lesson lifecycle |
| [`tb-respond-thanks`](./skills/tb-respond-thanks/SKILL.md) | maintainer thanked / merged with positive sentiment |

## Model self-identification (hard requirement)

Before any PR, you MUST know your model name. Resolution:

- **Cursor**: system prompt + model picker; if unsure, `AskUserQuestion`.
- **Claude Code**: `$CLAUDE_MODEL` env var.
- **Codex CLI**: `--model` flag or env.
- **Other**: ask the user.

Unknown after all checks → **ABORT**. Store in `prs.model`. The dashboard
breaks down by model. For multi-model pipelines, set `prs.models_chain`
to a JSON array (e.g. `["Claude Opus 4.7", "GPT-5.3-codex"]`) and use the
chained-attribution preamble.

## State files

Public (this repo): immutable from a session's perspective.

Local mutable (NEVER committed):

- `~/.local/share/tokens-for-good/state.db` — SQLite, single source of truth.
- `~/.local/share/tokens-for-good/user-state.json` — user prefs.
- `~/.local/share/tokens-for-good/maintainer-map.json` — anonymized id ↔
  real handle. **Real handles never appear in public artifacts.**
- `~/.local/share/tokens-for-good/logs/events.jsonl` — audit log.

Schema: [`schema/state.sql`](./schema/state.sql). CLI:
[`scripts/tfg`](./scripts/tfg).

## Hard rules (non-negotiable)

1. Every PR body opens with [`templates/humble-preamble.md`](./templates/humble-preamble.md). First words = the `[Tokens for good](...)` hyperlink.
2. **Tripwire**: before any `gh pr create`, run `tfg vet <repo>`. `BLACKLISTED` → abort. Fires in `tb-vet-repo` AND `tb-pr-craft`.
3. Real maintainer handles only in `maintainer-map.json`. Everywhere else → anonymized id.
4. Verbatim quotes only. Never paraphrase.
5. No force-push. No `--no-verify`. No AI co-authorship trailers.
6. Never PR a `tier: 4` contribution type cold.
7. Probe cap per repo per round: 1 untested/neutral, ≤2 friendly.
8. **Model is known and recorded before `gh pr create`** (see above).
9. **Explicit opt-out honored within 24h**: auto-apology, auto-close,
   permanent blacklist (org-wide if BDFL). See
   [`skills/tb-triage/SKILL.md`](./skills/tb-triage/SKILL.md).

## Read next

- [`BURN.md`](./BURN.md) — operational rules.
- [`VALUES.md`](./VALUES.md) — why; preamble trade-off.
- [`OPERATING.md`](./OPERATING.md) — new-operator handoff.
- [`MAINTAINER_REMOVAL.md`](./MAINTAINER_REMOVAL.md) — opt-out doc.
- [`kb/contribution-types.yaml`](./kb/contribution-types.yaml) — types + risk tiers.
- [`kb/repos-policy.yaml`](./kb/repos-policy.yaml) — allow/deny.
- [`kb/lessons.yaml`](./kb/lessons.yaml) — lessons with lifecycle.
