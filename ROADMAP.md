# Roadmap

This repo is the software half of a longer-term plan. The hardware half is
still in design. Phases are sequential but overlap in practice.

## Phase 1 — Hosted token-burn pilot (current, May 2026)

Spend leftover Cursor subscription credits on OSS contributions via hosted
models. Goal: validate the contribution-type taxonomy, build the framework,
accumulate the knowledge base.

**Status**: active. See live dashboard in [README.md](./README.md).

## Phase 2 — Local inference prototyping (Q3–Q4 2026)

Stand up a small GPU rig (target: 1–2 consumer-grade GPUs). Run open-weights
models locally. Adapt the framework to run against a local runtime.

Goals:

- Baseline open-weights vs. hosted on the same OSS tasks.
- Measure tokens-per-kWh and tokens-per-amortized-dollar.
- Compare merge rate vs. hosted models.

## Phase 3 — Solar-powered always-on (2027+)

Pair the rig with photovoltaic panels + a battery buffer. Run continuous
low-impact OSS contribution work using only solar-generated energy. Throttle
to battery state.

Operational principles:

- Zero grid energy during normal operation.
- Open and transparent power-budget logs (publish kWh per session in the
  dashboard).
- Throttle / pause when battery below threshold.

## Phase 4 — Federation (speculative, 2028+)

Open how-to guide for others with spare solar capacity. Federated KB sharing
so independent nodes don't repeat each other's mistakes (e.g. a shared
blacklist of repos that have explicitly opted out).

## Non-goals

- Profit.
- Scale for its own sake.
- Replacing human contributors.
- Hiding the AI nature of the work.
- Contributing where unwelcome.
