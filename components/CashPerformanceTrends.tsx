import './CashPerformanceTrends.scrollbar.css';
import React, { useEffect, useState } from 'react';
import mockPerformanceData from './mockPerformanceData';

type PeriodType = 'day' | 'week' | 'month';

function toLocalDateInput(value: string | number | Date) {
  const d = new Date(value);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

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

type CashPerformanceTrendsProps = { onTelemetry?: (area: string, action: string, meta?: Record<string, any>) => void };

const CashPerformanceTrends: React.FC<CashPerformanceTrendsProps> = ({ onTelemetry }) => {
  // Troque para false para usar a API real
  const USE_MOCK = false;

  const [periodType, setPeriodType] = useState<PeriodType>('day');
  // Estado para saber qual botão de dias está ativo
  const [activeDays, setActiveDays] = useState<30 | 60 | 90 | null>(30);
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
      onTelemetry?.('performance', 'load-mock');
      // Definir datas padrão após carregar mock
      const sales = mockPerformanceData.sales;
      if (sales && sales.length > 0) {
        const sorted = [...sales].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const end = new Date(sorted[sorted.length - 1].timestamp);
        const start = new Date(end);
        start.setDate(end.getDate() - 29); // 30d padrão
        setDateRange({
          start: toLocalDateInput(start),
          end: toLocalDateInput(end),
        });
        setActiveDays(30);
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
          onTelemetry?.('performance', 'load-success', { sales: Array.isArray(apiData?.sales) ? apiData.sales.length : 0 });
          // Definir datas padrão após carregar API
          const sales = apiData.sales;
          console.log('Vendas carregadas para CashPerformanceTrends:', sales);
          if (sales && sales.length > 0) {
            const sorted = [...sales].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            const end = new Date(sorted[sorted.length - 1].timestamp);
            const start = new Date(end);
            start.setDate(end.getDate() - 29); // 30d padrão
            setDateRange({
              start: toLocalDateInput(start),
              end: toLocalDateInput(end),
            });
            setActiveDays(30);
          }
        })
          .catch(e => { setError(e.message); onTelemetry?.('performance', 'load-error', { message: e.message }); })
        .finally(() => setLoading(false));
    }
        }, [USE_MOCK, onTelemetry]);

  // Filtro de vendas por data inicial/final (para os cards)
  const filteredSalesForCards = React.useMemo(() => {
    if (!data || !Array.isArray(data.sales)) return [];
    console.log('Filtrando vendas para cards com dataRange:', dateRange);
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);
    return data.sales.filter((sale: any) => {
      const d = new Date(sale.timestamp);
      return d >= start && d <= end;
    });
  }, [data, dateRange]);

  // Totais por método (apenas filtro de data)
  const totals = React.useMemo(() => {
    let cash = 0, card = 0, pix = 0;
    console.log('Calculando totais para cards a partir de vendas filtradas:', filteredSalesForCards);
    filteredSalesForCards.forEach((sale: any) => {
      if (Array.isArray(sale.payments)) {
        sale.payments.forEach((p: any) => {
          if (p.method === 'cash') cash += p.amount || 0;
          else if (p.method === 'card' || p.method === 'credit' || p.method === 'debit') card += p.amount || 0;
          else if (p.method === 'pix') pix += p.amount || 0;
        });
      }
    });
    return { cash, card, pix };
  }, [filteredSalesForCards]);

  // Filtro de vendas por período (para o gráfico)
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

  // Dados para gráfico: agrupamento por período + normalização de altura + períodos sem vendas
  const chartData = React.useMemo(() => {
    if (!dateRange.start || !dateRange.end) return [];
    // Agrupa por data (dia, semana, mês)
    const groupKey = (d: Date) => {
      if (periodType === 'day') return d.toISOString().slice(0, 10);
      if (periodType === 'week') {
        const year = d.getFullYear();
        const week = Math.ceil(((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(d.getFullYear(), 0, 1).getDay() + 1) / 7);
        return `${year}-S${week}`;
      }
      // month
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    };
    // Gera todos os períodos do intervalo
    const periods: string[] = [];
    let cursor = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    if (periodType === 'day') {
      while (cursor <= end) {
        periods.push(groupKey(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    } else if (periodType === 'week') {
      // Garante início na segunda-feira
      cursor = getStartOfPeriod(cursor, 'week');
      while (cursor <= end) {
        periods.push(groupKey(cursor));
        cursor.setDate(cursor.getDate() + 7);
      }
    } else {
      // month
      cursor = getStartOfPeriod(cursor, 'month');
      while (cursor <= end) {
        periods.push(groupKey(cursor));
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }
    // Agrupa vendas
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
    // Preenche períodos sem vendas
    const arr = periods.map(label => ({
      label,
      total: map[label]?.total || 0,
      items: map[label]?.items || 0,
    }));
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
  }, [filteredSales, periodType, dateRange]);

  // Handlers
  function handlePeriodTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const type = e.target.value as PeriodType;
    setPeriodType(type);
    onTelemetry?.('performance', 'period-change', { period: type });
    // Não altera dataRange!
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
    onTelemetry?.('performance', 'date-change', { field: e.target.name, value: e.target.value });
  }

  return (
    <div className="p-4 md:p-6 w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 md:mb-4 gap-2 flex-wrap">
        <h2 className="text-lg md:text-xl font-bold text-accent">Desempenho de Vendas</h2>
        <div className="flex items-center gap-2">
          {/* Botões de período automático */}
          <div className="flex gap-1 mr-2">
            {[30, 60, 90].map(days => (
                <button
                  key={days}
                  type="button"
                  className={`px-2 py-1 rounded-md text-xs font-bold border border-accent/20 transition-colors ${
                    activeDays === days
                      ? 'bg-[#0d3136cc] text-white shadow-[0_0_4px_0_rgba(34,211,238,0.18)]'
                      : 'text-accent hover:bg-accent/20'
                  }`}
                  onClick={() => {
                    // Usa a última data disponível nos dados como referência
                    let endDateStr = dateRange.end;
                    if (data && Array.isArray(data.sales) && data.sales.length > 0) {
                      const sorted = [...data.sales].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                      endDateStr = toLocalDateInput(sorted[sorted.length - 1].timestamp);
                    }
                    const end = new Date(endDateStr);
                    const start = new Date(end);
                    start.setDate(end.getDate() - (days - 1));
                    setDateRange({
                      start: toLocalDateInput(start),
                      end: toLocalDateInput(end),
                    });
                    setActiveDays(days);
                    onTelemetry?.('performance', 'quick-range', { days, start: toLocalDateInput(start), end: toLocalDateInput(end) });
                  }}
                  title={`Últimos ${days} dias`}
                >
                  {days}d
                </button>
            ))}
            {/* Botão ALL */}
            <button
              type="button"
              className="px-2 py-1 rounded-md text-xs font-bold bg-dark-900/60 border border-accent/30 text-accent hover:bg-accent/20 transition-colors"
              onClick={() => {
                if (data && Array.isArray(data.sales) && data.sales.length > 0) {
                  const sorted = [...data.sales].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                  const start = new Date(sorted[0].timestamp);
                  const end = new Date(sorted[sorted.length - 1].timestamp);
                  end.setDate(end.getDate() + 1); // +1 dia para manter padrão inicial
                  setDateRange({
                    start: toLocalDateInput(start),
                    end: toLocalDateInput(end),
                  });
                  onTelemetry?.('performance', 'range-all', { start: toLocalDateInput(start), end: toLocalDateInput(end) });
                }
              }}
              title="Todo o período"
            >
              All
            </button>
          </div>
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
      </div>

      {/* Cards compactos, semi-transparentes e resumo */}
      <div className="flex flex-row flex-wrap gap-2 mb-3 md:mb-4 items-center justify-between w-full">
        <div className="flex flex-col items-center justify-between rounded-xl px-2 py-2 min-w-[90px] max-w-[120px] bg-emerald-400/5 border border-emerald-400/10 backdrop-blur-xl" style={{flex: '1 1 0', minWidth: 90, maxWidth: 120}}>
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-300 mb-0.5">Dinheiro</span>
          <span className="text-base font-mono  text-emerald-100">{formatBRL(totals.cash)}</span>
        </div>
        <div className="flex flex-col items-center justify-between rounded-xl px-2 py-2 min-w-[90px] max-w-[120px] bg-blue-400/5 border border-blue-400/10 backdrop-blur-xl" style={{flex: '1 1 0', minWidth: 90, maxWidth: 120}}>
          <span className="text-[9px] font-bold uppercase tracking-widest text-blue-300 mb-0.5">Cartão</span>
          <span className="text-base font-mono  text-blue-100">{formatBRL(totals.card)}</span>
        </div>
        <div className="flex flex-col items-center justify-between rounded-xl px-2 py-2 min-w-[90px] max-w-[120px] bg-amber-400/5 border border-amber-400/10 backdrop-blur-xl" style={{flex: '1 1 0', minWidth: 90, maxWidth: 120}}>
          <span className="text-[9px] font-bold uppercase tracking-widest text-amber-300 mb-0.5">Pix</span>
          <span className="text-base font-mono  text-amber-100">{formatBRL(totals.pix)}</span>
        </div>
        <div className="flex flex-col items-center justify-between rounded-xl px-2 py-2 min-w-[110px] max-w-[150px] bg-dark-700/30 border border-white/10 backdrop-blur-xl" style={{flex: '1 1 0', minWidth: 110, maxWidth: 150}}>
          <span className="text-[9px] font-bold uppercase tracking-widest text-accent mb-0.5">Total Vendido</span>
          <span className="text-base font-mono  text-accent">{formatBRL(filteredSalesForCards.reduce((sum, s) => sum + (s.total || 0), 0))}</span>
        </div>
        <div className="flex flex-col items-center justify-between rounded-xl px-2 py-2 min-w-[110px] max-w-[150px] bg-dark-700/30 border border-white/10 backdrop-blur-xl" style={{flex: '1 1 0', minWidth: 110, maxWidth: 150}}>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300 mb-0.5">Itens Vendidos</span>
          <span className="text-base font-mono text-slate-100">{filteredSalesForCards.reduce((sum, s) => sum + (Array.isArray(s.items) ? s.items.reduce((a, i) => a + (i.quantity || 0), 0) : 0), 0)}</span>
        </div>
        <div className="flex flex-col items-center justify-between rounded-xl px-2 py-2 min-w-[110px] max-w-[150px] bg-dark-700/30 border border-white/10 backdrop-blur-xl" style={{flex: '1 1 0', minWidth: 110, maxWidth: 150}}>
          <span className="text-[9px] font-bold uppercase tracking-widest text-sky-300 mb-0.5">Média Venda</span>
          <span className="text-base font-mono text-sky-100">{filteredSalesForCards.length > 0 ? formatBRL(filteredSalesForCards.reduce((sum, s) => sum + (s.total || 0), 0) / filteredSalesForCards.length) : 'R$ 0,00'}</span>
        </div>
        <div className="flex flex-col items-center justify-between rounded-xl px-2 py-2 min-w-[110px] max-w-[150px] bg-dark-700/30 border border-white/10 backdrop-blur-xl" style={{flex: '1 1 0', minWidth: 110, maxWidth: 150}}>
          <span className="text-[9px] font-bold uppercase tracking-widest text-fuchsia-300 mb-0.5">Média Itens</span>
          <span className="text-base font-mono  text-fuchsia-100">{filteredSalesForCards.length > 0 ? (filteredSalesForCards.reduce((sum, s) => sum + (Array.isArray(s.items) ? s.items.reduce((a, i) => a + (i.quantity || 0), 0) : 0), 0) / filteredSalesForCards.length).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '0'}</span>
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
                    {d.items > 0 || d.total > 0 ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <div className="w-3 md:w-5" style={{ height: '8px', opacity: 0.2 }} />
                        <div className="w-3 md:w-5" style={{ height: '8px', opacity: 0.2 }} />
                      </>
                    )}
                  </div>
                  <div className="mt-1 md:mt-2 text-[10px] md:text-xs font-mono text-slate-400 text-center">
                    {d.label}
                  </div>
                  <div className="text-[9px] md:text-[10px] text-slate-500">
                    {d.items > 0 ? `${d.items} itens` : ''}
                  </div>
                  <div className="text-[9px] md:text-[10px] text-accent">
                    {d.total > 0 ? formatBRL(d.total) : ''}
                  </div>
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
