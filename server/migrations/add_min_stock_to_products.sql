-- Adiciona a coluna min_stock à tabela products
ALTER TABLE products ADD COLUMN min_stock INTEGER NOT NULL DEFAULT 20;