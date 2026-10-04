CREATE TABLE IF NOT EXISTS members (
 email TEXT PRIMARY KEY,
 code_hash TEXT,
 code_expires INTEGER,
 activated_at INTEGER,
 revoked INTEGER NOT NULL DEFAULT 0,
 created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS login_codes (
 email TEXT PRIMARY KEY,
 code_hash TEXT NOT NULL,
 expires INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY,
 email TEXT NOT NULL REFERENCES members(email),
 expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires);
CREATE UNIQUE INDEX IF NOT EXISTS sessions_email_unique ON sessions(email);
CREATE TABLE IF NOT EXISTS rate_limits (
 key TEXT PRIMARY KEY,
 count INTEGER NOT NULL,
 expires INTEGER NOT NULL
);
