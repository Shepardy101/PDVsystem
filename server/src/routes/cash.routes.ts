import { Router } from 'express';
import { openCashSession, getOpenCashSession, closeCashSession, addSuprimentoMovement } from '../repositories/cash.repo.js';

export const cashRouter = Router();

// Buscar todas as movimentações do caixa atual
cashRouter.get('/movements', (req, res) => {
  try {
    const session = getOpenCashSession();
    if (!session) return res.status(404).json({ error: 'Nenhuma sessão aberta.' });
    const movements = require('../repositories/cash.repo.js').getCashMovementsBySession(session.id);
    res.json({ movements });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Erro ao buscar movimentações.' });
  }
});

// Adicionar movimentação de suprimento
cashRouter.post('/suprimento', async (req, res) => {
  try {
    const { amount, category, description, operatorId, cashSessionId } = req.body;
    if (!amount || !category || !description) {
      return res.status(400).json({ error: 'Campos obrigatórios: amount, category, description' });
    }
    // Buscar sessão aberta se não informado
    let sessionId = cashSessionId;
    if (!sessionId) {
      const session = getOpenCashSession();
      if (!session) return res.status(400).json({ error: 'Nenhuma sessão de caixa aberta' });
      sessionId = session.id;
    }
    // Buscar operador
    const opId = operatorId || (getOpenCashSession()?.operator_id);
    // Chamar repo para registrar suprimento
    const tx = await addSuprimentoMovement({
      amount,
      category,
      description,
      operatorId: opId,
      cashSessionId: sessionId
    });
    res.status(201).json({ transaction: tx });
  } catch (err) {
    console.error('[CASH] Erro ao registrar suprimento:', err);
    res.status(400).json({ error: err.message || 'Erro ao registrar suprimento.' });
  }
});


// Fechar sessão de caixa (encerrar turno)
cashRouter.post('/close', (req, res) => {
  try {
    const { sessionId, physicalCount } = req.body;
    if (!sessionId || typeof physicalCount !== 'number') {
      return res.status(400).json({ error: 'sessionId e physicalCount obrigatórios' });
    }
    const result = closeCashSession(sessionId, physicalCount);
    res.status(200).json({ closeResult: result });
  } catch (err: any) {
    console.error('[CASH] Erro ao fechar caixa:', err);
    res.status(400).json({ error: { code: 'CASH_CLOSE_ERROR', message: err.message || 'Erro ao fechar caixa.' } });
  }
});

// Abrir sessão de caixa
// Abrir sessão de caixa
cashRouter.post('/open', (req, res) => {
  try {
    console.log('[CASH] POST /api/cash/open body:', req.body);
    const { operatorId, initialBalance } = req.body;
    const session = openCashSession(operatorId, initialBalance);
    console.log('[CASH] Sessão criada:', session);
    res.status(201).json({ session });
  } catch (err: any) {
    console.error('[CASH] Erro ao abrir caixa:', err);
    res.status(400).json({ error: { code: 'CASH_ERROR', message: err.message || 'Erro ao abrir caixa.' } });
  }
});

// Consultar sessão de caixa aberta
cashRouter.get('/open', (req, res) => {
  try {
    const session = getOpenCashSession();
    if (!session) return res.status(404).json({ error: { code: 'NO_SESSION', message: 'Nenhuma sessão aberta.' } });
    res.json({ session });
  } catch (err: any) {
    res.status(400).json({ error: { code: 'CASH_ERROR', message: err.message || 'Erro ao consultar caixa.' } });
  }
});
