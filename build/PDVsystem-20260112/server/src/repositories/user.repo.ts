// Busca usuário por email (para login)
export async function findUserByEmail(email: string) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

import { randomUUID } from 'crypto';
import db from '../db/database';

export async function listUsers() {
  const rows = db.prepare('SELECT id, name, email, role, status, lastLogin FROM users').all();
  return rows;
}

export async function createUser({ name, email, role, status, password }: any) {
  // Gera id string (UUID)
  const id = randomUUID();
  const stmt = db.prepare('INSERT INTO users (id, name, email, role, status, password) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run(id, name, email, role, status ? 'active' : 'inactive', password);
  return { id, name, email, role, status: status ? 'active' : 'inactive' };
}

export async function updateUser(id: string, { name, email, role, status }: any) {
  const stmt = db.prepare('UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ?');
  const info = stmt.run(name, email, role, status ? 'active' : 'inactive', id);
  return info.changes > 0;
}

export async function deleteUser(id: string) {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
}
