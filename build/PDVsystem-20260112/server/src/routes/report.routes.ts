import { Router } from 'express';
import db from '../db/database.js';
const reportRouter = Router();

// GET /api/report/sold-products-detailed
reportRouter.get('/sold-products-detailed', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT 
        si.product_id,
        si.product_name_snapshot as product_name,
        si.quantity as total_quantity,
        si.line_total as total_value,
        s.timestamp as sale_date
      FROM sale_items si
      JOIN sales s ON s.id = si.sale_id
      ORDER BY s.timestamp DESC
    `).all();
    res.json({ products: rows });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Erro ao buscar produtos vendidos detalhados', details: errorMessage });
  }
});

// GET /api/report/sold-products
reportRouter.get('/sold-products', (req, res) => {
  try {
    // Filtro por data (timestamp em ms)
    const start = req.query.start ? Number(req.query.start) : null;
    const end = req.query.end ? Number(req.query.end) : null;
    let where = '';
    const params: any[] = [];
    if (start) {
      where += ' AND s.timestamp >= ?';
      params.push(start);
    }
    if (end) {
      where += ' AND s.timestamp <= ?';
      params.push(end);
    }
    const rows = db.prepare(`
      SELECT 
        si.product_id,
        si.product_name_snapshot as product_name,
        SUM(si.quantity) as total_quantity,
        SUM(si.line_total) as total_value
      FROM sale_items si
      JOIN sales s ON s.id = si.sale_id
      WHERE 1=1 ${where}
      GROUP BY si.product_id, si.product_name_snapshot
      ORDER BY total_quantity DESC
    `).all(...params);
    //console de intervalo de datas
    console.log(`[Sold Products] Filtro de data aplicado: start=${start}, end=${end}`);
    res.json({ products: rows });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Erro ao buscar produtos vendidos', details: errorMessage });
  }
});

export default reportRouter;
