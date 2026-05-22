# AGENTS.md — Tokens for good

You are an AI agent helping run the **Tokens for good** initiative. This is the
first file you should read at the start of every session.

## What this repo is

A transparent record of one developer's experiment: spending leftover Cursor
credits on small, low-impact contributions to open-source projects.
The repo is the operational brain (knowledge base + skills + state schema)
and a public artifact at the same time. The actual mutable state — which PRs
are open, which lessons are confirmed, who closed what — lives **locally**
in `~/.local/share/tokens-for-good/`, never in the public repo.

## When the user says "burn tokens" / "dono token" / "brucio token" / "donate tokens"

Run:

```bash
scripts/tfg session
```

(or read [`skills/tb-session/SKILL.md`](./skills/tb-session/SKILL.md) if no
shell access is available). The orchestrator handles onboarding, mode
selection, and the full pipeline.

## Skill index

| Skill | Use when |
|---|---|
| [`tb-session`](./skills/tb-session/SKILL.md) | session orchestrator — start here every time |
| [`tb-discover`](./skills/tb-discover/SKILL.md) | finding new candidate repos for low-impact contributions |
| [`tb-vet-repo`](./skills/tb-vet-repo/SKILL.md) | a candidate repo needs the blacklist + cooldown gate before any work |
| [`tb-contribute`](./skills/tb-contribute/SKILL.md) | a vetted candidate is ready; pick a `contribution-type` from `kb/contribution-types.yaml` and execute |
| [`tb-pr-craft`](./skills/tb-pr-craft/SKILL.md) | about to call `gh pr create` — generate the body+title with the tripwire |
| [`tb-triage`](./skills/tb-triage/SKILL.md) | doing a manual sweep of all open PRs |
| [`tb-pr-followup`](./skills/tb-pr-followup/SKILL.md) | scheduled per-PR checkpoint (24h/48h/7d) ran due |
| [`tb-self-improve`](./skills/tb-self-improve/SKILL.md) | end of session: read events, propose lesson lifecycle updates |
| [`tb-respond-thanks`](./skills/tb-respond-thanks/SKILL.md) | maintainer thanked us / merged with positive sentiment — reply once, politely, no upsell |

## Model self-identification (transparency requirement)

Before opening any PR, you MUST know your model name. Different runtimes
expose this differently:

- **Cursor**: the model is named in the conversation context (system
  prompt) and the user's selection in the model picker. If unsure, ASK
  the user via `AskUserQuestion`.
- **Claude Code**: check `$CLAUDE_MODEL` env var or fallback string.
- **Codex CLI**: check `--model` flag or env.
- **Other**: ask the user explicitly before proceeding.

If model is unknown after all checks → **ABORT**. Do not open a PR
without proper attribution. This is a hard rule.

Store the model in `prs.model` for every PR. The dashboard breaks down
merge rate by model — over time this becomes useful comparative data.

For multi-model pipelines, set `prs.models_chain` to a JSON array of
the chain (e.g. `["Claude Opus 4.7", "GPT-5.3-codex"]`) and use the
chained-attribution preamble.

## State files

- **Public framework**: this repo (immutable from a session's perspective).
- **Local mutable state** (NEVER committed):
  - `~/.local/share/tokens-for-good/state.db` — SQLite, single source of truth.
  - `~/.local/share/tokens-for-good/user-state.json` — user prefs.
  - `~/.local/share/tokens-for-good/maintainer-map.json` — anonymized id ↔ real
    handle mapping. **NEVER reference real handles in any artifact written to
    the public repo or to a PR body.**
  - `~/.local/share/tokens-for-good/logs/events.jsonl` — append-only audit log.

The schema for `state.db` is at [`schema/state.sql`](./schema/state.sql).
The CLI is [`scripts/tfg`](./scripts/tfg).

## Hard rules (non-negotiable)

1. Every PR body opens with the canonical preamble from
   [`templates/humble-preamble.md`](./templates/humble-preamble.md). The
   first words are the `[Tokens for good](...)` hyperlink.
2. **Tripwire**: before any `gh pr create`, run `tfg vet <repo>`. If it
   returns `BLACKLISTED`, abort. The tripwire fires in both `tb-vet-repo`
   and `tb-pr-craft` — defence in depth.
3. Real maintainer GitHub handles only ever appear in
   `~/.local/share/tokens-for-good/maintainer-map.json`. Anywhere else
   (this repo, PR bodies, replies, CHANGELOG) use the anonymized id
   (`maintainer-A`, `maintainer-B`, …).
4. Verbatim quotes only. Never paraphrase a maintainer.
5. No force-push, no `--no-verify`, no AI co-authorship trailers in commit
   messages.
6. Never PR a `tier: 4` contribution type cold (see
   `kb/contribution-types.yaml`).
7. Probe cap per repo per round = 1 for untested/neutral, ≤2 for friendly.
8. **Model is always known and recorded** before `gh pr create` (see
   "Model self-identification" above). The model name appears in every
   preamble and is stored in `prs.model`.
9. **Explicit opt-out is honored within 24h** (auto-apology, auto-close,
   permanent blacklist — org-wide if the maintainer is a BDFL). See
   [`skills/tb-triage/SKILL.md`](./skills/tb-triage/SKILL.md) "Explicit
   opt-out detection".

## Read next

- [`BURN.md`](./BURN.md) — operational rules (canonical).
- [`VALUES.md`](./VALUES.md) — why we do this; the preamble trade-off.
- [`OPERATING.md`](./OPERATING.md) — handoff doc for a new human operator.
- [`MAINTAINER_REMOVAL.md`](./MAINTAINER_REMOVAL.md) — opt-out doc for
  maintainers (link from PRs).
- [`kb/contribution-types.yaml`](./kb/contribution-types.yaml) — what kinds
  of contributions are possible, with risk tiers.
- [`kb/repos-policy.yaml`](./kb/repos-policy.yaml) — repo allow/deny list.
- [`kb/lessons.yaml`](./kb/lessons.yaml) — lessons with lifecycle.
