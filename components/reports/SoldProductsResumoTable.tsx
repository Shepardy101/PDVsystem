
// Troque para false para usar a API real
const USE_MOCK = true;

import React, { useEffect, useState, useMemo } from "react";
import { soldProductsMock, SoldProductMock } from "./SoldProductsDetailedTable.mock";

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

  // Filtros de data
  const [dateFilter, setDateFilter] = useState<'30' | '60' | '90' | 'all' | 'custom'>('30');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  // Estados temporários para edição do filtro personalizado
  const [pendingCustomStart, setPendingCustomStart] = useState<string>('');
  const [pendingCustomEnd, setPendingCustomEnd] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    let startDate: number | null = null;
    let endDate: number | null = null;
    const now = Date.now();
    if (dateFilter === '30') startDate = now - 1000 * 60 * 60 * 24 * 30;
    else if (dateFilter === '60') startDate = now - 1000 * 60 * 60 * 24 * 60;
    else if (dateFilter === '90') startDate = now - 1000 * 60 * 60 * 24 * 90;
    else if (dateFilter === 'custom' && customStart && customEnd) {
      startDate = new Date(customStart).getTime();
      endDate = new Date(customEnd).getTime() + 1000 * 60 * 60 * 24 - 1;
    }

    if (USE_MOCK) {
      // Filtra e consolida os dados do mock
      let filtered: SoldProductMock[] = soldProductsMock;
      if (startDate && endDate) {
        filtered = soldProductsMock.filter(p => p.sale_date >= startDate! && p.sale_date <= endDate!);
      } else if (startDate) {
        filtered = soldProductsMock.filter(p => p.sale_date >= startDate!);
      } else if (endDate) {
        filtered = soldProductsMock.filter(p => p.sale_date <= endDate!);
      }
      // Consolida por produto
      const resumoMap: Record<string, ProductResumo> = {};
      filtered.forEach((p) => {
        if (!resumoMap[p.product_id]) {
          resumoMap[p.product_id] = {
            product_id: p.product_id,
            product_name: p.product_name,
            cost_price: p.cost_price,
            total_quantity: 0,
            total_value: 0,
            stock_on_hand: p.stock_on_hand,
          };
        }
        resumoMap[p.product_id].total_quantity += p.total_quantity;
        resumoMap[p.product_id].total_value += p.total_value;
      });
      setProducts(Object.values(resumoMap));
      setLoading(false);
      setError(null);
      return;
    }

    // --- API REAL ---
    const params = [];
    if (startDate) params.push(`start=${startDate}`);
    if (endDate) params.push(`end=${endDate}`);
    const soldUrl = '/api/report/sold-products' + (params.length ? `?${params.join('&')}` : '');
    Promise.all([
      fetch(soldUrl).then(res => res.json()),
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
        // Consolidação dos produtos vendidos no período selecionado
        const resumoMap: Record<string, ProductResumo> = {};
        (soldData.products || []).forEach((p: any) => {
          if (!resumoMap[p.product_id]) {
            resumoMap[p.product_id] = {
              product_id: p.product_id,
              product_name: p.product_name,
              cost_price: productsMap[p.product_id]?.cost_price ?? 0,
              total_quantity: 0,
              total_value: 0,
              stock_on_hand: productsMap[p.product_id]?.stock_on_hand ?? 0,
            };
          }
          resumoMap[p.product_id].total_quantity += p.total_quantity;
          resumoMap[p.product_id].total_value += p.total_value;
        });
        setProducts(Object.values(resumoMap));
        setError(null);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [dateFilter, customStart, customEnd]);

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
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="text-xs text-slate-400 font-mono">Resumo de Produtos Vendidos</div>
        <div className="flex gap-1 flex-wrap">
          {['30', '60', '90', 'all', 'custom'].map((key) => (
            <button
              key={key}
              className={[
                'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all',
                dateFilter === key ? 'bg-accent/20 border-accent text-accent' : 'bg-dark-950/50 border-white/10 text-slate-300 hover:bg-accent/10 hover:text-accent',
              ].join(' ')}
              onClick={() => setDateFilter(key as any)}
            >
              {key === '30' && '30d'}
              {key === '60' && '60d'}
              {key === '90' && '90d'}
              {key === 'all' && 'All'}
              {key === 'custom' && 'Personalizado'}
            </button>
          ))}
        </div>
      </div>
      {dateFilter === 'custom' && (
        <div className="flex gap-2 items-center mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <input
            type="date"
            value={pendingCustomStart}
            onChange={e => setPendingCustomStart(e.target.value)}
            className="px-2 py-1 rounded border border-accent/30 bg-dark-950/60 text-xs text-slate-200"
          />
          <span className="text-xs text-slate-400">até</span>
          <input
            type="date"
            value={pendingCustomEnd}
            onChange={e => setPendingCustomEnd(e.target.value)}
            className="px-2 py-1 rounded border border-accent/30 bg-dark-950/60 text-xs text-slate-200"
          />
          <button
            className="ml-2 px-3 py-1 rounded-lg bg-accent text-white text-xs font-bold shadow hover:bg-accent/80 transition-all"
            onClick={() => {
              setCustomStart(pendingCustomStart);
              setCustomEnd(pendingCustomEnd);
            }}
            disabled={!pendingCustomStart || !pendingCustomEnd}
          >
            OK
          </button>
        </div>
      )}
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
