-- +goose Up
CREATE TABLE spam_checks (
    id SERIAL PRIMARY KEY,
    email_hash VARCHAR(64) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    risk_score DECIMAL(3,2) NOT NULL,
    flags TEXT[] DEFAULT '{}',
    checked_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_spam_checks_email_hash ON spam_checks(email_hash);
CREATE INDEX idx_spam_checks_domain ON spam_checks(domain);

-- +goose Down
DROP INDEX IF EXISTS idx_spam_checks_domain;
DROP INDEX IF EXISTS idx_spam_checks_email_hash;
DROP TABLE IF EXISTS spam_checks;