import { Router } from 'express';
import { getProductMixQuadrants } from '../repositories/reports.repo';

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
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar dados do mix de produtos', details: err.message });
  }
});

export default reportsRouter;
