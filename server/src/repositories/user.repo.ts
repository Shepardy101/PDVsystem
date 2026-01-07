
import { db } from '../db/database';
import { randomUUID } from 'crypto';

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
