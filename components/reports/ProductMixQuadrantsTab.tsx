import { fetchProductMix } from '@/services/reports';
import React, { useState, useEffect } from 'react';
import ProductMixQuadrantsChart from './ProductMixQuadrantsChart';

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

const ProductMixQuadrantsTab: React.FC = () => {
  const [preset, setPreset] = useState(2); // 30 dias
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [tab, setTab] = useState<'chart' | 'json'>('chart');

  const getRange = () => {
    if (PRESETS[preset].label !== 'Custom') return PRESETS[preset].getRange();
    if (!customFrom || !customTo) return null;
    return { from: new Date(customFrom).getTime(), to: new Date(customTo).getTime() };
  };

  useEffect(() => {
    const range = getRange();
    if (!range) return;
    setLoading(true);
    setError(null);
    fetchProductMix(range.from, range.to)
      .then(setData)
      .catch(e => setError(e.message || 'Erro ao buscar dados'))
      .finally(() => setLoading(false));
  }, [preset, customFrom, customTo]);

  return (
    <div className="glass-card p-6 rounded-2xl border border-cyan-700/30 shadow-lg bg-dark-900/80 animate-in fade-in slide-in-from-bottom-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all border ${preset === i ? 'bg-cyan-700/30 text-cyan-200 border-cyan-400 shadow-cyan-500/20 shadow-lg' : 'bg-dark-950/60 text-slate-400 border-cyan-900 hover:bg-cyan-900/20'}`}
              onClick={() => setPreset(i)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {PRESETS[preset].label === 'Custom' && (
          <div className="flex gap-2 items-center">
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="bg-dark-950/80 border border-cyan-700 rounded px-2 py-1 text-cyan-200" />
            <span className="text-cyan-400">até</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="bg-dark-950/80 border border-cyan-700 rounded px-2 py-1 text-cyan-200" />
          </div>
        )}
      </div>
      <div className="flex gap-2 mb-2">
        <button
          className={`px-3 py-1 rounded-t-lg font-bold text-xs transition-all border-b-2 ${tab === 'chart' ? 'border-cyan-400 text-cyan-200' : 'border-transparent text-slate-400'}`}
          onClick={() => setTab('chart')}
        >Gráfico</button>
        <button
          className={`px-3 py-1 rounded-t-lg font-bold text-xs transition-all border-b-2 ${tab === 'json' ? 'border-cyan-400 text-cyan-200' : 'border-transparent text-slate-400'}`}
          onClick={() => setTab('json')}
        >JSON</button>
      </div>
      {loading && <div className="text-cyan-300 animate-pulse">Carregando gráfico...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {!loading && !error && data.length === 0 && (
        <div className="text-slate-400">Nenhum dado encontrado para o período selecionado.</div>
      )}
      {!loading && !error && data.length > 0 && (
        tab === 'chart' ? (
          <ProductMixQuadrantsChart points={data} />
        ) : (
          <pre className="text-xs text-white bg-dark-900/80 rounded-lg p-4 max-h-[340px] overflow-y-auto">{JSON.stringify(data, null, 2)}</pre>
        )
      )}
    </div>
  );
};

export default ProductMixQuadrantsTab;
