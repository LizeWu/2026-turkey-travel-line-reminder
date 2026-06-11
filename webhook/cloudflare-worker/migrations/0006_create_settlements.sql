CREATE TABLE IF NOT EXISTS settlements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  chat_type TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  settlement_key TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  currency_label TEXT NOT NULL,
  currency_symbol TEXT,
  from_user_id TEXT NOT NULL,
  from_name TEXT,
  to_user_id TEXT NOT NULL,
  to_name TEXT,
  amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'settled',
  settled_by_id TEXT,
  settled_by_name TEXT,
  settled_at TEXT NOT NULL,
  updated_at TEXT,
  note TEXT,
  UNIQUE (trip_id, ledger_id, settlement_key)
);

CREATE INDEX IF NOT EXISTS idx_settlements_ledger
  ON settlements (trip_id, ledger_id, status);

CREATE INDEX IF NOT EXISTS idx_settlements_pair
  ON settlements (trip_id, ledger_id, currency_code, from_user_id, to_user_id);
