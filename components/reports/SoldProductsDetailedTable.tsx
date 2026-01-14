
import React, { useEffect, useMemo, useState } from "react";
// Troque para true para usar mock, false para API real
const USE_MOCK = false;
import { soldProductsMock } from "./SoldProductsDetailedTable.mock";

type TelemetryFn = (area: string, action: string, meta?: Record<string, any>) => void;

interface SoldProductsDetailedTableProps {
    onTelemetry?: TelemetryFn;
}

interface SoldProduct {
    product_id: string;
    product_name: string;
    total_quantity: number;
    total_value: number; // centavos
    sale_date: number; // epoch ms
}

function formatDate(epoch: number) {
    const d = new Date(epoch);
    const date = d.toLocaleDateString();
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
}

function formatBRLFromCents(cents: number) {
    return (cents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}


const SoldProductsDetailedTable: React.FC<SoldProductsDetailedTableProps> = ({ onTelemetry }) => {
    const [products, setProducts] = useState<SoldProduct[]>([]);
    const [allProducts, setAllProducts] = useState<SoldProduct[]>([]);
    const [productInfo, setProductInfo] = useState<
        Record<string, { stock_on_hand: number; cost_price: number }>
    >({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado para o filtro de datas
    const [dateRange, setDateRange] = useState<'30d' | '60d' | '90d' | 'all' | 'custom'>('30d');
    const [customStart, setCustomStart] = useState<string>("");
    const [customEnd, setCustomEnd] = useState<string>("");

    // Cálculo dos totais
    const totals = useMemo(() => {
        const totalItems = products.length;
        const totalValueCents = products.reduce(
            (acc, p) => acc + (p.total_value || 0),
            0
        );
        return { totalItems, totalValueCents };
    }, [products]);

    // Busca dos dados (mock ou API real)
    useEffect(() => {
        setLoading(true);
        setError(null);

        onTelemetry?.('soldProductsDetailed', 'fetch:start', { source: USE_MOCK ? 'mock' : 'api' });

        if (USE_MOCK) {
            // Usar dados de mock
            setAllProducts(soldProductsMock.map(({ stock_on_hand, cost_price, ...p }) => ({ ...p })));
            // Montar productInfo a partir do mock
            const infoMap: Record<string, { stock_on_hand: number; cost_price: number }> = {};
            soldProductsMock.forEach((prod) => {
                infoMap[prod.product_id] = {
                    stock_on_hand: prod.stock_on_hand,
                    cost_price: prod.cost_price,
                };
            });
            setProductInfo(infoMap);
            setLoading(false);
            return;
        }

        // Usar API real
        Promise.all([
            fetch("/api/report/sold-products-detailed").then((res) => res.json()),
            fetch("/api/products?limit=1000").then((res) => res.json()),
        ])
            .then(([soldData, productsData]) => {
                const raw = soldData.items || soldData.products || [];
                const normalizedProducts = raw.map((p: SoldProduct) => {
                    const sd = Number(p.sale_date);
                    const ms =
                        sd > 1e12 ? sd :
                            sd > 1e10 ? Number(sd) :
                                sd * 1000;
                    return { ...p, sale_date: ms };
                });
                setAllProducts(normalizedProducts);
                // produtos info
                const infoMap: Record<string, { stock_on_hand: number; cost_price: number }> = {};
                (productsData.items || []).forEach((prod: any) => {
                    infoMap[prod.id] = {
                        stock_on_hand: prod.stock_on_hand ?? prod.stock ?? prod.estoque ?? 0,
                        cost_price: prod.cost_price ?? 0,
                    };
                });
                setProductInfo(infoMap);
                onTelemetry?.('soldProductsDetailed', 'fetch:success', {
                    source: 'api',
                    items: raw.length,
                });
            })
            .catch((e) => {
                setError(e.message);
                onTelemetry?.('soldProductsDetailed', 'fetch:error', { message: e.message });
            })
            .finally(() => setLoading(false));
    }, []);


    // Ordenação
    type SortKey = 'sale_date' | 'product_name' | 'cost_price' | 'total_quantity' | 'total_value' | 'stock_on_hand';
    const [sortKey, setSortKey] = useState<SortKey>('sale_date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const handleSort = (key: SortKey) => {
        setSortKey((current) => {
            if (current === key) {
                setSortDir((dir) => {
                    const nextDir = dir === 'asc' ? 'desc' : 'asc';
                    onTelemetry?.('soldProductsDetailed', 'sort:change', { key, direction: nextDir });
                    return nextDir;
                });
                return current;
            }
            onTelemetry?.('soldProductsDetailed', 'sort:change', { key, direction: 'desc' });
            setSortDir('desc');
            return key;
        });
    };

    const sortedProducts = useMemo(() => {
        const arr = products.map(p => ({
            ...p,
            cost_price: productInfo[p.product_id]?.cost_price ?? 0,
            stock_on_hand: productInfo[p.product_id]?.stock_on_hand ?? 0,
        }));
        arr.sort((a, b) => {
            let vA = a[sortKey];
            let vB = b[sortKey];
            if (typeof vA === 'string' && typeof vB === 'string') {
                vA = vA.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
                vB = vB.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
                if (vA < vB) return sortDir === 'asc' ? -1 : 1;
                if (vA > vB) return sortDir === 'asc' ? 1 : -1;
                return 0;
            }
            if (typeof vA === 'number' && typeof vB === 'number') {
                return sortDir === 'asc' ? vA - vB : vB - vA;
            }
            return 0;
        });
        return arr;
    }, [products, sortKey, sortDir, productInfo]);

    // Filtragem por data
    useEffect(() => {
        if (!allProducts.length) {
            setProducts([]);
            return;
        }
        let filtered = allProducts;
        if (dateRange !== 'all') {
            let days = 0;
            if (dateRange === '30d') days = 30;
            if (dateRange === '60d') days = 60;
            if (dateRange === '90d') days = 90;
            if (dateRange === 'custom') {
                if (customStart && customEnd) {
                    const start = new Date(customStart).getTime();
                    const end = new Date(customEnd).getTime() + 24 * 60 * 60 * 1000 - 1; // inclui o dia final inteiro
                    filtered = allProducts.filter(p => {
                        const saleDateMs = typeof p.sale_date === 'string' ? Number(p.sale_date) : p.sale_date;
                        return saleDateMs >= start && saleDateMs <= end;
                    });
                }
            }
            if (days > 0) {
                const now = Date.now();
                const minDate = now - days * 24 * 60 * 60 * 1000;
                filtered = allProducts.filter(p => {
                    const saleDateMs = typeof p.sale_date === 'string' ? Number(p.sale_date) : p.sale_date;
                    return saleDateMs >= minDate && saleDateMs <= now;
                });
            }
        }
        setProducts(filtered);
        onTelemetry?.('soldProductsDetailed', 'filter:applied', {
            dateRange,
            customStart,
            customEnd,
            resultCount: filtered.length,
        });
    }, [allProducts, dateRange, customStart, customEnd, onTelemetry]);

    if (loading) {
        return (
            <div className="rounded-2xl border border-white/10 bg-dark-950/40 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="h-4 w-56 rounded bg-white/10 animate-pulse" />
                    <div className="h-4 w-40 rounded bg-white/10 animate-pulse" />
                </div>
                <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-8 rounded-xl bg-white/5 border border-white/10 animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-500/25 bg-dark-950/40 backdrop-blur-xl p-4">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.28em] text-red-300 mb-2">
                    Erro ao carregar relatório
                </h2>
                <p className="text-sm text-red-200 font-mono">{error}</p>
            </div>
        );
    }

    return (
        <section className="relative rounded-3xl border border-white/10 bg-dark-950/40 backdrop-blur-xl p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)] overflow-hidden">
            {/* Overlay futurista */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.18),transparent_45%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.14),transparent_55%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:100%_12px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:22px_100%] opacity-[0.35]" />
            </div>

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">Produtos Vendidos (Detalhado)</h3>
                    <div className="flex gap-1 ml-2">
                        {['30d', '60d', '90d', 'all'].map((label) => (
                            <button
                                key={label}
                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase border border-white/10 transition-all ${dateRange === label ? 'bg-cyan-600 text-white' : 'bg-dark-900/60 text-slate-300 hover:bg-cyan-900/40'}`}
                                onClick={() => {
                                    setDateRange(label as any);
                                    onTelemetry?.('soldProductsDetailed', 'filter:date-range', { value: label });
                                }}
                            >
                                {label === 'all' ? 'Todos' : label}
                            </button>
                        ))}
                        <button
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase border border-white/10 transition-all ${dateRange === 'custom' ? 'bg-cyan-600 text-white' : 'bg-dark-900/60 text-slate-300 hover:bg-cyan-900/40'}`}
                            onClick={() => {
                                setDateRange('custom');
                                onTelemetry?.('soldProductsDetailed', 'filter:date-range', { value: 'custom' });
                            }}
                        >
                            Personalizado
                        </button>
                    </div>
                    {dateRange === 'custom' && (
                        <div className="flex gap-2 ml-4 items-center">
                            <input
                                type="date"
                                value={customStart}
                                onChange={e => {
                                    setCustomStart(e.target.value);
                                    onTelemetry?.('soldProductsDetailed', 'filter:custom-start', { value: e.target.value });
                                }}
                                className="px-2 py-1 rounded border border-white/10 bg-dark-900/60 text-xs text-slate-100"
                            />
                            <span className="text-xs text-slate-400">até</span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={e => {
                                    setCustomEnd(e.target.value);
                                    onTelemetry?.('soldProductsDetailed', 'filter:custom-end', { value: e.target.value });
                                }}
                                className="px-2 py-1 rounded border border-white/10 bg-dark-900/60 text-xs text-slate-100"
                            />
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] text-slate-500 uppercase">Total vendido:</span>
                    <span className="text-base font-mono text-slate-100">{formatBRLFromCents(totals.totalValueCents)}</span>
                </div>
            </header>

            {/* Card da tabela */}
            <div className="relative rounded-2xl border border-white/10 bg-dark-900/30 overflow-hidden">
                {/* CONTAINER CONTROLADOR — Corrige o vazamento */}
                <div
                    className={[
                        "w-full overflow-x-auto overflow-y-auto",
                        "max-h-[calc(80vh-220px)]", // Garante que a tabela nunca ultrapasse a tela
                        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                    ].join(" ")}
                >
                    {/* Tabela */}
                    <table className="min-w-[980px] w-full text-xs text-left text-slate-100 border-separate border-spacing-0">
                        <thead className="sticky top-0 z-20 bg-dark-950/80 backdrop-blur-xl">
                            <tr>
                                <th
                                    className={`py-3 px-3 border-b border-white/10 sticky left-0 z-30 bg-dark-950/80 backdrop-blur-xl text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 cursor-pointer transition hover:bg-cyan-900/30 group text-center ${sortKey === 'sale_date' ? 'text-cyan-300' : ''}`}
                                    onClick={() => handleSort('sale_date')}
                                >
                                    <span className="inline-flex items-center gap-1">
                                        Data da venda
                                        {sortKey === 'sale_date' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                                    </span>
                                </th>
                                <th
                                    className={`py-3 px-3 border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 cursor-pointer transition hover:bg-cyan-900/30 group text-center ${sortKey === 'product_name' ? 'text-cyan-300' : ''}`}
                                    onClick={() => handleSort('product_name')}
                                >
                                    <span className="inline-flex items-center gap-1">
                                        Produto
                                        {sortKey === 'product_name' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                                    </span>
                                </th>
                                <th
                                    className={`py-3 px-3 border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 cursor-pointer transition hover:bg-cyan-900/30 group text-center ${sortKey === 'cost_price' ? 'text-cyan-300' : ''}`}
                                    onClick={() => handleSort('cost_price')}
                                >
                                    <span className="inline-flex items-center gap-1">
                                        Custo
                                        {sortKey === 'cost_price' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                                    </span>
                                </th>
                                <th
                                    className={`py-3 px-3 border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 cursor-pointer transition hover:bg-cyan-900/30 group text-center ${sortKey === 'total_quantity' ? 'text-cyan-300' : ''}`}
                                    onClick={() => handleSort('total_quantity')}
                                >
                                    <span className="inline-flex items-center gap-1">
                                        Quantidade
                                        {sortKey === 'total_quantity' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                                    </span>
                                </th>
                                <th
                                    className={`py-3 px-3 border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 cursor-pointer transition hover:bg-cyan-900/30 group text-center ${sortKey === 'total_value' ? 'text-cyan-300' : ''}`}
                                    onClick={() => handleSort('total_value')}
                                >
                                    <span className="inline-flex items-center gap-1">
                                        Valor total
                                        {sortKey === 'total_value' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                                    </span>
                                </th>
                               
                            </tr>
                        </thead>

                        <tbody>
                            {sortedProducts.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-8 px-4 text-slate-400 text-center"
                                    >
                                        Nenhum produto vendido.
                                    </td>
                                </tr>
                            ) : (
                                sortedProducts.map((p, i) => {
                                    const info = productInfo[p.product_id];
                                    const cost = info?.cost_price ?? 0;

                                    const isOdd = i % 2 === 1;
                                    const isLowStock =
                                        info?.stock_on_hand !== undefined &&
                                        info.stock_on_hand <= 0;

                                    return (
                                        <tr
                                            key={`${p.product_id}-${i}`}
                                            className={[
                                                "group transition-colors",
                                                isOdd ? "bg-white/[0.02]" : "bg-transparent",
                                                "hover:bg-cyan-500/5",
                                                "border-b border-white/5",
                                            ].join(" ")}
                                        >
                                            {/* COL FIXA */}
                                            <td
                                                className={[
                                                    "py-2.5 px-3 whitespace-nowrap text-center",
                                                    "sticky left-0 z-10",
                                                    "bg-inherit border-r border-white/5",
                                                    "font-mono text-[11px] text-slate-300",
                                                    "group-hover:text-slate-100",
                                                ].join(" ")}
                                            >
                                                {formatDate(p.sale_date)}
                                            </td>

                                            <td className="py-2.5 px-3 max-w-[340px] text-center">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/70 shadow-[0_0_12px_rgba(34,211,238,0.45)]" />
                                                    <span className="truncate text-slate-100">
                                                        {p.product_name}
                                                    </span>
                                                </div>
                                               
                                            </td>

                                            <td className="py-2.5 px-3 whitespace-nowrap font-mono text-center">
                                                {cost > 0 ? (
                                                    <span className="text-slate-200">
                                                        {formatBRLFromCents(cost)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500">—</span>
                                                )}
                                            </td>

                                            <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-100 text-center ">
                                                {p.total_quantity}
                                            </td>

                                            <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-100 text-center">
                                                {formatBRLFromCents(p.total_value)}
                                            </td>

                                            
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

export default SoldProductsDetailedTable;
