import { Router } from 'express';
import { db } from '../db/database';

const reportRouter = Router();

// GET /api/report/sold-products
reportRouter.get('/sold-products', (req, res) => {
  try {
    // Busca todos os itens vendidos (agrupando por produto)
    const rows = db.prepare(`
      SELECT 
        product_id,
        product_name_snapshot as product_name,
        SUM(quantity) as total_quantity,
        SUM(line_total) as total_value
      FROM sale_items
      GROUP BY product_id, product_name_snapshot
      ORDER BY total_quantity DESC
    `).all();
    res.json({ products: rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos vendidos', details: err.message });
  }
});

export default reportRouter;
