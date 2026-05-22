# BURN.md — operational rules

Public mirror of the canonical operational rulebook for the Tokens for good
agent. The agent reads from `~/.cursor/rules/burn.md` (which can be
symlinked to this file). Updates flow: edit here → push → symlink picks up.

> **Preamble template**: see [`templates/humble-preamble.md`](./templates/humble-preamble.md) (single source of truth).
> **Contribution types**: see [`kb/contribution-types.yaml`](./kb/contribution-types.yaml).
> **Repository policy**: see [`kb/repos-policy.yaml`](./kb/repos-policy.yaml) (rendered: [`kb/repos-policy.md`](./kb/repos-policy.md)).
> **Lessons**: see [`kb/lessons.yaml`](./kb/lessons.yaml) (rendered: [`kb/lessons.md`](./kb/lessons.md)).

## What this is

Personal initiative by @adv0r to spend leftover Cursor credits at the end of
each billing cycle on small, useful, low-impact OSS contributions. The agent
runs unattended (or with light confirm-mode supervision), opens narrow PRs
(typo fixes, broken-link repairs, doc clarifications), and learns from the
result.

The values doc is [`VALUES.md`](./VALUES.md). Read it once, then come back
here for rules.

## Hard rules (non-negotiable)

1. **Preamble first**. Every PR body opens with
   [`templates/humble-preamble.md`](./templates/humble-preamble.md). The first
   words are the `[Tokens for good](...)` hyperlink. No exceptions, no
   tweaks to evade detection.
2. **Tripwire**. Before any `gh pr create`, run `tfg vet <repo>`. If
   `BLACKLISTED`, abort. The check fires in `tb-vet-repo` and again in
   `tb-pr-craft` — defence in depth.
3. **Contribution-type gating**. Read
   [`kb/contribution-types.yaml`](./kb/contribution-types.yaml). Any type
   with `tier: 4` or `probe_cap: 0` is **not** a PR — it's an issue at most.
4. **Anonymization**. Real maintainer handles only ever appear in
   `~/.local/share/tokens-for-good/maintainer-map.json`. Anywhere else
   (this repo, PR bodies, replies, CHANGELOG) use the anonymized id.
5. **Verbatim quotes only**. Never paraphrase a maintainer.
6. **No reopening closed PRs**. A close is the end of the conversation.
7. **No force-push, no `--no-verify`, no AI co-authorship trailers** in
   commit messages.
8. **Probe cap**: 1 per repo per round for untested/neutral, ≤2 for friendly,
   honoring `probe_cap` from `kb/contribution-types.yaml`.

## Soft rules (override only with explicit user instruction)

- PR body length proportional to fix substance (lesson L007). Trivial = <8
  lines. Standard = ~15 lines.
- `Closes #N` only on full resolutions; `Related to #N` for partial (L006).
- `gh pr create --body-file /tmp/pr-body.md`, never HEREDOC (L005).
- Single-BDFL orgs require extra-careful gating (L002).
- Silent fast-close from a core maintainer = blacklist signal (L001).

## Decision tree (high-level)

```
session start
  └─ tb-session  (orchestrator)
        ├─ tfg refresh
        ├─ tfg followup        (act on PRs at checkpoint)
        ├─ tfg triage          (sweep open PRs)
        ├─ tb-discover         (find new candidates)
        │     └─ tb-vet-repo   (HARD-FAIL tripwire)
        │           └─ tb-contribute --type=<type from contribution-types.yaml>
        │                 └─ tb-pr-craft (preamble + tripwire again)
        │                       └─ gh pr create
        └─ tb-self-improve     (event log → propose lesson lifecycle updates)
session end
```

## What "burn token initiative" means

- Cursor sub renews mid-month; we do bursts of 1–3 sessions in the days
  before renewal.
- Round size: 8–15 PRs (or issue comments) per session.
- Allocate by tier: ≥70% tier-1 (typo, broken-link), ≤30% tier-2.
- Tier 3 only with explicit user nod, tier 4 never as PR.
- Stop conditions:
  - 3 consecutive cold-close PRs in the round (signal we're off-target).
  - Any AgentScan-style flag triggers (lesson L003).
  - User says "stop".

## Public mirror

This file is committed to the public Tokens for good repo for transparency.
The canonical agent rules in `~/.cursor/rules/burn.md` may either be a
symlink to this file or a separate copy maintained in lockstep.

## See also

- [`AGENTS.md`](./AGENTS.md) — agent entry point.
- [`VALUES.md`](./VALUES.md) — why we do this.
- [`OPERATING.md`](./OPERATING.md) — human-operator handoff.
- [`MAINTAINER_REMOVAL.md`](./MAINTAINER_REMOVAL.md) — opt-out for maintainers.
