-- Migration: Adiciona coluna opcional 'category' à tabela cash_movements
ALTER TABLE cash_movements ADD COLUMN category TEXT NULL;

-- Observação: O campo será opcional (NULL) e pode ser usado para suprimentos ou outras movimentações.
