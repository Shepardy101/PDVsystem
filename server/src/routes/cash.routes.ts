import { Router } from 'express';
import { openCashSession, getOpenCashSession } from '../repositories/cash.repo.js';

export const cashRouter = Router();

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
