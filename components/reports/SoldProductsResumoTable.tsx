import React, { useEffect, useState, useMemo } from "react";

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

  // Ordenação dos cabeçalhos
    const [sort, setSort] = useState<{ key: keyof ProductResumo, direction: 'asc' | 'desc' }>({ key: 'total_value', direction: 'desc' });
    const handleSort = (key: keyof ProductResumo) => {
      setSort((prev: { key: keyof ProductResumo; direction: 'asc' | 'desc' }) => {
        if (prev.key === key) {
          return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
        }
        return { key, direction: 'desc' };
      });
    };
    const sortedProducts = useMemo(() => {
      const sorted = [...products];
      sorted.sort((a, b) => {
        const aValue = a[sort.key] ?? 0;
        const bValue = b[sort.key] ?? 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sort.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
      });
      return sorted;
    }, [products, sort]);

  if (loading) return <div className="text-xs text-slate-400">Carregando resumo...</div>;
  if (error) return <div className="text-xs text-red-400">Erro: {error}</div>;

  return (
    <section className="relative rounded-3xl border border-white/10 bg-dark-950/40 backdrop-blur-xl p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)] overflow-hidden mb-8">
      <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.18),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:100%_12px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:22px_100%] opacity-[0.35]" />
      </div>
      <div className="text-xs text-slate-400 font-mono mb-2">Resumo de Produtos Vendidos</div>
      <div className="relative rounded-2xl border border-white/10 bg-dark-900/30 overflow-hidden">
    
        <div
          className={[
            "w-full overflow-x-auto overflow-y-auto",
            "max-h-[calc(80vh-220px)]",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          ].join(" ")}
        >
          <table className="min-w-[800px] w-full text-xs text-left text-slate-100 border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 bg-dark-950/80 backdrop-blur-xl">
              <tr>
                <th
                  className={[
                    "py-3 px-3 border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 sticky left-0 z-30 bg-dark-950/80 backdrop-blur-xl select-none cursor-pointer transition-colors",
                    sort.key === 'product_name' ? 'text-accent' : '',
                    'hover:bg-cyan-500/10 hover:text-accent',
                  ].join(' ')}
                  onClick={() => handleSort('product_name')}
                >
                  Produto
                  {sort.key === 'product_name' && (
                    <span className="ml-1 inline-block align-middle">
                      {sort.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th
                  className={[
                    "py-3 px-3 border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 select-none cursor-pointer transition-colors",
                    sort.key === 'cost_price' ? 'text-accent' : '',
                    'hover:bg-cyan-500/10 hover:text-accent',
                  ].join(' ')}
                  onClick={() => handleSort('cost_price')}
                >
                  Preço de Custo
                  {sort.key === 'cost_price' && (
                    <span className="ml-1 inline-block align-middle">
                      {sort.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th
                  className={[
                    "py-3 px-3 border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 select-none cursor-pointer transition-colors",
                    sort.key === 'total_quantity' ? 'text-accent' : '',
                    'hover:bg-cyan-500/10 hover:text-accent',
                  ].join(' ')}
                  onClick={() => handleSort('total_quantity')}
                >
                  Total Unidades Vendidas
                  {sort.key === 'total_quantity' && (
                    <span className="ml-1 inline-block align-middle">
                      {sort.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th
                  className={[
                    "py-3 px-3 border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 select-none cursor-pointer transition-colors",
                    sort.key === 'total_value' ? 'text-accent' : '',
                    'hover:bg-cyan-500/10 hover:text-accent',
                  ].join(' ')}
                  onClick={() => handleSort('total_value')}
                >
                  Valor Total Vendido
                  {sort.key === 'total_value' && (
                    <span className="ml-1 inline-block align-middle">
                      {sort.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th
                  className={[
                    "py-3 px-3 border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 select-none cursor-pointer transition-colors",
                    sort.key === 'stock_on_hand' ? 'text-accent' : '',
                    'hover:bg-cyan-500/10 hover:text-accent',
                  ].join(' ')}
                  onClick={() => handleSort('stock_on_hand')}
                >
                  Estoque Restante
                  {sort.key === 'stock_on_hand' && (
                    <span className="ml-1 inline-block align-middle">
                      {sort.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-slate-400 text-center">Nenhum produto vendido.</td>
                </tr>
              ) : (
                sortedProducts.map((p: ProductResumo, i: number) => {
                  const isOdd = i % 2 === 1;
                  const isLowStock = p.stock_on_hand <= 0;
                  return (
                    <tr
                      key={p.product_id + '-' + i}
                      className={[
                        "group transition-colors",
                        isOdd ? "bg-white/[0.02]" : "bg-transparent",
                        "hover:bg-cyan-500/5",
                        "border-b border-white/5",
                      ].join(" ")}
                    >
                      <td className={["py-2.5 px-3 whitespace-nowrap sticky left-0 z-10 bg-inherit border-r border-white/5 text-slate-100 max-w-[200px] overflow-hidden text-ellipsis"].join(" ")}>{p.product_name}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-100">
                        {p.cost_price ? (p.cost_price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-100">{p.total_quantity}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-100">{(p.total_value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className={["py-2.5 px-3 whitespace-nowrap font-mono", isLowStock ? "text-rose-300" : "text-emerald-300"].join(" ")}>{p.stock_on_hand}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default SoldProductsResumoTable;
