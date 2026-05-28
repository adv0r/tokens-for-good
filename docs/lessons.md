---
layout: page
title: Lessons
permalink: /lessons/
---

_Auto-synced from `kb/lessons.md` by `tfg pages-build`. Edit the source, not this copy._

# Lessons learned

_This file is auto-generated from `kb/lessons.yaml` by `tfg lessons render`._
_Edit the YAML and re-render. Direct edits to this file will be overwritten._

Confidence: **LOW** = 1 data point | **MEDIUM** = 2–3 | **HIGH** = 4+
Status: **candidate** → **active** → **confirmed** → **retired**

## L001 — Silent maintainer-led closures are signal, not noise

Closures by core maintainers within < 2h, with no comment, are an anti-AI
signal. Treat them as if the maintainer had said "no thank you".

- **Status**: `confirmed`
- **Confidence**: `HIGH`
- **Created**: 2026-05-21
- **Sources**:
  - pre-commit @maintainer-G ~3.5h close
  - biome @maintainer-E silent + AgentScan
  - ruff @maintainer-D ~14min close
  - flask @maintainer-F ~90min close
  - godot-docs ~40min close
- **Rule**:
  > Classify silent fast-close by core maintainer as a blacklist signal
  > automatically. Do not reopen, do not file new PRs in the same org.

## L002 — Single-BDFL orgs reject AI PRs at much higher rates

Repos with one dominant maintainer reject AI PRs more aggressively than
larger maintainer communities — even for trivial fixes that other orgs
merge.

- **Status**: `active`
- **Confidence**: `MEDIUM`
- **Created**: 2026-05-21
- **Sources**:
  - pallets @maintainer-F
  - astral-sh @maintainer-D
  - pre-commit @maintainer-G
- **Rule**:
  > Extra-careful with single-BDFL orgs; default to NO unless the maintainer
  > has publicly opted in to AI contributions.

## L003 — Humble preamble is a values tool, not a stealth tool

The preamble doesn't bypass AI-detection bots — AgentScan caught us at
biome despite a clear preamble. But the preamble earned us an explicit
"no matter who/what wrote it" merge at astropy. Treat it as values
alignment, not a cloaking device.

- **Status**: `confirmed`
- **Confidence**: `HIGH`
- **Created**: 2026-05-21
- **Sources**:
  - astropy/astropy#19787 merge
  - biomejs/biome#10434 close
- **Rule**:
  > Keep the preamble for transparency; never tweak it to evade detection.

## L004 — Auto-typo-batching pipelines exist

Some repos (notably neovim) label typo PRs and merge them on a schedule
rather than reviewing each one synchronously.

- **Status**: `candidate`
- **Confidence**: `LOW`
- **Created**: 2026-05-21
- **Sources**:
  - neovim/neovim#39929 (typo auto-batch label applied)
- **Rule**:
  > In scouting, prefer repos that label typo PRs — they tend to be
  > AI-tolerant by accident.

## L005 — HEREDOC over-escapes backticks in PR bodies

Bash heredoc passed to `gh pr create --body "$(cat <<EOF ... EOF)"`
produces escaped backticks in the rendered Markdown, which makes the PR
look broken and signals "automation" to maintainers.

- **Status**: `confirmed`
- **Confidence**: `HIGH`
- **Created**: 2026-05-21
- **Sources**:
  - @maintainer-L on jupyter/notebook#7922
- **Rule**:
  > ALWAYS use `gh pr create --body-file /tmp/pr-body.md`, never HEREDOC.

## L006 — Closes

Maintainers want `Closes #N` only when the PR fully resolves the issue.
Using it on partial fixes makes the issue auto-close on merge — which
is annoying.

- **Status**: `active`
- **Confidence**: `MEDIUM`
- **Created**: 2026-05-21
- **Sources**:
  - @maintainer-H on gohugoio/hugoDocs#3505
- **Rule**:
  > `Closes #N` only if the PR fully resolves; else `Related to #N`.

## L007 — PR body length should be proportional to fix substance

A 200-word PR body on a 1-character typo annoys maintainers more than
it helps. Friendly merges across MDN, Astropy, and Neovim all came with
very short bodies.

- **Status**: `active`
- **Confidence**: `MEDIUM`
- **Created**: 2026-05-21
- **Sources**:
  - implicit pattern across MDN, Astropy, Neovim merges
  - explicit ack in gohugoio/hugoDocs reviews
- **Rule**:
  > < 8 lines for trivial fixes; ~15 lines for small/medium.

## L008 — Doubled-article heuristic ~80% true-positive rate

Pattern: `the the`, `a a`, `is is`, `to to` in doc comments and
markdown. Faster and cleaner than codespell; fewer false positives on
technical identifiers.

- **Status**: `confirmed`
- **Confidence**: `HIGH`
- **Created**: 2026-05-21
- **Sources**:
  - 3/8 R5 PRs found valid candidates this way
  - 4/10 R6 PRs found valid candidates this way
- **Rule**:
  > Prefer doubled-article scan over raw codespell for first-pass scouting.
  > Always verify by reading 5 lines of context.

## L009 — codespell ~50% true-positive rate on technical repos

Codespell flags lots of false positives on technical identifiers, proper
nouns, and base64 strings. Useful but noisy.

- **Status**: `confirmed`
- **Confidence**: `HIGH`
- **Created**: 2026-05-21
- **Sources**:
  - ~half of codespell hits across 6 sessions were false positives
  - many hits in vendored deps / generated files
- **Rule**:
  > Every codespell hit needs manual verification. Never blindly apply
  > `--write-changes`.

## L010 — golang/go is not a cold tier-1 typo target

golang/go routes GitHub PRs through Gerrit (Gopherbot). Review happens on
go-review.googlesource.com, not on GitHub comments. Commit titles must use
package paths (e.g. `doc/godebug:` not `doc:`). The first PR comment becomes
the Gerrit commit body — tokens-for-good preamble + opt-out boilerplate is
the wrong shape for golang's template.

Composer PR golang/go#79723 (doubled-article fix in doc/godebug.md) was
still OPEN with zero maintainer comments at 2026-05-28 triage. Duplicate
#79724 was closed by @adv0r, not a maintainer. No maintainer rejection
quote exists yet on #79723 — this lesson is policy-driven until outcome
is known.

- **Status**: `candidate`
- **Confidence**: `LOW`
- **Created**: 2026-05-28
- **Sources**:
  - go.dev/doc/contribute — issue linking + Gerrit review process
  - gopherbot on golang/go#79036 — Gerrit import message
  - Composer PR golang/go#79723 (open, no maintainer reply)
  - adv0r close comment on golang/go#79724 (duplicate, not rejection)
- **Rule**:
  > Do not cold-open tier-1 typo/broken-link PRs against golang/go. Skip in
  > tb-discover. If a golang fix is ever attempted: strip tokens-for-good
  > preamble from the Gerrit commit body, use package-scoped title, follow
  > go.dev/wiki/CommitMessage, expect Gerrit not GitHub replies.

