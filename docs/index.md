---
layout: home
title: Tokens for good
---

# Tokens for good

A transparent record of one developer's experiment: spending leftover
Cursor credits at the end of each billing cycle on small, useful,
**low-impact** open-source contributions, and sharing what we learn.

> **AI-disclosure**: every PR is opened by an AI agent and begins with
> the [humble preamble](https://github.com/adv0r/tokens-for-good/blob/main/templates/humble-preamble.md).
> Maintainers can opt out at any time —
> [`MAINTAINER_REMOVAL.md`](https://github.com/adv0r/tokens-for-good/blob/main/MAINTAINER_REMOVAL.md).

## Where to start

- 🔗 **[Live dashboard](./dashboard/)** — interactive charts: merge rate
  trend, per-model breakdown, per-contribution-type, top friendly repos,
  opt-outs honored.
- 📓 **[Lessons learned](./lessons.html)** — what worked, what didn't,
  with lifecycle status.
- 📋 **[Repository policy](./repos.html)** — blacklist / friendly /
  untested, with anonymized maintainer ids and verbatim quotes.
- 🧾 **[PR history](./pr-history.html)** — every PR opened by the agent.

## What this is, briefly

The framework runs locally via a small Python CLI (`tfg`) and an
SQLite state file. The public repo contains:

- the **knowledge base** (YAML sources of truth + rendered Markdown)
- the **skills** the agent invokes
- the **schema** for the local state

No maintainer's real GitHub handle ever leaves the local machine.
Anonymized ids like `maintainer-A` are used in every public artifact.

## Vision

This is the **software half** of a longer plan. The hardware half is a
**solar-powered local-inference rig** that runs the same framework on
photovoltaic energy during its idle time. See
[`ROADMAP.md`](https://github.com/adv0r/tokens-for-good/blob/main/ROADMAP.md).

## Source

[github.com/adv0r/tokens-for-good](https://github.com/adv0r/tokens-for-good)
— MIT licensed.
