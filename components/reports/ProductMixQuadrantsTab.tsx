import { fetchProductMix } from '@/services/reports';
import React, { useState, useEffect } from 'react';
import ProductMixQuadrantsChart from './ProductMixQuadrantsChart';
import ProductMixQuadrantsTables from './ProductMixQuadrantsTables';
import FuturisticSpinner from '../FuturisticSpinner';

type TelemetryFn = (area: string, action: string, meta?: Record<string, any>) => void;

interface ProductMixQuadrantsTabProps {
  onTelemetry?: TelemetryFn;
}

const PRESETS = [
  { label: 'Hoje', getRange: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { from: start.getTime(), to: now.getTime() };
  } },
  { label: '7 dias', getRange: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    return { from: start.getTime(), to: now.getTime() };
  } },
  { label: '30 dias', getRange: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    return { from: start.getTime(), to: now.getTime() };
  } },
  { label: 'Custom', getRange: () => null }
];

const ProductMixQuadrantsTab: React.FC<ProductMixQuadrantsTabProps> = ({ onTelemetry }) => {
  const [preset, setPreset] = useState(2); // 30 dias
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [showTable, setShowTable] = useState(false);

  const getRange = () => {
    if (PRESETS[preset].label !== 'Custom') return PRESETS[preset].getRange();
    if (!customFrom || !customTo) return null;
    return { from: new Date(customFrom).getTime(), to: new Date(customTo).getTime() };
  };

  useEffect(() => {
    const range = getRange();
    if (!range) return;
    onTelemetry?.('productMix', 'fetch:start', { preset: PRESETS[preset].label, range });
    setLoading(true);
    setError(null);
    fetchProductMix(range.from, range.to)
      .then((resp) => {
        setData(resp);
        onTelemetry?.('productMix', 'fetch:success', { preset: PRESETS[preset].label, range, items: resp?.length ?? 0 });
      })
      .catch(e => {
        const message = e.message || 'Erro ao buscar dados';
        setError(message);
        onTelemetry?.('productMix', 'fetch:error', { preset: PRESETS[preset].label, range, message });
      })
      .finally(() => setLoading(false));
  }, [preset, customFrom, customTo, onTelemetry]);

  // Calcular limites e médios para passar para as tabelas
  let midX = 0, midY = 0;
  if (data.length > 0) {
    const xs = data.map((p) => p.frequency);
    const ys = data.map((p) => p.total_quantity);
    const minX = Math.min(...xs) * 0.9;
    const maxX = Math.max(...xs) * 1.1;
    const minY = Math.min(...ys) * 0.9;
    const maxY = Math.max(...ys) * 1.1;
    midX = (minX + maxX) / 2;
    midY = (minY + maxY) / 2;
  }

  return (
    <div className="glass-card p-4 rounded-2xl border border-cyan-700/30 shadow-lg bg-dark-900/50 animate-in fade-in slide-in-from-bottom-6 flex flex-col flex-1 h-full min-h-0">
      {/* Intervalo de datas e botão tabela */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6 w-full justify-between">
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all border ${preset === i ? 'bg-cyan-700/30 text-cyan-200 border-cyan-400 shadow-cyan-500/20 shadow-lg' : 'bg-dark-950/60 text-slate-400 border-cyan-900 hover:bg-cyan-900/20'}`}
              onClick={() => {
                setPreset(i);
                onTelemetry?.('productMix', 'filter:preset', { preset: p.label });
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center ml-auto">
          {PRESETS[preset].label === 'Custom' && (
            <>
              <input type="date" value={customFrom} onChange={e => { setCustomFrom(e.target.value); onTelemetry?.('productMix', 'filter:custom-from', { value: e.target.value }); }} className="bg-dark-950/80 border border-cyan-700 rounded px-2 py-1 text-cyan-200" />
              <span className="text-cyan-400">até</span>
              <input type="date" value={customTo} onChange={e => { setCustomTo(e.target.value); onTelemetry?.('productMix', 'filter:custom-to', { value: e.target.value }); }} className="bg-dark-950/80 border border-cyan-700 rounded px-2 py-1 text-cyan-200" />
            </>
          )}
          <button
            className={`ml-4 px-4 py-2 rounded-lg font-bold text-xs border transition-all ${showTable ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-dark-950/60 text-cyan-300 border-cyan-900 hover:bg-cyan-900/20'}`}
            onClick={() => setShowTable((v) => {
              const next = !v;
              onTelemetry?.('productMix', 'toggle:table', { showTable: next });
              return next;
            })}
          >
            {showTable ? 'Ocultar Tabela' : 'Exibir Tabela'}
          </button>
        </div>
      </div>
      <div className="w-full flex-1 h-full min-h-0">
        {!showTable ? (
          <div className="w-full flex-1 h-full min-h-0">
            {loading && <FuturisticSpinner />}
            {error && <div className="text-red-400">{error}</div>}
            {!loading && !error && data.length === 0 && (
              <div className="text-slate-400">Nenhum dado encontrado para o período selecionado.</div>)}
            {!loading && !error && data.length > 0 && (
              <ProductMixQuadrantsChart points={data.map((p, i) => ({
                x: p.frequency,
                y: p.total_quantity,
                label: p.product_name || p.name || '-',
                color: p.color,
              }))} />
            )}
          </div>
        ) : (
          <div className="w-full flex-1 h-full min-h-0">
            {loading && <FuturisticSpinner />}
            {error && <div className="text-red-400">{error}</div>}
            {!loading && !error && data.length > 0 && (
              <ProductMixQuadrantsTables
                points={data.map((p, i) => ({
                  x: p.frequency,
                  y: p.total_quantity,
                  label: p.product_name || p.name || '-',
                  color: p.color,
                }))}
                midX={midX}
                midY={midY}
              />
            )}
            {!loading && !error && data.length === 0 && (
              <div className="text-slate-400">Nenhum dado encontrado para o período selecionado.</div>)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductMixQuadrantsTab;
