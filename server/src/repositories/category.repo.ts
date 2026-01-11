import db from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export interface Category {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
}

export function listCategories() {
  return db.prepare('SELECT * FROM categories ORDER BY name').all();
}

export function getCategoryById(id: string) {
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
}

export function getCategoryByName(name: string) {
  return db.prepare('SELECT * FROM categories WHERE name = ?').get(name);
}

export function createCategory(name: string) {
  if (!name) throw { code: 'VALIDATION_ERROR', message: 'Nome obrigatório.' };
  if (getCategoryByName(name)) throw { code: 'DUPLICATE', message: 'Categoria já existe.' };
  const now = Date.now();
  const category: Category = {
    id: uuidv4(),
    name,
    created_at: now,
    updated_at: now
  };
  db.prepare('INSERT INTO categories (id, name, created_at, updated_at) VALUES (@id, @name, @created_at, @updated_at)').run(category);
  return category;
}

export function deleteCategory(id: string) {
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
}

export function updateCategory(id: string, name: string) {
  const now = Date.now();
  db.prepare('UPDATE categories SET name = ?, updated_at = ? WHERE id = ?').run(name, now, id);
}
