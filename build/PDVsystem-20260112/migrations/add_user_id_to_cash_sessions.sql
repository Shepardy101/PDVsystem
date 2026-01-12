-- Migration: Adiciona campo user_id à tabela cash_sessions para controle individual de caixa
ALTER TABLE cash_sessions ADD COLUMN user_id TEXT NOT NULL DEFAULT '';
-- Opcional: Atualizar registros existentes para o usuário root ou outro padrão
UPDATE cash_sessions SET user_id = 'root' WHERE user_id = '' OR user_id IS NULL;