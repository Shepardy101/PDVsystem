-- Migration: Criação da tabela de vendas
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  operator_id TEXT NOT NULL,
  cash_session_id TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  discount_total INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('completed')),
  created_at INTEGER NOT NULL,
  client_id TEXT NULL
);
