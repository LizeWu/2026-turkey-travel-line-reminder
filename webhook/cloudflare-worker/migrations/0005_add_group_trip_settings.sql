CREATE TABLE IF NOT EXISTS group_trip_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_type TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  active_trip_id TEXT NOT NULL,
  updated_by_user_id TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE (chat_type, chat_id)
);

CREATE INDEX IF NOT EXISTS idx_group_trip_settings_trip
  ON group_trip_settings (active_trip_id, chat_type, chat_id);
