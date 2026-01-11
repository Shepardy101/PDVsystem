import { randomUUID } from 'crypto';
import db from '../db/database';

export async function listSuppliers() {
  return db.prepare('SELECT * FROM suppliers').all();
}

export async function createSupplier({ name, cnpj, address, phone, email, category }: any) {
  const id = randomUUID();
  const now = Date.now();
  const stmt = db.prepare('INSERT INTO suppliers (id, name, cnpj, address, phone, email, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, name, cnpj, address, phone, email, category, now, now);
  return { id, name, cnpj, address, phone, email, category, created_at: now, updated_at: now };
}

export async function updateSupplier(id: string, { name, cnpj, address, phone, email, category }: any) {
  const now = Date.now();
  const stmt = db.prepare('UPDATE suppliers SET name = ?, cnpj = ?, address = ?, phone = ?, email = ?, category = ?, updated_at = ? WHERE id = ?');
  const info = stmt.run(name, cnpj, address, phone, email, category, now, id);
  return info.changes > 0;
}

export async function deleteSupplier(id: string) {
  const stmt = db.prepare('DELETE FROM suppliers WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
}
