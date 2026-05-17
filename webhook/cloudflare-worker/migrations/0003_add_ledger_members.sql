CREATE TABLE IF NOT EXISTS ledger_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  chat_type TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  UNIQUE (trip_id, ledger_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ledger_members_user
  ON ledger_members (trip_id, user_id, status);

CREATE INDEX IF NOT EXISTS idx_ledger_members_ledger
  ON ledger_members (trip_id, ledger_id, status);
