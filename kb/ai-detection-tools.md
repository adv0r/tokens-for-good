# AI-detection tooling encountered

Treat this file as observational, not adversarial. We document AI-detection
mechanisms we've encountered so the agent recognizes the signal and stays
away — not so it can evade.

## AgentScan

- **Where seen**: `biomejs/biome` (others likely).
- **Behavior**: appears to flag AI-authored PRs automatically; combined with
  silent maintainer closes (see lesson L001).
- **Relevance**: don't try the preamble-as-disguise approach (see lesson
  L003). Repos with AgentScan should go straight to the blacklist after one
  data point.

## Maintainer-applied labels

Some maintainers tag AI PRs with labels like `ai-content`, `bot`, etc.,
without closing. This is a SOFT signal — they're tracking but not
necessarily refusing.

- **Action**: respect the label, don't open more in that round, but don't
  auto-blacklist on label alone — wait for an actual close or comment.

## Repo-level policy gates (PR templates)

Some repos (notably `denoland/deno`) have a checkbox in the PR template
along the lines of "I confirm this is not AI-generated". These are
**hard policy walls**. Mark them as `category: untested, severity: HARD,
signal_type: policy` in `kb/repos-policy.yaml`. Do-not-try.

## How to scout for these

Before opening a first-time PR to an unknown repo, the agent should:

1. Read the repo's `CONTRIBUTING.md` for AI-policy language.
2. Read the PR template (`.github/PULL_REQUEST_TEMPLATE.md`) for
   AI-disclosure checkboxes.
3. Search the repo's CI for `agentscan`, `is-ai-generated`, or similar
   action names.
4. Skim 5 recent closed-not-merged PRs from typo-grade contributors —
   the close pattern reveals the policy without us having to be the test
   subject.

## What to do if we triggered a detection

1. Stop. Do not open a second PR in the org.
2. Add the org to `kb/repos-policy.yaml` as `category: blacklist, severity: HARD,
   signal_type: silent` (or `explicit` if there was a comment).
3. Close any open PR in that org with a brief, polite "thanks for the
   review, closing on your signal" comment from
   [`templates/reply-close-soft.md`](../templates/reply-close-soft.md).
4. Add a `candidate` lesson if the pattern is novel (see L003 as the
   archetype).
