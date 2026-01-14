import { Router } from 'express';
import { getProductMixQuadrants } from '../repositories/reports.repo';
import { logEvent } from '../utils/audit';

const reportsRouter = Router();

// GET /api/reports/product-mix?from=...&to=...
reportsRouter.get('/product-mix', (req, res) => {
  const from = Number(req.query.from);
  const to = Number(req.query.to);
  if (!from || !to) {
    return res.status(400).json({ error: 'Parâmetros from e to são obrigatórios (epoch ms)' });
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
