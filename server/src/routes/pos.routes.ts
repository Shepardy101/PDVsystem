
import { Router } from 'express';
import { finalizeSale } from '../repositories/pos.repo';
import db from '../db/database.js';
import { logEvent } from '../utils/audit';

export const posRouter = Router();

// Buscar vendas do turno por cashSessionId
posRouter.get('/sales', (req, res) => {
  let cashSessionId: any;
  try {
    ({ cashSessionId } = req.query);
    if (!cashSessionId) return res.status(400).json({ error: 'cashSessionId é obrigatório' });
    // Busca vendas do turno
    const sales = db.prepare('SELECT * FROM sales WHERE cash_session_id = ? ORDER BY timestamp DESC').all(cashSessionId);
    // Para cada venda, busca itens e pagamentos
    const salesWithDetails = sales.map((sale: any) => {
      // Ensure sale is an object
      const saleObj = typeof sale === 'object' && sale !== null ? sale : {};
      const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(saleObj.id);
      const payments = db.prepare('SELECT * FROM payments WHERE sale_id = ?').all(saleObj.id);
      return {
        ...saleObj,
        items,
        payments
      };
    });
    logEvent('Consulta vendas do turno', 'info', {
      cashSessionId,
      sales: salesWithDetails.length
    });
    res.json({ sales: salesWithDetails });
  } catch (err) {
    logEvent('Erro ao buscar vendas do turno', 'error', {
      message: (err as any)?.message || String(err),
      stack: (err as any)?.stack,
      cashSessionId
    });
    res.status(500).json({ error: 'Erro ao buscar vendas do turno' });
  }
});

// Buscar todas as vendas das sessões abertas (para admins)
posRouter.get('/sales/all-open', (req, res) => {
  try {
    // Busca todas as sessões abertas
    const openSessions = db.prepare('SELECT id FROM cash_sessions WHERE is_open = 1').all();
    
    if (openSessions.length === 0) {
      return res.json({ sales: [] });
    }

    // Busca vendas de todas as sessões abertas
    const sessionIds = openSessions.map((s: any) => s.id);
    const placeholders = sessionIds.map(() => '?').join(',');
    const sales = db.prepare(`SELECT * FROM sales WHERE cash_session_id IN (${placeholders}) ORDER BY timestamp DESC`).all(...sessionIds);
    
    // Para cada venda, busca itens e pagamentos
    const salesWithDetails = sales.map((sale: any) => {
      const saleObj = typeof sale === 'object' && sale !== null ? sale : {};
      const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(saleObj.id);
      const payments = db.prepare('SELECT * FROM payments WHERE sale_id = ?').all(saleObj.id);
      return {
        ...saleObj,
        items,
        payments
      };
    });
    
    logEvent('Consulta todas vendas abertas', 'info', {
      sessionCount: openSessions.length,
      sales: salesWithDetails.length
    });
    
    res.json({ sales: salesWithDetails });
  } catch (err) {
    logEvent('Erro ao buscar todas vendas abertas', 'error', {
      message: (err as any)?.message || String(err),
      stack: (err as any)?.stack
    });
    res.status(500).json({ error: 'Erro ao buscar vendas' });
  }
});

posRouter.post('/finalizeSale', (req, res) => {
  try {
    console.log('[POST /api/pos/finalizeSale] Payload recebido:', req.body);
    const saleId = finalizeSale(req.body);
    console.log('[POST /api/pos/finalizeSale] Venda registrada com sucesso:', saleId);
    logEvent('Venda finalizada', 'info', {
      saleId,
      cashSessionId: req.body.cashSessionId,
      operatorId: req.body.operatorId,
      total: req.body.total,
      subtotal: req.body.subtotal,
      discountTotal: req.body.discountTotal,
      itemsCount: Array.isArray(req.body.items) ? req.body.items.length : 0,
      paymentsCount: Array.isArray(req.body.payments) ? req.body.payments.length : 0,
      clientId: req.body.clientId || null,
    });
    res.status(201).json({ saleId });
  } catch (err: any) {
    logEvent('Erro ao finalizar venda', 'error', {
      message: err?.message || String(err),
      stack: err?.stack,
      payload: req.body
    });
    res.status(400).json({ error: { code: 'SALE_ERROR', message: err.message || 'Erro ao finalizar venda.' } });
  }
});
