import React, { useEffect, useState } from "react";

interface ProductResumo {
  product_id: string;
  product_name: string;
  cost_price: number;
  total_quantity: number;
  total_value: number;
  stock_on_hand: number;
}

const SoldProductsResumoTable: React.FC = () => {
  const [products, setProducts] = useState<ProductResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/report/sold-products').then(res => res.json()),
      fetch('/api/products?limit=1000').then(res => res.json())
    ])
      .then(([soldData, productsData]) => {
        const productsMap: Record<string, any> = {};
        (productsData.items || []).forEach((prod: any) => {
          productsMap[prod.id] = {
            cost_price: prod.cost_price ?? 0,
            stock_on_hand: prod.stock_on_hand ?? prod.stock ?? prod.estoque ?? 0,
          };
        });
        const resumo: ProductResumo[] = (soldData.products || []).map((p: any) => ({
          product_id: p.product_id,
          product_name: p.product_name,
          cost_price: productsMap[p.product_id]?.cost_price ?? 0,
          total_quantity: p.total_quantity,
          total_value: p.total_value,
          stock_on_hand: productsMap[p.product_id]?.stock_on_hand ?? 0,
        }));
        setProducts(resumo);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-xs text-slate-400">Carregando resumo...</div>;
  if (error) return <div className="text-xs text-red-400">Erro: {error}</div>;

  return (
    <div className="bg-dark-900/60 rounded-xl p-4 mb-8 border border-white/10">
      <div className="text-xs text-slate-400 font-mono mb-2">Resumo de Produtos Vendidos</div>
      <div className="w-full overflow-x-auto" style={{ maxHeight: '60vh', minHeight: '120px' }}>
        <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
          <table className="min-w-[800px] w-full max-w-full text-xs text-left text-white border-separate border-spacing-0">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-1 px-2">Produto</th>
                <th className="py-1 px-2">Preço de Custo</th>
                <th className="py-1 px-2">Total Unidades Vendidas</th>
                <th className="py-1 px-2">Valor Total Vendido</th>
                <th className="py-1 px-2">Estoque Restante</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={5} className="text-slate-400 py-2">Nenhum produto vendido.</td></tr>
              ) : (
                products.map((p, i) => (
                  <tr key={p.product_id + '-' + i} className="border-b border-white/5">
                    <td className="py-1 px-2 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">{p.product_name}</td>
                    <td className="py-1 px-2 whitespace-nowrap">{p.cost_price ? (p.cost_price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</td>
                    <td className="py-1 px-2 whitespace-nowrap">{p.total_quantity}</td>
                    <td className="py-1 px-2 whitespace-nowrap">{(p.total_value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="py-1 px-2 whitespace-nowrap">{p.stock_on_hand}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SoldProductsResumoTable;
