CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id TEXT NOT NULL,
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  currency_code TEXT NOT NULL,
  currency_label TEXT NOT NULL,
  currency_symbol TEXT,
  category TEXT NOT NULL,
  note TEXT,
  payer_id TEXT,
  payer_name TEXT,
  chat_type TEXT NOT NULL DEFAULT 'user',
  chat_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_expenses_trip_date
  ON expenses (trip_id, date, deleted_at);

CREATE INDEX IF NOT EXISTS idx_expenses_created_at
  ON expenses (created_at);
