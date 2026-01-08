-- +goose Up
CREATE TABLE IF NOT EXISTS captcha_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_type VARCHAR(32) NOT NULL,
    challenge_data JSONB DEFAULT '{}',
    token VARCHAR(64) NOT NULL UNIQUE,
    ip_address INET,
    fingerprint_hash VARCHAR(64),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    solved_at TIMESTAMP,
    solve_time_ms INTEGER,
    passed BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(3,2)
);

CREATE INDEX idx_captcha_token ON captcha_challenges(token);
CREATE INDEX idx_captcha_expires ON captcha_challenges(expires_at);

-- +goose Down
DROP TABLE IF EXISTS captcha_challenges;