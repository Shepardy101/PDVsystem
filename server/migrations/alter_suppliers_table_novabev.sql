-- Migration: Adicionar colunas extras à tabela suppliers em data/novabev.sqlite
ALTER TABLE suppliers ADD COLUMN fantasy TEXT;
-- Garante que todos os campos estejam presentes
ALTER TABLE suppliers ADD COLUMN cnpj TEXT;
ALTER TABLE suppliers ADD COLUMN category TEXT;
ALTER TABLE suppliers ADD COLUMN email TEXT;
ALTER TABLE suppliers ADD COLUMN phone TEXT;
ALTER TABLE suppliers ADD COLUMN address TEXT;
