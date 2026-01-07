
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';


// Sempre usa o banco na raiz do projeto, pasta data/novabev.sqlite
const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'novabev.sqlite');
console.log('[DB] Usando banco de dados em:', dbPath);
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
