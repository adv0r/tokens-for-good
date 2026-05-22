# For maintainers: opt out, remove your data, give feedback

If you're an OSS maintainer who saw this link in one of our PRs and you'd
rather this AI **not contribute to your repo**, or you want **your quotes
removed** from this repo, you have three options.

## 1. One-click opt-out (easiest)

Open an issue in this repo titled exactly:

```
OPT-OUT: <your-org-or-repo>
```

Body can be one sentence. We'll add the repo or org to the permanent
blacklist within 24 hours, and verify on next session that no further PRs
are opened against it.

[**→ Open an opt-out issue**](https://github.com/adv0r/tokens-for-good/issues/new?title=OPT-OUT%3A%20%3Cyour-org-or-repo%3E&body=Please%20stop%20sending%20AI-authored%20PRs%20to%20this%20repo%2Forg.)

## 2. Email

Reach the handle owner via the GitHub profile of [@adv0r](https://github.com/adv0r).
Same effect as option 1; useful if you'd prefer not to make the request public.

## 3. Just close any PR

Closing a PR — silently or with one line of explanation — is itself a
sufficient signal. Lesson L001 in our knowledge base says:

> Closures by core maintainers within < 2h, with no comment, are an anti-AI
> signal. Treat them as if the maintainer had said "no thank you".

So even if you say nothing, we will:

1. Detect the close in our next sweep.
2. Add the org to `kb/repos-policy.yaml` with `category: blacklist, severity: HARD`.
3. Stop opening PRs to anything in that org from then on.

## Removing your quote

If you've appeared as `maintainer-X` in [`kb/repos-policy.yaml`](./kb/repos-policy.yaml)
or [`kb/lessons.yaml`](./kb/lessons.yaml) and you'd prefer your verbatim
quote removed entirely (rather than just anonymized), use option 1 or 2
above. We'll redact within 24h. The mapping between anonymized IDs and real
handles is held only locally on the operator's machine — it is never
committed to this repo.

## A few honest notes

- We are not trying to game maintainers. The preamble explicitly discloses
  AI authorship as the **first words** of the PR body, every time.
- We try to keep PRs small and surgical so the close-without-merge cost is
  small. But "small" still has cost — if even 30 seconds is too much,
  please tell us.
- We are not trying to defeat AI-detection bots. If your repo uses AgentScan
  or similar, we want to recognize the signal and stay away.
- This is a personal experiment. There is no upsell, no product, no funnel.

## Email template you can paste back to us

If you'd like, here's a short template for the OPT-OUT issue body:

```
Please stop sending AI-authored PRs to <org-or-repo>.

[ ] HARD opt-out (permanent — preferred)
[ ] SOFT opt-out (pause N=__ days, then I'll reconsider)

Optional: please redact the quote attributed to me in
kb/repos-policy.yaml line <N> / kb/lessons.yaml entry <Lxxx>.

Optional comment:
```

We'll respond by closing the issue with a confirmation comment once the
blacklist is updated.
