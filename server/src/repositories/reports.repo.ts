import { db } from '../db/database';

export function getProductMixQuadrants(from: number, to: number) {
  // Query: agrega por produto, calcula frequência (nº vendas distintas), quantidade e valor
  // Junta com products para pegar unit, name, cost_price, sale_price
  const rows = db.prepare(`
    SELECT 
      si.product_id,
      COALESCE(p.name, si.product_name_snapshot, '-') as product_name,
      COALESCE(p.unit, si.unit_snapshot, 'unit') as unit,
      COUNT(DISTINCT si.sale_id) as frequency,
      SUM(si.quantity) as total_quantity,
      SUM(si.line_total) as total_value,
      COALESCE(p.cost_price, 0) as cost_price,
      COALESCE(p.sale_price, 0) as sale_price
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    LEFT JOIN products p ON p.id = si.product_id
    WHERE s.timestamp BETWEEN ? AND ?
    GROUP BY si.product_id
    ORDER BY total_value DESC
  `).all(from, to);
  return rows;
}
