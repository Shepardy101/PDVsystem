import { Router } from 'express';
import { finalizeSale } from '../repositories/pos.repo';

export const posRouter = Router();

posRouter.post('/finalizeSale', (req, res) => {
  try {
    console.log('[POST /api/pos/finalizeSale] Payload recebido:', req.body);
    const saleId = finalizeSale(req.body);
    console.log('[POST /api/pos/finalizeSale] Venda registrada com sucesso:', saleId);
    res.status(201).json({ saleId });
  } catch (err: any) {
    console.error('[POST /api/pos/finalizeSale] Erro ao registrar venda:', err);
    res.status(400).json({ error: { code: 'SALE_ERROR', message: err.message || 'Erro ao finalizar venda.' } });
  }
});
