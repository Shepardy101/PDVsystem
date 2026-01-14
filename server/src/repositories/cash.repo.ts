import db from '../db/database';
import { v4 as uuidv4 } from 'uuid';

// Adiciona movimentação de pagamento
export function addPagamentoMovement({ amount, category, description, operatorId, cashSessionId }: {
  amount: number;
  category: string;
  description: string;
  operatorId: string;
  cashSessionId: string;
}) {
  const now = Date.now();
  const id = uuidv4();
  // Armazena em centavos
  const value = Math.round(amount * 100);
  db.prepare(`INSERT INTO cash_movements (id, type, direction, amount, category, description, operator_id, cash_session_id, timestamp, reference_type, reference_id, metadata_json, created_at)
    VALUES (?, 'adjustment', 'out', ?, ?, ?, ?, ?, ?, 'manual', NULL, NULL, ?)
  `).run(id, value, category, description, operatorId, cashSessionId, now, now);
  return {
    id,
    type: 'pagamento',
    direction: 'out',
    amount: value,
    category,
    description,
    operator_id: operatorId,
    cash_session_id: cashSessionId,
    timestamp: now,
    created_at: now
  };
}
// Adiciona movimentação de sangria
export function addSangriaMovement({ amount, category, description, operatorId, cashSessionId }: {
  amount: number;
  category: string;
  description: string;
  operatorId: string;
  cashSessionId: string;
}) {
  const now = Date.now();
  const id = uuidv4();
  // Armazena em centavos
  const value = Math.round(amount * 100);
  db.prepare(`INSERT INTO cash_movements (id, type, direction, amount, category, description, operator_id, cash_session_id, timestamp, reference_type, reference_id, metadata_json, created_at)
    VALUES (?, 'withdraw_out', 'out', ?, ?, ?, ?, ?, ?, 'manual', NULL, NULL, ?)
  `).run(id, value, category, description, operatorId, cashSessionId, now, now);
  return {
    id,
    type: 'sangria',
    direction: 'out',
    amount: value,
    category,
    description,
    operator_id: operatorId,
    cash_session_id: cashSessionId,
    timestamp: now,
    created_at: now
  };
}
// Busca todas as movimentações do caixa atual
export function getCashMovementsBySession(cashSessionId: string) {
  return db.prepare('SELECT * FROM cash_movements WHERE cash_session_id = ? ORDER BY timestamp ASC').all(cashSessionId);
}
// Adiciona movimentação de suprimento
export function addSuprimentoMovement({ amount, category, description, operatorId, cashSessionId }: {
  amount: number;
  category: string;
  description: string;
  operatorId: string;
  cashSessionId: string;
}) {
  const now = Date.now();
  const id = uuidv4();
  // Armazena em centavos
  const value = Math.round(amount * 100);
  db.prepare(`INSERT INTO cash_movements (id, type, direction, amount, category, description, operator_id, cash_session_id, timestamp, reference_type, reference_id, metadata_json, created_at)
    VALUES (?, 'supply_in', 'in', ?, ?, ?, ?, ?, ?, 'manual', NULL, NULL, ?)
  `).run(id, value, category, description, operatorId, cashSessionId, now, now);
  return {
    id,
    type: 'suprimento',
    direction: 'in',
    amount: value,
    category,
    description,
    operator_id: operatorId,
    cash_session_id: cashSessionId,
    timestamp: now,
    created_at: now
  };
}
export function closeCashSession(sessionId: string, physicalCount: number) {
  const now = Date.now();
  // Busca totais das vendas do caixa
  const salesRaw = db.prepare('SELECT * FROM sales WHERE cash_session_id = ?').all(sessionId) as Array<{ id: string; total: number; [key: string]: any }>;
  // Para cada venda, busca os pagamentos
  const sales = salesRaw.map((sale) => {
    const payments = db.prepare('SELECT method, amount FROM payments WHERE sale_id = ?').all(sale.id) as Array<{ method: string; amount: number }>;
    const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(sale.id) as Array<{ [key: string]: any }>;
    return { ...sale, payments, items };
  });
  const totalVendas = salesRaw.reduce((acc, s) => acc + (s.total || 0), 0);

  // Soma todos os pagamentos em dinheiro (cash) das vendas desta sessão
  const cashPayments = db.prepare(`
    SELECT p.amount
    FROM payments p
    JOIN sales s ON s.id = p.sale_id
    WHERE s.cash_session_id = ? AND p.method = 'cash'
  `).all(sessionId) as Array<{ amount: number }>;
  const totalVendasCash = cashPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  // Soma todas as sangrias realizadas na sessão
  const sangrias = db.prepare(`
    SELECT amount FROM cash_movements WHERE cash_session_id = ? AND type = 'withdraw_out'
  `).all(sessionId) as Array<{ amount: number }>;
  const totalSangrias = sangrias.reduce((acc, s) => acc + (s.amount || 0), 0);
  // Soma todos os suprimentos realizados na sessão
  const suprimentos = db.prepare(`
    SELECT amount FROM cash_movements WHERE cash_session_id = ? AND type = 'supply_in'
  `).all(sessionId) as Array<{ amount: number }>;
  const totalSuprimentos = suprimentos.reduce((acc, s) => acc + (s.amount || 0), 0);
 // console.log('SANGRIAS:', sangrias, 'TOTAL SANGRIAS:', totalSangrias, 'SUPRIMENTOS:', suprimentos, 'TOTAL SUPRIMENTOS:', totalSuprimentos);
  // Atualiza sessão de caixa como fechada
  const session = db.prepare('SELECT * FROM cash_sessions WHERE id = ?').get(sessionId) as { operator_id: string; opened_at: number; initial_balance: number };
  const difference = physicalCount - (session.initial_balance + totalVendasCash + totalSuprimentos - totalSangrias);
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
    totalVendasCash,
    totalSangrias,
    totalSuprimentos,
    difference,
    sales
  };
}


export function openCashSession(operatorId: string, initialBalance: number, userId: string) {
  const now = Date.now();
  const session = {
    id: uuidv4(),
    operator_id: operatorId,
    user_id: userId,
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
    const result = db.prepare(`INSERT INTO cash_sessions (id, operator_id, user_id, opened_at, closed_at, initial_balance, is_open, physical_count_at_close, difference_at_close, created_at, updated_at)
      VALUES (@id, @operator_id, @user_id, @opened_at, @closed_at, @initial_balance, @is_open, @physical_count_at_close, @difference_at_close, @created_at, @updated_at)`).run(session);
   // console.log('[CASH] INSERT cash_sessions result:', result);
  } catch (err) {
    console.error('[CASH] Falha ao inserir cash_sessions:', err);
    throw err;
  }
  return session;
}

export interface CashSession {
  id: string;
  operator_id: string;
  opened_at: number;
  closed_at: number | null;
  initial_balance: number;
  is_open: number;
  physical_count_at_close: number | null;
  difference_at_close: number | null;
  created_at: number;
  updated_at: number;
}

export function getOpenCashSession(userId: string): CashSession | undefined {
  const session = db.prepare('SELECT * FROM cash_sessions WHERE is_open = 1 AND user_id = ? ORDER BY opened_at DESC LIMIT 1').get(userId);
  if (!session) return undefined;
  return session as CashSession;
}
