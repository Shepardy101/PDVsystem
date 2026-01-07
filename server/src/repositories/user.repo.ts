import { db } from '../db/database';

export async function listUsers() {
  const rows = db.prepare('SELECT id, name, email, role, status, lastLogin FROM users').all();
  return rows;
}

export async function createUser({ name, email, role, status, password }: any) {
  // Simples: salva senha em texto (ajustar para hash em produção)
  const stmt = db.prepare('INSERT INTO users (name, email, role, status, password) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(name, email, role, status ? 'active' : 'inactive', password);
  return { id: info.lastInsertRowid, name, email, role, status: status ? 'active' : 'inactive' };
}
