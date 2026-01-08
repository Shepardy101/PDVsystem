import { Router, Request, Response } from 'express';
import { addPagamentoMovement, openCashSession, getOpenCashSession, closeCashSession, addSuprimentoMovement, addSangriaMovement } from '../repositories/cash.repo.js';

export const cashRouter = Router();
// POST /api/cash/pagamento
cashRouter.post('/pagamento', (req: Request, res: Response) => {
  try {
    const { amount, category, description, operatorId, cashSessionId } = req.body;
    if (!amount || !category || !description) {
      return res.status(400).json({ error: 'Campos obrigatórios: amount, category, description' });
    }
    let sessionId = cashSessionId;
    let opId = operatorId;
    if (!sessionId) {
      const session = getOpenCashSession();
      if (!session) return res.status(400).json({ error: 'Nenhuma sessão de caixa aberta' });
      sessionId = session.id;
      if (!opId) opId = session.operator_id;
    }
    const movement = addPagamentoMovement({ amount, category, description, operatorId: opId, cashSessionId: sessionId });
    res.status(201).json(movement);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message || 'Erro ao registrar pagamento.' });
  }
});
// Adicionar movimentação de sangria
cashRouter.post('/sangria', async (req: Request, res: Response) => {
  try {
    const { amount, category, description, operatorId, cashSessionId } = req.body;
    if (!amount || !category || !description) {
      return res.status(400).json({ error: 'Campos obrigatórios: amount, category, description' });
    }
    // Buscar sessão aberta se não informado
    let sessionId = cashSessionId;
    let opId = operatorId;
    if (!sessionId) {
      const session = getOpenCashSession();
      if (!session) return res.status(400).json({ error: 'Nenhuma sessão de caixa aberta' });
      sessionId = session.id;
      if (!opId) opId = session.operator_id;
    }
    // Chamar repo para registrar sangria
    const tx = await addSangriaMovement({
      amount,
      category,
      description,
      operatorId: opId,
      cashSessionId: sessionId
    });
    res.status(201).json({ transaction: tx });
  } catch (err) {
    const error = err as Error;
    console.error('[CASH] Erro ao registrar sangria:', error);
    res.status(400).json({ error: error.message || 'Erro ao registrar sangria.' });
  }
});



// Buscar todas as movimentações do caixa atual
cashRouter.get('/movements', (req: Request, res: Response) => {
  try {
    const session = getOpenCashSession();
    if (!session) return res.status(404).json({ error: 'Nenhuma sessão aberta.' });
    const movements = require('../repositories/cash.repo.js').getCashMovementsBySession((session as { id: string }).id);
    res.json({ movements });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message || 'Erro ao buscar movimentações.' });
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
    let opId = operatorId;
    if (!sessionId) {
      const session = getOpenCashSession();
      if (!session) return res.status(400).json({ error: 'Nenhuma sessão de caixa aberta' });
      sessionId = session.id;
      if (!opId) opId = session.operator_id;
    }
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
    const error = err as Error;
    console.error('[CASH] Erro ao registrar suprimento:', error);
    res.status(400).json({ error: error.message || 'Erro ao registrar suprimento.' });
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
