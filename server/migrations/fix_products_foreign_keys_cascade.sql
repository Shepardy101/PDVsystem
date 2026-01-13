-- Migração: Corrige constraints de FOREIGN KEY para products com ON DELETE CASCADE

-- 1. Renomeia tabela sale_items
ALTER TABLE sale_items RENAME TO sale_items_old;

-- 2. Cria nova tabela sale_items com ON DELETE CASCADE para product_id
CREATE TABLE sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name_snapshot TEXT NOT NULL,
  product_internal_code_snapshot TEXT NOT NULL,
  product_ean_snapshot TEXT NOT NULL,
  unit_snapshot TEXT NOT NULL CHECK(unit_snapshot IN ('cx','unit','kg')),
  quantity INTEGER NOT NULL,
  unit_price_at_sale INTEGER NOT NULL,
  auto_discount_applied INTEGER NOT NULL DEFAULT 0,
  manual_discount_applied INTEGER NOT NULL DEFAULT 0,
  final_unit_price INTEGER NOT NULL,
  line_total INTEGER NOT NULL,
  FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 3. Copia dados antigos
INSERT INTO sale_items SELECT * FROM sale_items_old;

-- 4. Remove tabela antiga
DROP TABLE sale_items_old;

-- 5. Renomeia tabela stock_movements
ALTER TABLE stock_movements RENAME TO stock_movements_old;

-- 6. Cria nova tabela stock_movements com ON DELETE CASCADE para product_id
CREATE TABLE stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('sale_out','manual_in','manual_out','adjustment','import_in')),
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_type TEXT NOT NULL CHECK(reference_type IN ('sale','import','manual')),
  reference_id TEXT NULL,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 7. Copia dados antigos
INSERT INTO stock_movements SELECT * FROM stock_movements_old;

-- 8. Remove tabela antiga
DROP TABLE stock_movements_old;

-- Repita para outras tabelas que referenciam products caso existam.