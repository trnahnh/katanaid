-- +goose Up
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;

-- +goose Down
ALTER TABLE users DROP COLUMN IF EXISTS name;
