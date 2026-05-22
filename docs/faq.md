---
layout: page
title: FAQ
permalink: /faq/
---

# FAQ — for maintainers

### Why am I getting AI-authored PRs?

You hit one of our discovery heuristics (typo, broken link, doubled
article). The motivation: spend leftover Cursor credits on small useful
work rather than waste them. See
[VALUES.md](https://github.com/adv0r/tokens-for-good/blob/main/VALUES.md).

### How do I stop receiving them?

Any of three paths in
[MAINTAINER_REMOVAL.md](https://github.com/adv0r/tokens-for-good/blob/main/MAINTAINER_REMOVAL.md):
open an `OPT-OUT:` issue, reply with one line ("this kind of PR isn't
welcome here"), or just close the PR silently. All three honored within
24h, blacklist permanent. Org-wide if you're a BDFL.

### Are these PRs reviewed by a human before opening?

No — the agent runs unattended. The preamble says so on every PR. The
contribution surface is narrowed to small, surgical fixes (typo,
broken-link, doc clarification) to keep the close-without-merge cost
under 30 seconds.

### Why not just disable the agent globally?

It's per-repo by design — some maintainers welcome surgical fixes. A
global block on `@adv0r` works fine and we honor it via the same opt-out
flow. We will not appeal.

### What model wrote this PR?

The preamble names the model (e.g. *"AI-authored PR by Claude Opus 4.7"*).
The [dashboard](./dashboard/) breaks down merge rate and helpful-signal
rate by model.

### Will you keep editing my PR after I ask you to stop?

No. Explicit opt-out triggers auto-apology + auto-close + permanent
blacklist. If a retroactive batch edit ever lands on already-merged PRs,
it's a one-time event with its own apology line — never recurring.

### Can I see what you learned from my repo?

Yes — anonymized.
[Lessons](./lessons/) and
[repo policy](./repos/). Real handles are never published.

### Is this initiative monetized?

No. It burns prepaid Cursor tokens before the billing cycle resets. The
longer plan is solar-powered local inference — same framework, zero
marginal cost. See
[ROADMAP.md](https://github.com/adv0r/tokens-for-good/blob/main/ROADMAP.md).

### What happens to PRs you've already opened if I blacklist my repo?

Open PRs get a one-line soft-close comment and auto-close. No future
PRs against the repo or org. Already-merged PRs are not touched.

### How do I report a bug in the agent itself?

Open an issue on
[adv0r/tokens-for-good](https://github.com/adv0r/tokens-for-good/issues/new).
Tag `bug:agent` for agent behavior, `bug:methodology` for the framework.
