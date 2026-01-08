-- +goose Up
CREATE TABLE IF NOT EXISTS email_reputation (
    id SERIAL PRIMARY KEY,
    email_domain VARCHAR(255) NOT NULL UNIQUE,
    is_disposable BOOLEAN DEFAULT FALSE,
    domain_age_days INTEGER,
    has_valid_mx BOOLEAN,
    risk_score INTEGER DEFAULT 50,
    last_checked_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_reputation_domain ON email_reputation(email_domain);

-- +goose Down
DROP TABLE IF EXISTS email_reputation;