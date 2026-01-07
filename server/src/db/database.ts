
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(__dirname, '../../../../data');
const dbPath = path.join(dbDir, 'novabev.sqlite');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
export const db = new Database(dbPath);

// PRAGMA configs
export function setupPragmas() {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
}

setupPragmas();
