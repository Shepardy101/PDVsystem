
import { Router } from 'express';
import { finalizeSale } from '../repositories/pos.repo';
import db from '../db/database.js';
import { logEvent } from '../utils/audit';

export const posRouter = Router();

// Buscar vendas do turno por cashSessionId
posRouter.get('/sales', (req, res) => {
  try {
    const { cashSessionId } = req.query;
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
    res.json({ sales: salesWithDetails });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar vendas do turno' });
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
