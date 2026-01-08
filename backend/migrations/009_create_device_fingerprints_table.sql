-- +goose Up
CREATE TABLE IF NOT EXISTS device_fingerprints (
    id SERIAL PRIMARY KEY,
    fingerprint_hash VARCHAR(64) NOT NULL UNIQUE,
    first_seen_at TIMESTAMP DEFAULT NOW(),
    last_seen_at TIMESTAMP DEFAULT NOW(),
    associated_user_ids INTEGER[] DEFAULT '{}',
    risk_score INTEGER DEFAULT 0,
    total_signups INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fingerprint_hash ON device_fingerprints(fingerprint_hash);

-- +goose Down
DROP TABLE IF EXISTS device_fingerprints;