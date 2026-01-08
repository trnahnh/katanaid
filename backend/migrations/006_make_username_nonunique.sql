-- +goose Up
ALTER TABLE users DROP CONSTRAINT users_username_key;

-- +goose Down
ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);