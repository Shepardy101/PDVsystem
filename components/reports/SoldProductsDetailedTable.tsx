import React, { useEffect, useState } from "react";

interface SoldProduct {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_value: number;
  sale_date: number;
}

function formatDate(epoch: number) {
  const d = new Date(epoch);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

const SoldProductsDetailedTable: React.FC = () => {
  const [products, setProducts] = useState<SoldProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/report/sold-products-detailed')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-xs text-slate-400">Carregando produtos vendidos...</div>;
  if (error) return <div className="text-xs text-red-400">Erro: {error}</div>;

  return (
    <div className="bg-dark-900/60 rounded-xl p-4 mb-8 overflow-x-auto border border-white/10">
      <div className="text-xs text-slate-400 font-mono mb-2">Produtos Vendidos (detalhado):</div>
      <table className="min-w-full text-xs text-left text-white">
        <thead>
          <tr className="border-b border-white/10">
            <th className="py-1 px-2">Produto</th>
            <th className="py-1 px-2">Quantidade</th>
            <th className="py-1 px-2">Valor Total</th>
            <th className="py-1 px-2">Data da Venda</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr><td colSpan={4} className="text-slate-400 py-2">Nenhum produto vendido.</td></tr>
          ) : (
            products.map((p, i) => (
              <tr key={p.product_id + '-' + i} className="border-b border-white/5">
                <td className="py-1 px-2">{p.product_name}</td>
                <td className="py-1 px-2">{p.total_quantity}</td>
                <td className="py-1 px-2">{(p.total_value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="py-1 px-2">{formatDate(p.sale_date)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SoldProductsDetailedTable;
