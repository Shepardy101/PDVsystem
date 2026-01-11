import React, { useEffect, useState } from "react";

interface SoldProduct {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_value: number;
  sale_date: number;
}

interface ProductInfo {
  product_id: string;
  stock_on_hand: number;
  cost_price: number;
}

function formatDate(epoch: number) {
  const d = new Date(epoch);
  // Exibe data e hora sem segundos
  const date = d.toLocaleDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

const SoldProductsDetailedTable: React.FC = () => {
  const [products, setProducts] = useState<SoldProduct[]>([]);
  const [productInfo, setProductInfo] = useState<Record<string, { stock_on_hand: number, cost_price: number }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/report/sold-products-detailed').then(res => res.json()),
      fetch('/api/products?limit=1000').then(res => res.json())
    ])
      .then(([soldData, productsData]) => {
        setProducts(soldData.products || []);
        // Monta um mapa de informações por product_id
        const infoMap: Record<string, { stock_on_hand: number, cost_price: number }> = {};
        (productsData.items || []).forEach((prod: any) => {
          infoMap[prod.id] = {
            stock_on_hand: prod.stock_on_hand ?? prod.stock ?? prod.estoque ?? 0,
            cost_price: prod.cost_price ?? 0
          };
        });
        setProductInfo(infoMap);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-xs text-slate-400">Carregando produtos vendidos...</div>;
  if (error) return <div className="text-xs text-red-400">Erro: {error}</div>;

  return (
    <div className="bg-dark-900/60 rounded-xl p-4 mb-8 border border-white/10">
      <div className="text-xs text-slate-400 font-mono mb-2">Produtos Vendidos (detalhado):</div>
      <div className="w-full overflow-x-auto" style={{ maxHeight: '60vh', minHeight: '120px' }}>
        <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
          <table className="min-w-[800px] w-full max-w-full text-xs text-left text-white border-separate border-spacing-0">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-1 px-2 sticky left-0 bg-dark-900/80 z-10">Data da Venda</th>
                <th className="py-1 px-2">Produto</th>
                <th className="py-1 px-2">Preço de Custo</th>
                <th className="py-1 px-2">Quantidade</th>
                <th className="py-1 px-2">Valor Total</th>
                <th className="py-1 px-2">Estoque Restante</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={6} className="text-slate-400 py-2">Nenhum produto vendido.</td></tr>
              ) : (
                products.map((p, i) => (
                  <tr key={p.product_id + '-' + i} className="border-b border-white/5">
                    <td className="py-1 px-2 whitespace-nowrap">{formatDate(p.sale_date)}</td>
                    <td className="py-1 px-2 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">{p.product_name}</td>
                    <td className="py-1 px-2 whitespace-nowrap">{productInfo[p.product_id]?.cost_price ? (productInfo[p.product_id].cost_price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</td>
                    <td className="py-1 px-2 whitespace-nowrap">{p.total_quantity}</td>
                    <td className="py-1 px-2 whitespace-nowrap">{(p.total_value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="py-1 px-2 whitespace-nowrap">{productInfo[p.product_id]?.stock_on_hand ?? '-'}</td>
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

export default SoldProductsDetailedTable;
