export function closeCashSession(sessionId: string, physicalCount: number) {
  const now = Date.now();
  // Busca totais das vendas do caixa
  const sales = db.prepare('SELECT * FROM sales WHERE cash_session_id = ?').all(sessionId);
  const totalVendas = sales.reduce((acc, s) => acc + (s.total || 0), 0);
  // Atualiza sessão de caixa como fechada
  const session = db.prepare('SELECT * FROM cash_sessions WHERE id = ?').get(sessionId);
  const difference = physicalCount - totalVendas;
  db.prepare('UPDATE cash_sessions SET closed_at = ?, is_open = 0, physical_count_at_close = ?, difference_at_close = ?, updated_at = ? WHERE id = ?')
    .run(now, physicalCount, difference, now, sessionId);
  // Retorna resumo do fechamento
  return {
    sessionId,
    operatorId: session.operator_id,
    openedAt: session.opened_at,
    closedAt: now,
    initialBalance: session.initial_balance,
    physicalCount,
    totalVendas,
    difference,
    sales
  };
}
import { db } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export function openCashSession(operatorId: string, initialBalance: number) {
  const now = Date.now();
  const session = {
    id: uuidv4(),
    operator_id: operatorId,
    opened_at: now,
    closed_at: null,
    initial_balance: Math.round(initialBalance * 100),
    is_open: 1,
    physical_count_at_close: null,
    difference_at_close: null,
    created_at: now,
    updated_at: now
  };
  try {
    const result = db.prepare(`INSERT INTO cash_sessions (id, operator_id, opened_at, closed_at, initial_balance, is_open, physical_count_at_close, difference_at_close, created_at, updated_at)
      VALUES (@id, @operator_id, @opened_at, @closed_at, @initial_balance, @is_open, @physical_count_at_close, @difference_at_close, @created_at, @updated_at)`).run(session);
    console.log('[CASH] INSERT cash_sessions result:', result);
  } catch (err) {
    console.error('[CASH] Falha ao inserir cash_sessions:', err);
    throw err;
  }
  return session;
}

export function getOpenCashSession() {
  return db.prepare('SELECT * FROM cash_sessions WHERE is_open = 1 ORDER BY opened_at DESC LIMIT 1').get();
}
