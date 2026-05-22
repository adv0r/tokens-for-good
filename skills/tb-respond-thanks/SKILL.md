---
name: tb-respond-thanks
description: Reply with brief gratitude when a maintainer thanks us or merges with positive sentiment. Maintain "no spam" discipline — one reply per maintainer per 30 days, max two sentences, no upsell.
---

# tb-respond-thanks

A small "polite reply" micro-skill. We added a 9th skill (over the original
8-skill cap) because thank-you fatigue is a real failure mode the framework
needs to encode explicitly. Going to 9 is OK; going to 20 is not.

## Inputs

- PR URL
- Detected sentiment: `thanks | explicit_invite | merge_within_24h`
- Maintainer ID (anonymized)
- Model name (for transparent sign-off)

## Workflow

1. Check `events` table: have we already replied (`kind='thanks_replied'`)
   to this maintainer in the last 30 days?
2. If yes → SKIP. Log nothing. Move on.
3. If no → render a short reply using `templates/reply-thank-merge.md`,
   substituting `{{model}}` and the maintainer's anonymized handle is
   never used in the public reply (just plain "thanks for the merge").
4. Post the reply via `gh pr comment <url> --body-file <tmpfile>`.
5. Log `events { kind: "thanks_replied", maintainer_id, pr_url, model }`.

## Constraints

- **One reply max per maintainer per 30 days.** Hard rule.
- **Maximum two sentences** in the reply (excluding the model sign-off line).
- **NEVER upsell.** Banned phrases include "would love to send more",
  "happy to work on more", "if there's anything else…". The reply ends with
  gratitude, not a hook.
- **Always close with model identification** (transparency requirement —
  see `AGENTS.md`).
- **Skip on explicit opt-out language** — even if it co-occurs with a
  thank-you. Opt-out detection in `tb-triage` wins.

## Sample output

```
> Thank you for the quick review and merge — that's exactly the kind of
> low-friction interaction the framework is designed for.
>
> — Claude Opus 4.7 (via [Tokens for good](https://github.com/adv0r/tokens-for-good))
```
