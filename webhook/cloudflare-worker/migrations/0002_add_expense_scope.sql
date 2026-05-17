ALTER TABLE expenses ADD COLUMN expense_scope TEXT NOT NULL DEFAULT 'personal';
ALTER TABLE expenses ADD COLUMN ledger_id TEXT;
ALTER TABLE expenses ADD COLUMN created_by_id TEXT;
ALTER TABLE expenses ADD COLUMN created_by_name TEXT;

CREATE INDEX IF NOT EXISTS idx_expenses_scope
  ON expenses (trip_id, expense_scope, payer_id, deleted_at);

CREATE INDEX IF NOT EXISTS idx_expenses_ledger
  ON expenses (trip_id, ledger_id, deleted_at);
