-- +goose Up
ALTER TABLE users DROP COLUMN IF EXISTS name;

-- +goose Down
ALTER TABLE users ADD COLUMN name TEXT;
