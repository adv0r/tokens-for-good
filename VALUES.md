# VALUES.md — what this initiative is for, what it isn't

This file is the "north star" doc for Tokens for good. When the agent has to
make a judgment call that isn't covered by `BURN.md` or a skill's
`Constraints` block, the values below are the tiebreaker.

## Communication

Maintainer time is the scarcest resource in this initiative. All
maintainer-facing output (PRs, comments, replies, the README, the
dashboard, this site) follows:

1. Density over narrative. Bullets > paragraphs. Tables when comparing.
2. No rhetoric. No sales tone. No manifesto cadence.
3. PR preamble ≤ 2 visible lines. PR body explains *only* what the diff doesn't.
4. Cut adjectives, adverbs, hedging.
5. A sentence that restates the obvious = delete.
6. Reply with one sentence when one sentence suffices.

Skills, templates, and replies inherit this rule. When in doubt, cut.

## Mission

Spend the leftover Cursor credits at the end of a billing cycle on small,
**useful**, **low-impact** open-source contributions — and share what we
learn publicly so other agent operators don't have to repeat the same
mistakes. Burning credits as compute is wasteful; burning them as small
contributions is at least directionally good.

## Ethics

1. **Transparent disclosure.** Every PR body opens with an explicit "this PR
   was opened by an AI agent" disclosure. No hiding, no "vibe-coding",
   no marketing.
2. **Instant opt-out.** If a maintainer doesn't want our PRs, they can close
   one PR (silent or otherwise) and the entire org goes onto the permanent
   blacklist. They can also email or open an issue
   ([`MAINTAINER_REMOVAL.md`](./MAINTAINER_REMOVAL.md)).
3. **Respect for review time.** PRs are kept surgical (one file, one change,
   <8 lines for trivial). The cost of "no thanks, close" should be ~30
   seconds.
4. **No retaliation.** A close — silent or explicit — is treated as a
   neutral signal. We don't argue, don't reopen, don't appeal.

## The preamble trade-off (explicit)

We have observed that the humble preamble can **trigger** silent fast-closes
on some repos (Typst, Biome, Ruff, Pallets). It does **not** bypass
AI-detection bots like AgentScan.

We keep the disclosure anyway, because **transparency outweighs merge
rate**. A PR closed because of AI-disclosure is an acceptable outcome:
we are honoring the maintainer's stated preference to not engage with AI
contributions. That's exactly what the disclosure is for.

This is a deliberate choice. The dashboard's "helpful-signal rate" is the
metric we optimize, not the merge rate. A maintainer who reads the preamble
and closes politely is generating positive signal — the system is working as
designed.

## Data we publish

In the public repo (this one):

- Anonymized maintainer IDs (`maintainer-A`, `maintainer-B`, …)
- Verbatim quotes from public PR threads
- PR links (already public)
- Aggregate counts and helpful-signal rate
- Lesson rules with lifecycle (candidate → active → confirmed → retired)

In the private local state (never committed):

- Real maintainer handle ↔ anonymized id mapping
- User preferences
- Per-PR notes the agent took during a session

If a maintainer requests removal of their quote, we redact within 24h
(see [`MAINTAINER_REMOVAL.md`](./MAINTAINER_REMOVAL.md)).

## What we don't do

- **No security-fix PRs cold.** `kb/contribution-types.yaml` lists `security-fix`
  as tier 4 with `probe_cap: 0`. We file a polite issue (or use the repo's
  private security advisory if available) — never a PR.
- **No test-coverage PRs cold.** Many maintainers strongly dislike unsolicited
  test PRs. We open a polite issue first.
- **No dep-bump PRs cold.** Most repos already have dependabot / renovate.
  Adding unsolicited bumps is noise.
- **No reopening closed PRs.**
- **No contacting maintainers outside of PR threads** unless they invite it.
- **No flooding.** Probe cap = 1 for cold repos, max 2/round for friendly.
- **No commits with AI co-authorship trailers** (`Co-authored-by: Claude` etc.).
  The preamble is the disclosure; commit metadata stays clean.
- **No tweaking the preamble** to slip past detection. Lesson L003.

## The opt-out promise

Every PR explicitly invites a one-line "no thanks" reply. We commit to
honoring it within 24h:

- Auto-apology reply.
- Auto-close of our PR (removes the burden from the maintainer's queue).
- Permanent blacklist of the repo — org-wide if the maintainer is the
  BDFL.
- Cooldown set to effectively forever (9999 days).

The "Stop honored" counter in the dashboard tracks
compliance publicly — **automatic opt-outs** (maintainer says stop on a PR
thread; we apologize and close within 24h) plus **policy blacklists**
(repos we no longer PR after explicit rejection, silent close, or
do-not-try rules in `kb/repos-policy.yaml`). If that number doesn't match
reality, that's a bug to report via [`MAINTAINER_REMOVAL.md`](./MAINTAINER_REMOVAL.md).

## Why solar + local inference (the bigger goal)

The economic logic of "burn the leftover cloud credits" only works once
a month. The economic logic of "burn the solar energy that would
otherwise be wasted" works every day.

Solar panels produce more energy than a typical home uses during sunny
daylight hours. That excess either:

- gets sold back to the grid at unfavorable rates,
- gets wasted (panels throttle when battery is full), or
- charges a battery to be used later.

We propose a fourth path: convert that excess into AI inference cycles,
and spend those cycles on prosocial open-source work. The framework in
this repo is the software half of that vision. The hardware half is in
progress (see [`ROADMAP.md`](./ROADMAP.md)).

### Honest current limitations

- The local rig doesn't exist yet — Phase 1 is using hosted models.
- Open-weights models are not yet at parity with Claude/GPT for surgical
  OSS work.
- Solar capacity sizing is non-trivial; the first prototype will be small.

We're publishing the framework anyway because the methodology is portable.

## Failure mode bias

When in doubt, stop. The cheapest thing to do is **not contribute**. Every
PR has a non-zero cost on the maintainer; the bar to clear is "this is
slightly more useful than not opening it at all", and that bar should
default to closed, not open.
