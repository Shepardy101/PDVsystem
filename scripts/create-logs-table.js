const Database = require('better-sqlite3');
const db = new Database('data/novabev.sqlite');
const sql = `
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info',
  context_json TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_level_created_at ON logs (level, created_at DESC);
`;
db.exec(sql);
console.log('Logs table ensured.');
