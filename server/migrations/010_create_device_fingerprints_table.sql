-- +goose Up
CREATE TABLE device_fingerprints (
    id SERIAL PRIMARY KEY,
    fingerprint_hash VARCHAR(64) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    screen_resolution VARCHAR(20),
    timezone VARCHAR(100),
    language VARCHAR(20),
    platform VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ip_signups (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    signup_count INTEGER DEFAULT 1,
    first_signup_at TIMESTAMP DEFAULT NOW(),
    last_signup_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fingerprint_hash ON device_fingerprints(fingerprint_hash);
CREATE INDEX idx_fingerprint_user ON device_fingerprints(user_id);
CREATE INDEX idx_fingerprint_ip ON device_fingerprints(ip_address);
CREATE INDEX idx_ip_signups_ip ON ip_signups(ip_address);

-- +goose Down
DROP INDEX IF EXISTS idx_ip_signups_ip;
DROP INDEX IF EXISTS idx_fingerprint_ip;
DROP INDEX IF EXISTS idx_fingerprint_user;
DROP INDEX IF EXISTS idx_fingerprint_hash;
DROP TABLE IF EXISTS ip_signups;
DROP TABLE IF EXISTS device_fingerprints;