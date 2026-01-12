-- Migration: Criação da tabela de sessões de caixa
CREATE TABLE IF NOT EXISTS cash_sessions (
    id TEXT PRIMARY KEY,
    operator_id TEXT NOT NULL,
    opened_at DATETIME NOT NULL,
    closed_at DATETIME,
    initial_balance INTEGER NOT NULL,
    final_balance INTEGER,
    status TEXT NOT NULL DEFAULT 'open',
    user_id TEXT NOT NULL DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
