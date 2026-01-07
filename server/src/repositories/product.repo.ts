
import { db } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export function deleteProduct(id: string) {
  console.log(`[deleteProduct] Buscando produto id=${id}`);
  const existing = getProductById(id);
  if (!existing) {
    console.error(`[deleteProduct] Produto não encontrado id=${id}`);
    throw { code: 'NOT_FOUND', message: 'Produto não encontrado.' };
  }
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    console.log(`[deleteProduct] Produto removido id=${id}`);
  } catch (err) {
    console.error(`[deleteProduct] Erro ao remover produto id=${id}:`, err);
    throw err;
  }
}

export interface Product {
  id: string;
  name: string;
  ean: string;
  internal_code: string;
  unit: 'cx' | 'unit' | 'kg';
  cost_price: number;
  sale_price: number;
  auto_discount_enabled: number;
  auto_discount_value: number;
  category_id?: string;
  supplier_id?: string;
  status: 'active' | 'inactive';
  stock_on_hand: number;
  created_at: number;
  updated_at: number;
}

export function listProducts(limit = 50, offset = 0) {
  const items = db.prepare('SELECT * FROM products ORDER BY name LIMIT ? OFFSET ?').all(limit, offset);
  const total = db.prepare('SELECT COUNT(*) as total FROM products').get().total;
  return { items, total };
}

export function searchProducts(q: string) {
  if (!q) return { items: [] };
  const isNumeric = /^\d+$/.test(q);
  let items: Product[] = [];
  if (isNumeric || q.length <= 6) {
    items = db.prepare('SELECT * FROM products WHERE internal_code = ? OR ean = ?').all(q, q) as Product[];
    if (items.length > 0) return { items };
  }
  items = db.prepare('SELECT * FROM products WHERE name LIKE ? ORDER BY name LIMIT 50').all(`%${q}%`) as Product[];
  return { items };
}

export function getProductById(id: string) {
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

export function getProductByEAN(ean: string) {
  return db.prepare('SELECT * FROM products WHERE ean = ?').get(ean);
}

export function getProductByInternalCode(internal_code: string) {
  return db.prepare('SELECT * FROM products WHERE internal_code = ?').get(internal_code);
}

export function createProduct(data: any) {
  // Validação
  if (!data.name || !data.ean || !data.internalCode || !data.unit) {
    console.error('[createProduct] Campos obrigatórios ausentes:', data);
    throw { code: 'VALIDATION_ERROR', message: 'Campos obrigatórios ausentes.' };
  }
  if (!['cx', 'unit', 'kg'].includes(data.unit)) {
    console.error('[createProduct] Unidade inválida:', data.unit);
    throw { code: 'VALIDATION_ERROR', message: 'Unidade inválida.' };
  }
  if (getProductByEAN(data.ean)) {
    console.error('[createProduct] EAN já cadastrado:', data.ean);
    throw { code: 'DUPLICATE_EAN', message: 'EAN já cadastrado.' };
  }
  if (getProductByInternalCode(data.internalCode)) {
    console.error('[createProduct] Código interno já cadastrado:', data.internalCode);
    throw { code: 'DUPLICATE_INTERNAL_CODE', message: 'Código interno já cadastrado.' };
  }
  const now = Date.now();
  const product: Product = {
    id: uuidv4(),
    name: data.name,
    ean: data.ean,
    internal_code: data.internalCode,
    unit: data.unit,
    cost_price: Math.round((data.costPrice || 0) * 100),
    sale_price: Math.round((data.salePrice || 0) * 100),
    auto_discount_enabled: data.autoDiscountEnabled ? 1 : 0,
    auto_discount_value: Math.round((data.autoDiscountValue || 0) * 100),
    category_id: data.categoryId || null,
    supplier_id: data.supplierId || null,
    status: data.status || 'active',
    stock_on_hand: data.stockOnHand || 0,
    created_at: now,
    updated_at: now
  };
  try {
    db.prepare(`INSERT INTO products (
      id, name, ean, internal_code, unit, cost_price, sale_price, auto_discount_enabled, auto_discount_value, category_id, supplier_id, status, stock_on_hand, created_at, updated_at
    ) VALUES (
      @id, @name, @ean, @internal_code, @unit, @cost_price, @sale_price, @auto_discount_enabled, @auto_discount_value, @category_id, @supplier_id, @status, @stock_on_hand, @created_at, @updated_at
    )`).run(product);
    console.log('[createProduct] Produto inserido com sucesso:', product);
    return product;
  } catch (err) {
    console.error('[createProduct] Erro ao inserir produto:', err, product);
    throw err;
  }
}

export function updateProduct(id: string, data: any) {
  const existing = getProductById(id);
  if (!existing || typeof existing !== 'object') throw { code: 'NOT_FOUND', message: 'Produto não encontrado.' };
  if (!data.name || !data.ean || !data.internalCode || !data.unit) {
    throw { code: 'VALIDATION_ERROR', message: 'Campos obrigatórios ausentes.' };
  }
  if (!['cx', 'unit', 'kg'].includes(data.unit)) {
    throw { code: 'VALIDATION_ERROR', message: 'Unidade inválida.' };
  }
  const eanOwner = getProductByEAN(data.ean);
  if (eanOwner && eanOwner.id !== id) {
    throw { code: 'DUPLICATE_EAN', message: 'EAN já cadastrado.' };
  }
  const codeOwner = getProductByInternalCode(data.internalCode);
  if (codeOwner && codeOwner.id !== id) {
    throw { code: 'DUPLICATE_INTERNAL_CODE', message: 'Código interno já cadastrado.' };
  }
  const now = Date.now();
  const updated = {
    ...(existing as object),
    name: data.name,
    ean: data.ean,
    internal_code: data.internalCode,
    unit: data.unit,
    cost_price: Math.round((data.costPrice || 0) * 100),
    sale_price: Math.round((data.salePrice || 0) * 100),
    auto_discount_enabled: data.autoDiscountEnabled ? 1 : 0,
    auto_discount_value: Math.round((data.autoDiscountValue || 0) * 100),
    category_id: data.categoryId || null,
    supplier_id: data.supplierId || null,
    status: data.status || 'active',
    stock_on_hand: data.stockOnHand || 0,
    updated_at: now
  };
  db.prepare(`UPDATE products SET
    name=@name, ean=@ean, internal_code=@internal_code, unit=@unit, cost_price=@cost_price, sale_price=@sale_price, auto_discount_enabled=@auto_discount_enabled, auto_discount_value=@auto_discount_value, category_id=@category_id, supplier_id=@supplier_id, status=@status, stock_on_hand=@stock_on_hand, updated_at=@updated_at
    WHERE id=@id
  `).run({ ...updated, id });
  return updated;
}
