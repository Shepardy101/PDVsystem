"use client";

import React, { useEffect, useMemo, useState } from "react";

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

const SoldProductsDetailedTable: React.FC = () => {
  const [products, setProducts] = useState<SoldProduct[]>([]);
  const [productInfo, setProductInfo] = useState<
    Record<string, { stock_on_hand: number; cost_price: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const totalItems = products.length;
    const totalValueCents = products.reduce(
      (acc, p) => acc + (p.total_value || 0),
      0
    );
    return { totalItems, totalValueCents };
  }, [products]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetch("/api/report/sold-products-detailed").then((res) => res.json()),
      fetch("/api/products?limit=1000").then((res) => res.json()),
    ])
      .then(([soldData, productsData]) => {
        setProducts(soldData.products || []);

        const infoMap: Record<
          string,
          { stock_on_hand: number; cost_price: number }
        > = {};

        (productsData.items || []).forEach((prod: any) => {
          infoMap[prod.id] = {
            stock_on_hand:
              prod.stock_on_hand ??
              prod.stock ??
              prod.estoque ??
              0,
            cost_price: prod.cost_price ?? 0,
          };
        });

        setProductInfo(infoMap);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">
          Produtos Vendidos (Detalhado)
        </h3>

        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-500 uppercase">
            Total vendido:
          </span>
          <span className="text-base font-mono text-slate-100">
            {formatBRLFromCents(totals.totalValueCents)}
          </span>

          
        </div>
      </header>

      {/* Card da tabela */}
      <div className="relative rounded-2xl border border-white/10 bg-dark-900/30 overflow-hidden">
        {/* CONTAINER CONTROLADOR — Corrige o vazamento */}
        <div
          className={[
            "w-full overflow-x-auto overflow-y-auto",
            "max-h-[calc(80vh-220px)]", // 🔥 Ajuste central para evitar vazamento
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          ].join(" ")}
        >
          {/* Tabela */}
          <table className="min-w-[980px] w-full text-xs text-left text-slate-100 border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 bg-dark-950/80 backdrop-blur-xl">
              <tr>
                <th
                  className={[
                    "py-3 px-3",
                    "border-b border-white/10",
                    "sticky left-0 z-30",
                    "bg-dark-950/80 backdrop-blur-xl",
                    "text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400",
                  ].join(" ")}
                >
                  Data da venda
                </th>

                <th className="py-3 px-3 border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                  Produto
                </th>

                <th className="py-3 px-3 border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                  Custo
                </th>

                <th className="py-3 px-3 border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                  Quantidade
                </th>

                <th className="py-3 px-3 border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                  Valor total
                </th>

                <th className="py-3 px-3 border-b border-white/10 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                  Estoque restante
                </th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 px-4 text-slate-400 text-center"
                  >
                    Nenhum produto vendido.
                  </td>
                </tr>
              ) : (
                products.map((p, i) => {
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
                          "py-2.5 px-3 whitespace-nowrap",
                          "sticky left-0 z-10",
                          "bg-inherit border-r border-white/5",
                          "font-mono text-[11px] text-slate-300",
                          "group-hover:text-slate-100",
                        ].join(" ")}
                      >
                        {formatDate(p.sale_date)}
                      </td>

                      <td className="py-2.5 px-3 max-w-[340px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/70 shadow-[0_0_12px_rgba(34,211,238,0.45)]" />
                          <span className="truncate text-slate-100">
                            {p.product_name}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-500 font-mono">
                          ID: <span className="text-slate-400">{p.product_id}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                        {cost > 0 ? (
                          <span className="text-slate-200">
                            {formatBRLFromCents(cost)}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-100">
                        {p.total_quantity}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-100">
                        {formatBRLFromCents(p.total_value)}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                        {info ? (
                          <span
                            className={[
                              "inline-flex items-center gap-2",
                              isLowStock ? "text-rose-300" : "text-emerald-300",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "h-1.5 w-1.5 rounded-full",
                                isLowStock
                                  ? "bg-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.55)]"
                                  : "bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.45)]",
                              ].join(" ")}
                            />
                            {info.stock_on_hand}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
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
