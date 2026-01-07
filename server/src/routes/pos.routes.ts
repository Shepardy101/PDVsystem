import { Router } from 'express';
import { finalizeSale } from '../repositories/pos.repo';

export const posRouter = Router();

posRouter.post('/finalizeSale', (req, res) => {
  try {
    const saleId = finalizeSale(req.body);
    res.status(201).json({ saleId });
  } catch (err: any) {
    res.status(400).json({ error: { code: 'SALE_ERROR', message: err.message || 'Erro ao finalizar venda.' } });
  }
});
