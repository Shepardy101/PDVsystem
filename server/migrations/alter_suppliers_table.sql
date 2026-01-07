-- Migration: Adicionar colunas extras à tabela suppliers
ALTER TABLE suppliers ADD COLUMN fantasy TEXT;
ALTER TABLE suppliers ADD COLUMN cnpj TEXT;
ALTER TABLE suppliers ADD COLUMN category TEXT;
ALTER TABLE suppliers ADD COLUMN email TEXT;
ALTER TABLE suppliers ADD COLUMN phone TEXT;
ALTER TABLE suppliers ADD COLUMN address TEXT;
