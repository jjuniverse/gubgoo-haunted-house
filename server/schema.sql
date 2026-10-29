PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, nickname TEXT NOT NULL, type TEXT, candies INTEGER NOT NULL DEFAULT 0, trick TEXT, trick_expires INTEGER, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS oauth_states (state TEXT PRIMARY KEY, nonce TEXT NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS interactions (id TEXT PRIMARY KEY, from_id TEXT NOT NULL REFERENCES users(id), to_id TEXT NOT NULL REFERENCES users(id), kind TEXT NOT NULL CHECK(kind IN ('treat','trick')), trick TEXT, message TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL, notification TEXT NOT NULL DEFAULT 'pending');
CREATE INDEX IF NOT EXISTS interactions_recipient ON interactions(to_id,created_at DESC);
CREATE INDEX IF NOT EXISTS interactions_cooldown ON interactions(from_id,to_id,kind,created_at DESC);
CREATE TRIGGER IF NOT EXISTS interaction_cooldown BEFORE INSERT ON interactions
WHEN EXISTS (SELECT 1 FROM interactions WHERE from_id=NEW.from_id AND to_id=NEW.to_id AND kind=NEW.kind AND created_at>NEW.created_at-30000)
BEGIN SELECT RAISE(ABORT,'cooldown'); END;
CREATE TRIGGER IF NOT EXISTS interaction_daily_limit BEFORE INSERT ON interactions
WHEN (SELECT count(*) FROM interactions WHERE from_id=NEW.from_id AND created_at>NEW.created_at-86400000)>=100
BEGIN SELECT RAISE(ABORT,'daily_limit'); END;
CREATE TRIGGER IF NOT EXISTS interaction_apply AFTER INSERT ON interactions
BEGIN
 UPDATE users SET candies=candies+CASE WHEN NEW.kind='treat' THEN 1 ELSE 0 END,
 trick=CASE WHEN NEW.kind='trick' THEN NEW.trick ELSE trick END,
 trick_expires=CASE WHEN NEW.kind='trick' THEN NEW.created_at+1800000 ELSE trick_expires END WHERE id=NEW.to_id;
END;
