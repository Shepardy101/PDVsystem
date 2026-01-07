import { db } from '../db/database';
import { randomUUID } from 'crypto';

export async function listClients() {
  return db.prepare('SELECT * FROM clients').all();
}

export async function createClient({ name, cpf, address, phone, email }: any) {
  const id = randomUUID();
  const now = Date.now();
  const stmt = db.prepare('INSERT INTO clients (id, name, cpf, address, phone, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, name, cpf, address, phone, email, now, now);
  return { id, name, cpf, address, phone, email, created_at: now, updated_at: now };
}

export async function updateClient(id: string, { name, cpf, address, phone, email }: any) {
  const now = Date.now();
  const stmt = db.prepare('UPDATE clients SET name = ?, cpf = ?, address = ?, phone = ?, email = ?, updated_at = ? WHERE id = ?');
  const info = stmt.run(name, cpf, address, phone, email, now, id);
  return info.changes > 0;
}

export async function deleteClient(id: string) {
  const stmt = db.prepare('DELETE FROM clients WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
}
