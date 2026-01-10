import './CashPerformanceTrends.scrollbar.css';
import React, { useEffect, useState } from 'react';
import mockPerformanceData from './mockPerformanceData';

type PeriodType = 'day' | 'week' | 'month';

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getPeriodLabel(period: PeriodType) {
  if (period === 'day') return 'Dia';
  if (period === 'week') return 'Semana';
  return 'Mês';
}

function getStartOfPeriod(date: Date, period: PeriodType) {
  const d = new Date(date);
  if (period === 'day') {
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === 'week') {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // segunda como início
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  // month
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfPeriod(date: Date, period: PeriodType) {
  const d = new Date(date);
  if (period === 'day') {
    d.setHours(23, 59, 59, 999);
    return d;
  }
  if (period === 'week') {
    const day = d.getDay();
    const diff = d.getDate() - day + 7; // domingo como fim
    d.setDate(diff);
    d.setHours(23, 59, 59, 999);
    return d;
  }
  // month
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

const palette = {
  cash: 'bg-green-500 text-green-100 border-green-400',
  card: 'bg-blue-500 text-blue-100 border-blue-400',
  pix: 'bg-amber-500 text-amber-100 border-amber-400',
};

const CashPerformanceTrends: React.FC = () => {
  // Troque para false para usar a API real
  const USE_MOCK = true;

  const [periodType, setPeriodType] = useState<PeriodType>('day');
  // Inicializa datas com base na primeira/última venda
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK) {
      setData(mockPerformanceData);
      setLoading(false);
      setError(null);
      // Definir datas padrão após carregar mock
      const sales = mockPerformanceData.sales;
      if (sales && sales.length > 0) {
        const sorted = [...sales].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setDateRange({
          start: new Date(sorted[0].timestamp).toISOString().slice(0, 10),
          end: new Date(sorted[sorted.length - 1].timestamp).toISOString().slice(0, 10),
        });
      }
    } else {
      setLoading(true);
      fetch('/api/cash/sessions-movements')
        .then(res => {
          if (!res.ok) throw new Error('Erro ao buscar dados do backend');
          return res.json();
        })
        .then(apiData => {
          setData(apiData);
          // Definir datas padrão após carregar API
          const sales = apiData.sales;
          if (sales && sales.length > 0) {
            const sorted = [...sales].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            setDateRange({
              start: new Date(sorted[0].timestamp).toISOString().slice(0, 10),
              end: new Date(sorted[sorted.length - 1].timestamp).toISOString().slice(0, 10),
            });
          }
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [USE_MOCK]);

  // Filtro de vendas por período
  const filteredSales = React.useMemo(() => {
    if (!data || !Array.isArray(data.sales)) return [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);
    return data.sales.filter((sale: any) => {
      const d = new Date(sale.timestamp);
      return d >= start && d <= end;
    });
  }, [data, dateRange]);

  // Totais por método
  const totals = React.useMemo(() => {
    let cash = 0, card = 0, pix = 0;
    filteredSales.forEach((sale: any) => {
      if (Array.isArray(sale.payments)) {
        sale.payments.forEach((p: any) => {
          if (p.method === 'cash') cash += p.amount || 0;
          else if (p.method === 'card' || p.method === 'credit' || p.method === 'debit') card += p.amount || 0;
          else if (p.method === 'pix') pix += p.amount || 0;
        });
      }
    });
    return { cash, card, pix };
  }, [filteredSales]);

  // Dados para gráfico: agrupamento por período + normalização de altura
  const chartData = React.useMemo(() => {
    if (!filteredSales.length) return [];
    // Agrupa por data (dia, semana, mês)
    const groupKey = (d: Date) => {
      if (periodType === 'day') return d.toISOString().slice(0, 10);
      if (periodType === 'week') {
        const year = d.getFullYear();
        const week = Math.ceil((((d as any) - new Date(d.getFullYear(), 0, 1)) / 86400000 + new Date(d.getFullYear(), 0, 1).getDay() + 1) / 7);
        return `${year}-S${week}`;
      }
      // month
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    };
    const map: Record<string, { total: number; items: number }> = {};
    filteredSales.forEach((sale: any) => {
      const d = new Date(sale.timestamp);
      const key = groupKey(d);
      if (!map[key]) map[key] = { total: 0, items: 0 };
      map[key].total += sale.total || 0;
      if (Array.isArray(sale.items)) {
        map[key].items += sale.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      }
    });
    const arr = Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([label, v]) => ({ label, ...v }));
    // Normalização
    const maxItems = Math.max(...arr.map(d => d.items), 1);
    const maxTotal = Math.max(...arr.map(d => d.total), 1);
    // Barra de valor sempre maior que a de itens (ex: +30%)
    return arr.map(d => {
      const itemsHeight = Math.max(6, (d.items / maxItems) * 50); // altura máxima 50px
      const totalHeight = Math.max(itemsHeight + 6, (d.total / maxTotal) * 65); // altura máxima 65px, sempre maior que itemsHeight
      return {
        ...d,
        itemsHeight,
        totalHeight,
      };
    });
  }, [filteredSales, periodType]);

  // Handlers
  function handlePeriodTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const type = e.target.value as PeriodType;
    setPeriodType(type);
    // Mantém data inicial/final como primeira/última venda (+1 dia)
    if (data && Array.isArray(data.sales) && data.sales.length > 0) {
      const sorted = [...data.sales].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const start = new Date(sorted[0].timestamp);
      const end = new Date(sorted[sorted.length - 1].timestamp);
      end.setDate(end.getDate() + 1); // +1 dia
      setDateRange({
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
      });
    }
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  }

  return (
    <div className="p-4 md:p-6 w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h2 className="text-lg md:text-xl font-bold text-accent">Desempenho de Vendas</h2>
        <div className="flex items-center gap-2 bg-dark-900/40 rounded-xl px-2 py-1 border border-white/10 shadow-[0_0_18px_rgba(34,211,238,0.08)]">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Período</label>
            <select value={periodType} onChange={handlePeriodTypeChange} className="rounded-lg border border-white/10 bg-dark-900/60 text-slate-100 px-1 py-0.5 text-xs">
              <option value="day">Dia</option>
              <option value="week">Semana</option>
              <option value="month">Mês</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Inicial</label>
            <input type="date" name="start" value={dateRange.start} onChange={handleDateChange} className="rounded-lg border border-white/10 bg-dark-900/60 text-slate-100 px-1 py-0.5 text-xs" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Final</label>
            <input type="date" name="end" value={dateRange.end} onChange={handleDateChange} className="rounded-lg border border-white/10 bg-dark-900/60 text-slate-100 px-1 py-0.5 text-xs" />
          </div>
        </div>
      </div>

      {/* Cards compactos futuristas */}
      <div className="flex gap-2 mb-4 md:mb-6">
        <div className={`flex-1 min-w-[90px] rounded-xl px-2 py-2 shadow-[0_0_12px_rgba(16,185,129,0.10)] border border-emerald-500/20 bg-gradient-to-br from-emerald-900/40 to-dark-950/60 backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 pointer-events-none bg-emerald-500/5 rounded-xl" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 mb-0.5">Dinheiro</span>
          <span className="text-base font-mono font-bold text-emerald-200">{formatBRL(totals.cash)}</span>
        </div>
        <div className={`flex-1 min-w-[90px] rounded-xl px-2 py-2 shadow-[0_0_12px_rgba(59,130,246,0.10)] border border-blue-500/20 bg-gradient-to-br from-blue-900/40 to-dark-950/60 backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 pointer-events-none bg-blue-500/5 rounded-xl" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 mb-0.5">Cartão</span>
          <span className="text-base font-mono font-bold text-blue-200">{formatBRL(totals.card)}</span>
        </div>
        <div className={`flex-1 min-w-[90px] rounded-xl px-2 py-2 shadow-[0_0_12px_rgba(251,191,36,0.10)] border border-amber-500/20 bg-gradient-to-br from-amber-900/40 to-dark-950/60 backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 pointer-events-none bg-amber-500/5 rounded-xl" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400 mb-0.5">Pix</span>
          <span className="text-base font-mono font-bold text-amber-200">{formatBRL(totals.pix)}</span>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="flex-1 rounded-2xl bg-dark-900/40 border border-white/10 p-4 md:p-6 mb-2 flex flex-col justify-center">
        <h3 className="text-base md:text-lg font-bold text-accent mb-2 md:mb-4">Vendas por {getPeriodLabel(periodType)}</h3>
        <div
          className="overflow-x-auto w-full custom-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch' }}
          ref={el => {
            if (el) {
              el.scrollLeft = el.scrollWidth;
              // Adiciona evento para rolar horizontalmente com a roda do mouse
              el.onwheel = (e: WheelEvent) => {
                if (e.deltaY !== 0) {
                  el.scrollLeft += e.deltaY;
                  e.preventDefault();
                }
              };
            }
          }}
        >
          <div className="flex items-end gap-2 min-h-[80px] md:min-h-[120px]">
            {chartData.length === 0 ? (
              <div className="text-slate-500 text-sm">Sem dados para o período selecionado.</div>
            ) : (
              chartData.map((d, idx) => (
                <div key={d.label} className="flex flex-col items-center min-w-[40px] md:min-w-[60px]">
                  {/* Barras: Itens vendidos (cinza) e Total vendido (colorido) */}
                  <div className="flex gap-0.5 items-end h-16 md:h-20">
                    <div
                      className="w-3 md:w-5 rounded-t-lg bg-slate-600/60"
                      style={{ height: `${d.itemsHeight}px` }}
                      title={`Itens vendidos: ${d.items}`}
                    />
                    <div
                      className="w-3 md:w-5 rounded-t-lg bg-accent"
                      style={{ height: `${d.totalHeight}px` }}
                      title={`Total vendido: ${formatBRL(d.total)}`}
                    />
                  </div>
                  <div className="mt-1 md:mt-2 text-[10px] md:text-xs font-mono text-slate-400 text-center">
                    {d.label}
                  </div>
                  <div className="text-[9px] md:text-[10px] text-slate-500">{d.items} itens</div>
                  <div className="text-[9px] md:text-[10px] text-accent">{formatBRL(d.total)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashPerformanceTrends;
