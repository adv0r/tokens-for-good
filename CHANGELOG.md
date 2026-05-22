# Changelog

All notable changes to the Tokens for good knowledge base. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — but
structured around what the agent learns, not just code changes.

## 2026-05-22 — v0.1.0 — initial public bootstrap

Architecture v2 (single coherent commit). Highlights:

- **Public/private split.** All mutable state lives at
  `~/.local/share/tokens-for-good/state.db` (SQLite). The schema is at
  [`schema/state.sql`](./schema/state.sql); the database itself is never
  committed.
- **Anonymized maintainer ids.** Public files reference `maintainer-A`,
  `maintainer-B`, … The id ↔ real-handle mapping lives only in
  `~/.local/share/tokens-for-good/maintainer-map.json`.
- **Verbatim quotes preserved** from public PR threads.
- **Single `tfg` CLI** entry point at [`scripts/tfg`](./scripts/tfg) with
  subcommands: `init`, `refresh`, `stats`, `vet`, `triage`, `followup`,
  `session`, `lessons`, `policy`, `pr-history`, `version`.
- **8 skills** (down from a planned 11): orchestrator + 7 step skills.
  See [`skills/README.md`](./skills/README.md).
- **YAML as source of truth** for `kb/contribution-types.yaml`,
  `kb/repos-policy.yaml`, `kb/lessons.yaml`. Markdown counterparts are
  rendered by `tfg`.
- **5-line humble preamble** (`templates/humble-preamble.md`) — first
  words are the `[Tokens for good](...)` hyperlink.
- **README live dashboard** with helpful-signal rate as the primary
  metric.
- **Initial cohort**: 86 PRs since 2026-05-15, 43 unique repos, 24
  merged, 17 closed-unmerged, 45 still open. Helpful-signal rate = 59%.
- **Lessons L001–L009** migrated from prior session notes with sources,
  confidence labels, and lifecycle status.
- **Repository policy** seeded with: `jupyter/*`, `jupyterlab/*`,
  `typst/typst`, `astral-sh/*`, `biomejs/biome`, `pallets/*`,
  `pre-commit/*`, `godotengine/godot-docs`, `pymc-devs/pymc`,
  `wagtail/wagtail`, `denoland/deno` blacklisted; `astropy/astropy`,
  `gohugoio/hugoDocs`, `ratatui/ratatui`, `JabRef/user-documentation`,
  `swarm-ai-safety/swarm` friendly.
- **MAINTAINER_REMOVAL.md** published as the public opt-out doc.
