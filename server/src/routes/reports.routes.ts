import { Router } from 'express';
import { getProductMixQuadrants } from '../repositories/reports.repo';
import { logEvent } from '../utils/audit';

const reportsRouter = Router();

// GET /api/reports/product-mix?from=...&to=...
import db from '../db/database';
reportsRouter.get('/product-mix', (req, res) => {
  let from = Number(req.query.from);
  let to = Number(req.query.to);
  // Se não enviados, busca o range total do banco
  if (!from || !to) {
    try {
      const minMax = db.prepare('SELECT MIN(timestamp) as minTs, MAX(timestamp) as maxTs FROM sales').get() as { minTs: number|null, maxTs: number|null };
      from = minMax?.minTs || 0;
      to = minMax?.maxTs || Date.now();
    } catch (err: any) {
      return res.status(500).json({ error: 'Erro ao buscar range de datas', details: err.message });
    }
  }
  try {
    const data = getProductMixQuadrants(from, to);
    logEvent('Relatório product-mix executado', 'info', { from, to });
    res.json(data);
  } catch (err: any) {
    logEvent('Erro em product-mix', 'error', {
      message: err?.message || String(err),
      stack: err?.stack,
      from,
      to
    });
    res.status(500).json({ error: 'Erro ao buscar dados do mix de produtos', details: err.message });
  }
});

export default reportsRouter;
