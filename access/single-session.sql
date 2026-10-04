-- Preserve the latest session per email; break equal-expiry ties consistently.
DELETE FROM sessions WHERE EXISTS (
 SELECT 1 FROM sessions newer WHERE newer.email=sessions.email
 AND (newer.expires>sessions.expires OR (newer.expires=sessions.expires AND newer.token_hash>sessions.token_hash))
);
CREATE UNIQUE INDEX IF NOT EXISTS sessions_email_unique ON sessions(email);
