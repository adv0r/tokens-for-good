# Changelog

All notable changes to the Tokens for good knowledge base. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — but
structured around what the agent learns, not just code changes.

## 2026-05-22 — v0.2.0 — round 2: rename, bidirectional learn, model transparency, opt-out, solar vision, GitHub Pages

Renamed the project from `token-for-good` to **`tokens-for-good`** (plural)
across the GitHub repo, local directories, and every file. GitHub's
automatic redirect keeps existing PR preambles working.

Five coordinated changes on top of the rename:

- **Bidirectional self-improve.** New `repo_type_affinity` table +
  `v_friendly_targets` view. `tb-self-improve` now scans positive signals
  (merges, thank-you regex, explicit invitations, GitHub reactions) and
  proposes promotion `neutral → friendly → highly-friendly`. New 9th
  skill `tb-respond-thanks` (with hard "one reply per maintainer per
  30 days" cap) for the polite-thanks micro-flow. `tb-discover` now has a
  70/30 explore/exploit balance against `v_friendly_targets`.
- **Model transparency.** Added `prs.model`, `prs.models_chain`,
  `prs.runtime` columns. Preamble (and both PR body templates) take a
  `{{model}}` placeholder. `tb-pr-craft` now has a MANDATORY model-id
  step that aborts the PR if the model can't be resolved.
  `tfg stats` prints per-model merge rate / thanked counts. `AGENTS.md`
  documents the per-runtime resolution rules.
- **Solar / local-inference vision.** New [`ROADMAP.md`](./ROADMAP.md)
  describes the four-phase plan (hosted pilot → local prototype →
  solar-powered always-on → federation). README and VALUES.md gained
  matching sections explaining why this is a pilot for a future
  off-grid rig.
- **Opt-out invitation.** Preamble now explicitly invites a one-line
  "no thanks" reply (e.g. *"this kind of PR isn't welcome here"*).
  `tb-triage` gains an "Explicit opt-out detection" section: regex
  scan → auto-apology reply → auto-close PR → auto-blacklist (org-wide
  if BDFL) → event `explicit_optout`. New template
  [`templates/reply-apology-stop.md`](./templates/reply-apology-stop.md).
  `tfg stats` prints "EXPLICIT OPT-OUTS HONORED" with avg time-to-honor.
- **GitHub Pages rich dashboard.** New `docs/` Jekyll site
  (theme: `minima`) with an interactive Chart.js v4 dashboard at
  `docs/dashboard/`. Charts: merge-rate trend by ISO week, PRs by
  contribution type (stacked), merge rate by model, top friendly
  repos, KPI cards including opt-outs honored. New `tfg pages-build`
  subcommand regenerates `docs/dashboard/data.json` from `state.db`.
  Placeholder workflow at `.github/workflows/update-pages.yml`
  documents the Phase 2 intent (CI-driven refresh).

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
