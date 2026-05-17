ALTER TABLE expenses ADD COLUMN split_method TEXT NOT NULL DEFAULT 'none';
ALTER TABLE expenses ADD COLUMN split_members TEXT;
