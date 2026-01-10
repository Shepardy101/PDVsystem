import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Banknote, CreditCard, Zap, TrendingUp } from 'lucide-react';

export interface SalesBreakdownChartProps {
  totals: { cashCents: number; cardCents: number; pixCents: number };
  data: { hour: string; totalCents: number }[];
  dayLabel?: string;
}

type TooltipState =
  | {
      visible: true;
      x: number;
      y: number;
      hour: string;
      valueCents: number;
    }
  | { visible: false };

function formatBRLFromCents(cents: number) {
  const value = (cents || 0) / 100;
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;

    const update = () => setReduced(!!mq.matches);
    update();

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }

    // Safari legacy
    // eslint-disable-next-line deprecation/deprecation
    mq.addListener(update);
    // eslint-disable-next-line deprecation/deprecation
    return () => mq.removeListener(update);
  }, []);

  return reduced;
}

const SalesBreakdownChart: React.FC<SalesBreakdownChartProps> = ({ totals, data, dayLabel = 'Hoje' }) => {
  const reducedMotion = usePrefersReducedMotion();

  // Para animação das barras sem lib: renderiza altura 0 e depois aplica alturas reais.
  const [animateBars, setAnimateBars] = useState(false);

  const chartRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false });

  const totalAllCents = useMemo(() => {
    return (totals?.cashCents || 0) + (totals?.cardCents || 0) + (totals?.pixCents || 0);
  }, [totals]);

  const breakdown = useMemo(() => {
    const safeTotal = totalAllCents > 0 ? totalAllCents : 1;
    const pct = (cents: number) => Math.round((clamp(cents, 0, safeTotal) / safeTotal) * 100);

    return [
      {
        id: 'cash',
        label: 'Dinheiro',
        icon: Banknote,
        cents: totals?.cashCents || 0,
        pct: pct(totals?.cashCents || 0),
        accent: 'text-emerald-400',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
        glow: 'shadow-[0_0_18px_rgba(16,185,129,0.18)]',
      },
      {
        id: 'card',
        label: 'Cartão',
        icon: CreditCard,
        cents: totals?.cardCents || 0,
        pct: pct(totals?.cardCents || 0),
        accent: 'text-purple-400',
        border: 'border-purple-500/30',
        bg: 'bg-purple-500/10',
        glow: 'shadow-[0_0_18px_rgba(168,85,247,0.16)]',
      },
      {
        id: 'pix',
        label: 'Pix',
        icon: Zap,
        cents: totals?.pixCents || 0,
        pct: pct(totals?.pixCents || 0),
        accent: 'text-cyan-400',
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-500/10',
        glow: 'shadow-[0_0_18px_rgba(34,211,238,0.16)]',
      },
    ] as const;
  }, [totals, totalAllCents]);

  const chartStats = useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];
    const max = safeData.reduce((acc, p) => Math.max(acc, p.totalCents || 0), 0);
    const sum = safeData.reduce((acc, p) => acc + (p.totalCents || 0), 0);
    const avg = safeData.length > 0 ? Math.round(sum / safeData.length) : 0;

    // Se tudo zero, evita dividir por 0 e ainda mantém uma “altura mínima”
    const maxSafe = Math.max(max, 1);

    const peakIndex = safeData.length > 0 ? safeData.findIndex(p => (p.totalCents || 0) === max) : -1;

    return { maxCents: maxSafe, avgCents: avg, peakIndex, points: safeData };
  }, [data]);

  useEffect(() => {
    if (!chartStats.points.length) return;
    if (reducedMotion) {
      setAnimateBars(true);
      return;
    }

    setAnimateBars(false);
    const t = window.setTimeout(() => setAnimateBars(true), 60);
    return () => window.clearTimeout(t);
  }, [chartStats.points.length, reducedMotion]);

  const showTooltip = (el: HTMLElement, hour: string, valueCents: number) => {
    const root = chartRef.current;
    if (!root) return;

    const rootRect = root.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    // Posiciona tooltip centralizado na barra, acima do topo da barra
    const x = elRect.left - rootRect.left + elRect.width / 2;
    const y = elRect.top - rootRect.top;

    setTooltip({
      visible: true,
      x,
      y,
      hour,
      valueCents,
    });
  };

  const hideTooltip = () => setTooltip({ visible: false });

  // Dimensões do gráfico
  const chartHeightPx = 220;
  const plotHeightPx = 160; // área útil das barras (o resto é padding/labels)

  // Se tiver muitos pontos, ativa scroll horizontal com barra mínima por coluna
  const manyPoints = chartStats.points.length > 24; // mais granularidade por minuto
  const barMinWidth = manyPoints ? 32 : 0;

  return (
    <section className="w-full p-4 ">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-200 uppercase tracking-[0.18em] assemble-text">
            Desempenho do Dia
          </h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.28em] flex items-center gap-2">
            <TrendingUp size={12} className="text-accent" />
            {dayLabel} • Totais por método + vendas por hora
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.28em]">Total do dia</p>
          <p className="text-xl font-mono font-bold text-accent">{formatBRLFromCents(totalAllCents)}</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {breakdown.map(card => (
          <div
            key={card.id}
            className={[
              'relative overflow-hidden rounded-2xl border bg-dark-950/40 backdrop-blur-xl',
              'p-4 transition-all duration-200',
              'hover:border-white/15 hover:bg-dark-950/55',
              card.border,
              card.glow,
            ].join(' ')}
          >
            {/* brilho de fundo */}
            <div className={`absolute inset-0 ${card.bg} opacity-70`} />
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-white/5 blur-2xl" />

            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={[
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    'border border-white/10 bg-dark-900/40',
                  ].join(' ')}
                >
                  <card.icon size={18} className={card.accent} />
                </div>

                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-semibold">
                    {card.label}
                  </p>
                  <p className="text-lg font-mono font-bold text-slate-100">{formatBRLFromCents(card.cents)}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-semibold">%</p>
                <p className={`text-xl font-mono font-bold ${card.accent}`}>{card.pct}%</p>
              </div>
            </div>

            {/* linha neon */}
            <div className="relative mt-4 h-[6px] rounded-full bg-white/5 overflow-hidden border border-white/10">
              <div
                className={[
                  'h-full rounded-full',
                  card.id === 'cash'
                    ? 'bg-gradient-to-r from-emerald-500/60 to-emerald-300/30'
                    : card.id === 'card'
                      ? 'bg-gradient-to-r from-purple-500/60 to-fuchsia-300/30'
                      : 'bg-gradient-to-r from-cyan-500/60 to-blue-300/30',
                ].join(' ')}
                style={{ width: `${card.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div
        ref={chartRef}
        className={[
          'relative mt-6 rounded-2xl border border-white/10 bg-dark-950/40 backdrop-blur-xl',
          'shadow-[0_10px_35px_rgba(0,0,0,0.35)] overflow-hidden',
        ].join(' ')}
        style={{ height: chartHeightPx }}
        onMouseLeave={hideTooltip}
      >
        {/* scanlines / estética */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:100%_10px]" />
        </div>

        {/* header do chart */}
        <div className="relative px-5 pt-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-semibold">Vendas por minuto</p>
            <p className="text-xs text-slate-400">
              Pico: <span className="font-mono text-slate-200">{formatBRLFromCents(chartStats.maxCents)}</span> • Média:{' '}
              <span className="font-mono text-slate-200">{formatBRLFromCents(chartStats.avgCents)}</span>
            </p>
          </div>

          <div className="text-[10px] text-slate-500 uppercase tracking-[0.28em]">
            {manyPoints ? 'Scroll horizontal' : 'Visão completa'}
          </div>
        </div>

        {/* área de plot */}
        <div className="relative px-5 pb-4 pt-3">
          {/* linha de média */}
          <div
            className="absolute left-5 right-5 border-t border-dashed border-white/15"
            style={{
              top: 48 + (plotHeightPx - (chartStats.avgCents / chartStats.maxCents) * plotHeightPx),
            }}
            aria-hidden="true"
          />
          <div
            className="absolute right-5 text-[10px] text-slate-500 uppercase tracking-[0.24em]"
            style={{
              top: 48 + (plotHeightPx - (chartStats.avgCents / chartStats.maxCents) * plotHeightPx) - 14,
            }}
            aria-hidden="true"
          >
            Média
          </div>

          {/* container com scroll se precisar */}
          <div className={manyPoints ? 'overflow-x-auto' : ''}>
            <div
              className="flex items-end gap-3"
              style={{
                height: plotHeightPx,
                minWidth: manyPoints ? chartStats.points.length * barMinWidth : undefined,
              }}
            >
              {chartStats.points.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                  Sem dados para exibir.
                </div>
              ) : (
                chartStats.points.map((p, idx) => {
                  const ratio = (p.totalCents || 0) / chartStats.maxCents;
                  const height = Math.max(6, Math.round(ratio * (plotHeightPx - 8)));

                  const isPeak = idx === chartStats.peakIndex && chartStats.maxCents > 1;

                  return (
                    <div key={`${p.hour}-${idx}`} className="flex flex-col items-center justify-end flex-1">
                      {/* badge pico ou valor acima da barra */}
                      {isPeak ? (
                        <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.24em] text-accent">
                          Pico
                        </div>
                      ) : (
                        <div className="mb-1 text-[10px] font-mono font-semibold text-slate-400 select-none">
                          {formatBRLFromCents(p.totalCents || 0)}
                        </div>
                      )}

                      <button
                        type="button"
                        className={[
                          'relative w-7 sm:w-8 rounded-t-xl outline-none',
                          'border border-white/10',
                          'bg-gradient-to-b from-accent/80 to-accent/20',
                          'shadow-[0_0_18px_rgba(34,211,238,0.12)]',
                          'transition-all duration-200',
                          'hover:from-accent hover:to-accent/30 hover:border-accent/40 hover:shadow-[0_0_26px_rgba(34,211,238,0.22)]',
                          'focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-0',
                        ].join(' ')}
                        style={{
                          height: animateBars ? height : 2,
                          transitionProperty: 'height, transform, filter, box-shadow, border-color',
                          transitionDuration: reducedMotion ? '0ms' : '420ms',
                          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                        aria-label={`Hora ${p.hour}, total ${formatBRLFromCents(p.totalCents || 0)}`}
                        onMouseEnter={e => showTooltip(e.currentTarget, p.hour, p.totalCents || 0)}
                        onMouseMove={e => showTooltip(e.currentTarget, p.hour, p.totalCents || 0)}
                        onFocus={e => showTooltip(e.currentTarget, p.hour, p.totalCents || 0)}
                        onBlur={hideTooltip}
                      >
                        {/* brilho interno */}
                        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.35),transparent_55%)] opacity-70" />
                      </button>

                      <span className="mt-2 text-[10px] text-slate-500 font-semibold">{p.hour}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* tooltip */}
          {tooltip.visible && (
            <div
              className={[
                'absolute z-50 -translate-x-1/2 -translate-y-2',
                'px-3 py-2 rounded-xl border border-white/10',
                'bg-dark-950/90 backdrop-blur-xl shadow-2xl',
              ].join(' ')}
              style={{
                left: tooltip.x,
                top: clamp(tooltip.y - 10, 52, chartHeightPx - 20),
              }}
              role="status"
              aria-live="polite"
            >
              <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-semibold">
                {tooltip.hour}
              </div>
              <div className="text-sm font-mono font-bold text-slate-100">{formatBRLFromCents(tooltip.valueCents)}</div>
            </div>
          )}
        </div>

        {/* rodapé discreto */}
        <div className="absolute bottom-0 left-0 right-0 px-5 py-2 border-t border-white/10 bg-dark-950/30">
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">
            Telemetria local ativa • Dados do turno
          </p>
        </div>
      </div>
    </section>
  );
};

export default SalesBreakdownChart;