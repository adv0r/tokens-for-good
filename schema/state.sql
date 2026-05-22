-- Token for good — local state schema
-- Version 1.0 — 2026-05-22
--
-- This is the ONLY schema file in the public repo. The actual database
-- lives at ~/.local/share/token-for-good/state.db (NEVER committed).
-- Initialize with: sqlite3 ~/.local/share/token-for-good/state.db < schema/state.sql

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS prs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  url             TEXT NOT NULL UNIQUE,
  repo            TEXT NOT NULL,
  pr_number       INTEGER NOT NULL,
  contribution_type TEXT NOT NULL,             -- references contribution-types.yaml key
  title           TEXT,
  opened_at       TEXT NOT NULL,               -- ISO8601
  state           TEXT NOT NULL,               -- open|draft|merged|closed
  last_checked_at TEXT,
  next_checkpoint_at TEXT,                     -- for tb-pr-followup
  helpful_signal  INTEGER,                     -- +1 merged/positive, 0 neutral, -1 silent-close/negative
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_prs_repo ON prs(repo);
CREATE INDEX IF NOT EXISTS idx_prs_next_checkpoint ON prs(next_checkpoint_at) WHERE state IN ('open','draft');

CREATE TABLE IF NOT EXISTS repos (
  name              TEXT PRIMARY KEY,           -- e.g. "jupyter/notebook" or wildcards "astral-sh/*"
  category          TEXT NOT NULL,              -- blacklist|friendly|neutral|untested
  severity          TEXT,                       -- HARD|SOFT|CONDITIONAL
  signal_type       TEXT,                       -- explicit|silent|policy
  cooldown_days     INTEGER DEFAULT 7,
  last_pr_at        TEXT,
  notes             TEXT
);

CREATE TABLE IF NOT EXISTS lessons (
  id              TEXT PRIMARY KEY,              -- L001, L002, ...
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  status          TEXT NOT NULL,                 -- candidate|active|confirmed|retired
  confidence      TEXT NOT NULL,                 -- LOW|MEDIUM|HIGH
  citation_count  INTEGER DEFAULT 0,
  created_at      TEXT NOT NULL,
  retired_at      TEXT,
  retired_reason  TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  ts              TEXT NOT NULL,                 -- ISO8601
  skill           TEXT NOT NULL,                 -- e.g. "tb-pr-craft"
  kind            TEXT NOT NULL,                 -- pr_opened|pr_merged|pr_closed|lesson_cited|...
  pr_id           INTEGER REFERENCES prs(id),
  lesson_id       TEXT REFERENCES lessons(id),
  payload_json    TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
CREATE INDEX IF NOT EXISTS idx_events_kind ON events(kind);

CREATE TABLE IF NOT EXISTS config (
  key             TEXT PRIMARY KEY,
  value           TEXT
);

-- Computed view for helpful-signal-rate dashboard
CREATE VIEW IF NOT EXISTS v_dashboard AS
  SELECT
    COUNT(*) AS total_prs,
    SUM(CASE WHEN state = 'merged' THEN 1 ELSE 0 END) AS merged,
    SUM(CASE WHEN state = 'closed' THEN 1 ELSE 0 END) AS closed_unmerged,
    SUM(CASE WHEN state IN ('open','draft') THEN 1 ELSE 0 END) AS still_open,
    COUNT(DISTINCT repo) AS unique_repos,
    SUM(CASE WHEN helpful_signal > 0 THEN 1 ELSE 0 END) AS helpful_count,
    SUM(CASE WHEN helpful_signal < 0 THEN 1 ELSE 0 END) AS unhelpful_count,
    CAST(SUM(CASE WHEN helpful_signal > 0 THEN 1 ELSE 0 END) AS REAL) /
      NULLIF(COUNT(CASE WHEN helpful_signal IS NOT NULL THEN 1 END), 0) AS helpful_signal_rate
  FROM prs;
