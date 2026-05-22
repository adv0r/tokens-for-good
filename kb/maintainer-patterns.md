# Maintainer patterns

Per-maintainer notes on response style, what they merge, what they reject.
Maintainer handles are anonymized as `maintainer-X`. The mapping
anonymized-id → real handle lives in `~/.local/share/tokens-for-good/maintainer-map.json`
(private, never committed). Quotes are verbatim from public PR threads.
We do not include emails or DMs even if shared publicly.

## Friendly / explicit-tolerant

### maintainer-H (Hugo docs)

- **Style**: fast, surgical merger. Loves `+3/-0` diffs.
- **Cares about**: `Closes #N` discipline (lesson L006). Will reword PR
  bodies inline if the contributor doesn't follow the convention.
- **Score**: merged 3/3 of our PRs in their docs repo.
- **Verdict**: AI-friendly conditional. Stay surgical.

### maintainer-I (Astropy)

- **Style**: explicit AI-friendly stance on doc/typo PRs.
- **Score**: merged our `astropy/astropy#19787` typo fix.
- **Verdict**: AI-friendly. Single trivial fix per round still recommended.

### maintainer-J (Astropy)

- **Style**: values pushback on AI for triviality even within an
  AI-friendly org. Respects substance over noise.
- **Verdict**: AI-tolerant but allergic to bulk. One thoughtful fix per
  round.

### maintainer-K (MDN docs)

- **Style**: accepts AI spelling/grammar on docs.
- **Boundary**: no chained edits — keep PRs independent.
- **Verdict**: AI-friendly within MDN's contributor guidelines.

## Articulate rejectors

### maintainer-B (JupyterLab)

- **Style**: articulate rejector. Wants human review *before* submission.
- **Action taken**: closed 4 of our jupyterlab docs PRs in one sweep.
- **Verdict**: HARD blacklist for `jupyterlab/*`.

### maintainer-A (Jupyter org)

- **Style**: explicit, organized. Recommends cross-org blocking.
- **Quote**: "self-identified as unattended spam, I suggest blocking the user across all orgs"
- **Verdict**: HARD org-wide blacklist for `jupyter/*`. Do not retry.

### maintainer-L (Jupyter)

- **Style**: helpful even in a rejection. Pointed out HEREDOC-rendering bug
  on `jupyter/notebook#7922`.
- **Verdict**: contributed lesson L005 (HEREDOC over-escapes backticks). We
  owe them.

### maintainer-C (Typst)

- **Style**: blunt, explicit.
- **Quote**: "Do not vibecode the change!"
- **Verdict**: HARD blacklist for `typst/*`.

## Silent closers (still HARD signal — see L001)

### maintainer-G (pre-commit, pyupgrade)

- **Style**: terse, silent closer. Closes within hours, no comment.
- **Verdict**: HARD blacklist. Do not retry.

### maintainer-D (astral-sh)

- **Style**: silent closer. Closed our `ruff` PR within 14 minutes, no
  comment.
- **Verdict**: HARD blacklist for `astral-sh/*`.

### maintainer-F (Pallets)

- **Style**: silent closer in a single-BDFL org (lesson L002).
- **Verdict**: HARD blacklist for `pallets/*`.

### maintainer-E (Biome)

- **Style**: silent closer; repo is AgentScan-equipped.
- **Verdict**: HARD blacklist. AgentScan-equipped repos are easy to
  identify in advance — see `kb/ai-detection-tools.md`.

## Adding a new pattern

When adding a new maintainer:

1. Generate the next free anonymized id (`maintainer-M`, `maintainer-N`, …)
   and add it to `~/.local/share/tokens-for-good/maintainer-map.json`.
2. Add one section here grouped by friendliness band (friendly / articulate
   rejector / silent closer).
3. Always include the org/repo they steward and at least one PR URL as
   evidence (PR URLs are public).
4. Quotes verbatim. Paraphrases must be flagged with `(paraphrase)`.
5. Note style cues (response speed, tone, what they care about). These
   generalize better than verdicts and are what tb-self-improve uses to
   propose new lessons.
