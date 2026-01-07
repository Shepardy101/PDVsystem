
import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, ComposedChart, Line, ScatterChart, Scatter, ZAxis, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
  ReferenceLine, PieChart, Pie, LineChart
} from 'recharts';
import { 
  Calendar, Download, TrendingUp, Package, Users, DollarSign, ArrowUpRight, 
  Filter, Search, Clock, Target, Percent, Zap, ChevronRight, X, Info, Layers,
  Link, UserCheck, AlertTriangle, TrendingDown, CreditCard, Wallet, 
  ArrowRight, ShieldAlert, Star, Coffee, Ghost, Settings, FileText, MousePointer2,
  Activity, ShoppingCart, Hash, TrendingUp as TrendUpIcon
} from 'lucide-react';
import { Button, Card, Badge, Modal, Input } from '../components/UI';
import { CATEGORIES } from '../constants';

const REVENUE_DETAILED_DATA = [
  { hour: '08h', revenue: 1200, transactions: 15, avgTicket: 80 },
  { hour: '10h', revenue: 4500, transactions: 42, avgTicket: 107 },
  { hour: '12h', revenue: 9800, transactions: 88, avgTicket: 111 },
  { hour: '14h', revenue: 6000, transactions: 55, avgTicket: 109 },
  { hour: '16h', revenue: 8500, transactions: 72, avgTicket: 118 },
  { hour: '18h', revenue: 14200, transactions: 110, avgTicket: 129 },
  { hour: '20h', revenue: 11000, transactions: 95, avgTicket: 115 },
  { hour: '22h', revenue: 3500, transactions: 28, avgTicket: 125 },
];

const COMPARATIVE_DATA = [
  { day: '01', current: 4200, previous: 3800, profitCurrent: 1400, profitPrevious: 1200 },
  { day: '05', current: 5100, previous: 4900, profitCurrent: 1700, profitPrevious: 1600 },
  { day: '10', current: 4800, previous: 5200, profitCurrent: 1550, profitPrevious: 1750 },
  { day: '15', current: 6200, previous: 5800, profitCurrent: 2100, profitPrevious: 1950 },
  { day: '20', current: 7500, previous: 6100, profitCurrent: 2600, profitPrevious: 2000 },
  { day: '25', current: 8100, previous: 7400, profitCurrent: 2850, profitPrevious: 2500 },
  { day: '30', current: 9400, previous: 8200, profitCurrent: 3200, profitPrevious: 2800 },
];

const SPARK_DATA = [
  { v: 40 }, { v: 30 }, { v: 45 }, { v: 50 }, { v: 35 }, { v: 60 }, { v: 55 }
];

const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState('Últimos 30 dias');
  const [cockpitView, setCockpitView] = useState<'receita' | 'lucro'>('receita');

  const SummaryCard = ({ type, title, subtitle, value, trend, icon: Icon, color }: any) => (
    <div 
      onClick={() => setActiveReport(type)}
      className="glass-card p-6 rounded-3xl border border-white/5 hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer group flex flex-col justify-between h-full relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500"
    >
      <div className="absolute -right-6 -top-6 text-white/5 group-hover:text-accent/10 transition-colors">
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className={`p-3 rounded-2xl bg-dark-950 border border-white/5 shadow-inner ${color}`}>
            <Icon size={20} />
          </div>
          <Badge variant={trend.startsWith('+') ? 'success' : 'danger'}>{trend}</Badge>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-mono font-bold text-white tracking-tighter mb-1">{value}</h3>
          {subtitle && <p className="text-[9px] text-slate-400 font-medium">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-600 group-hover:text-accent transition-colors">
        <span>Análise Profunda</span>
        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );

  const KPICard = ({ label, value, delta, isPositive, icon: Icon }: any) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 hover:border-accent/30 transition-all group overflow-hidden relative">
      <div className="flex justify-between items-start relative z-10">
         <div className="p-2 rounded-lg bg-dark-950 border border-white/5 text-slate-400 group-hover:text-accent transition-colors">
            <Icon size={16} />
         </div>
         <span className={`text-[10px] font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '↑' : '↓'} {delta}
         </span>
      </div>
      <div className="relative z-10">
         <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
         <h4 className="text-lg font-mono font-bold text-white tracking-tight">{value}</h4>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-12 opacity-30 group-hover:opacity-60 transition-opacity">
         <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SPARK_DATA}>
               <Line type="monotone" dataKey="v" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth={2} dot={false} />
            </LineChart>
         </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="p-8 flex flex-col h-full overflow-hidden assemble-view bg-dark-950 bg-cyber-grid relative">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 shrink-0 mb-8 relative z-10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
             <Layers className="text-accent" /> Inteligência de Dados
          </h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest text-[10px]">Núcleo de Processamento Estratégico // NovaBev Analytics</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-dark-900/50 border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3 backdrop-blur-md">
              <Calendar size={14} className="text-accent" />
              <span className="text-[10px] font-bold text-slate-300 uppercase">{dateRange}</span>
           </div>
           <Button variant="secondary" onClick={() => setIsFilterOpen(true)} icon={<Filter size={18} />}>Configurar</Button>
           <Button className="shadow-accent-glow" icon={<Download size={18} />}>Exportar Snapshot</Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
           <SummaryCard 
            type="performance"
            title="Receita Consolidada"
            value="R$ 142.580,22"
            trend="+18.4%"
            icon={DollarSign}
            color="text-emerald-400"
           />
           <SummaryCard 
            type="profitability"
            title="Margem de Lucro"
            value="34.2%"
            trend="+2.1%"
            icon={Percent}
            color="text-accent"
           />
           <SummaryCard 
            type="inventory"
            title="Giro de Ativos"
            value="12.4x"
            trend="+0.5x"
            icon={Package}
            color="text-blue-400"
           />
        </div>

        <div className="glass-panel rounded-3xl p-8 border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-4 flex items-center gap-2">
                 <Clock size={14} className="text-accent" /> Pulso Operacional
              </h3>
              <div className="grid grid-cols-3 gap-4">
                 <div className="p-4 bg-white/2 rounded-2xl border border-white/5 text-center hover:border-accent/20 transition-all">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Conversão</p>
                    <p className="text-xl font-mono font-bold text-white">42%</p>
                 </div>
                 <div className="p-4 bg-white/2 rounded-2xl border border-white/5 text-center hover:border-accent/20 transition-all">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Humor do PDV</p>
                    <p className="text-xl font-mono font-bold text-emerald-400">98%</p>
                 </div>
                 <div className="p-4 bg-white/2 rounded-2xl border border-white/5 text-center hover:border-accent/20 transition-all">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Ruptura</p>
                    <p className="text-xl font-mono font-bold text-red-400">0.2%</p>
                 </div>
              </div>
           </div>
           <div className="flex flex-col justify-center">
              <div className="p-6 bg-accent/5 border border-accent/20 rounded-2xl flex items-center gap-6 shadow-accent-glow/5">
                 <TrendUpIcon className="text-accent shrink-0 animate-pulse" size={32} />
                 <div>
                    <h4 className="text-sm font-bold text-white mb-1 tracking-tight">Motor de Análise Preditiva</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Projeções estatísticas indicam que o estoque no quadrante <strong className="text-accent">Curva A</strong> deve ser reforçado para capturar a demanda do próximo turno.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* MODAL COCKPIT EXECUTIVO - MISSION CONTROL */}
      <Modal 
        isOpen={activeReport === 'profitability'} 
        onClose={() => setActiveReport(null)} 
        title="Cockpit Executivo — Receita & Lucro" 
        size="5xl"
      >
        <div className="flex flex-col gap-10">
           {/* Header de Comparação e Filtros */}
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-6">
              <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Activity size={10} className="text-accent" /> Status Operacional
                 </p>
                 <h2 className="text-sm font-bold text-slate-200">Comparação com período anterior ativa</h2>
              </div>
              <div className="flex items-center gap-2 p-1 bg-dark-950/50 rounded-xl border border-white/10 backdrop-blur-md">
                 {['Hoje', '7 dias', '30 dias', 'Mês'].map(p => (
                    <button 
                      key={p} 
                      className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${p === '30 dias' ? 'bg-accent/10 text-accent border border-accent/30 shadow-accent-glow' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                       {p}
                    </button>
                 ))}
                 <button className="p-1.5 text-slate-500 hover:text-white"><Settings size={14} /></button>
              </div>
           </div>

           {/* KPI Cards Strip */}
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <KPICard label="Receita Bruta" value="R$ 142.5k" delta="12.4%" isPositive={true} icon={DollarSign} />
              <KPICard label="Lucro Bruto" value="R$ 48.7k" delta="8.2%" isPositive={true} icon={TrendingUp} />
              <KPICard label="Margem %" value="34.2%" delta="1.5%" isPositive={false} icon={Percent} />
              <KPICard label="Pedidos" value="1.234" delta="15.0%" isPositive={true} icon={ShoppingCart} />
              <KPICard label="Itens/Ped." value="4.8" delta="2.1%" isPositive={true} icon={Hash} />
           </div>

           {/* Main Comparative Chart */}
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                       <button 
                        onClick={() => setCockpitView('receita')}
                        className={`text-[10px] font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${cockpitView === 'receita' ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                       >
                          Receita
                       </button>
                       <button 
                        onClick={() => setCockpitView('lucro')}
                        className={`text-[10px] font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${cockpitView === 'lucro' ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                       >
                          Lucro
                       </button>
                    </div>
                    <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-widest">
                       <div className="flex items-center gap-2"><div className="w-3 h-1 bg-accent rounded-full" /> Período Atual</div>
                       <div className="flex items-center gap-2"><div className="w-3 h-1 border-t-2 border-dashed border-slate-600" /> Período Anterior</div>
                    </div>
                 </div>
                 <div className="h-80 w-full bg-dark-900/40 rounded-3xl border border-white/5 p-6 shadow-inner relative overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={COMPARATIVE_DATA}>
                          <defs>
                             <linearGradient id="colorCur" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00e0ff" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#00e0ff" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="day" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#080812', border: '1px solid #1e1e2d', borderRadius: '12px', fontSize: '10px' }}
                             itemStyle={{ fontWeight: 'bold' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey={cockpitView === 'receita' ? 'previous' : 'profitPrevious'} 
                            stroke="#475569" 
                            strokeDasharray="5 5" 
                            fill="transparent" 
                            strokeWidth={2} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey={cockpitView === 'receita' ? 'current' : 'profitCurrent'} 
                            stroke="#00e0ff" 
                            fill="url(#colorCur)" 
                            strokeWidth={3} 
                            activeDot={{ r: 6, fill: '#00e0ff', stroke: '#030308', strokeWidth: 3 }} 
                          />
                       </AreaChart>
                    </ResponsiveContainer>
                    <div className="border-animation absolute bottom-0 left-0 w-full"></div>
                 </div>
              </div>

              {/* Actionable Insights Panel */}
              <div className="flex flex-col gap-6">
                 <div className="p-6 bg-white/2 border border-white/5 rounded-3xl flex-1 flex flex-col justify-between">
                    <div>
                       <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                          <Activity size={14} className="text-accent" /> Como Interpretar
                       </h3>
                       <ul className="space-y-6">
                          <li className="flex gap-4">
                             <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1 shrink-0" />
                             <div>
                                <p className="text-[10px] font-bold text-slate-300 uppercase mb-1">Receita ↓ + Pedidos ↑</p>
                                <p className="text-[9px] text-slate-500 leading-relaxed font-medium">Anomalia detectada no mix de produtos ou excesso de descontos aplicados.</p>
                             </div>
                          </li>
                          <li className="flex gap-4">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                             <div>
                                <p className="text-[10px] font-bold text-slate-300 uppercase mb-1">Receita ↑ + Margem ↓</p>
                                <p className="text-[9px] text-slate-500 leading-relaxed font-medium">Crescimento insustentável. Verifique aumento nos custos de CMV ou precificação.</p>
                             </div>
                          </li>
                          <li className="flex gap-4">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 shrink-0" />
                             <div>
                                <p className="text-[10px] font-bold text-slate-300 uppercase mb-1">Pedidos ↓ + Itens/Ped ↓</p>
                                <p className="text-[9px] text-slate-500 leading-relaxed font-medium">Alerta de demanda/ruptura. Verifique disponibilidade de itens Curva A imediatamente.</p>
                             </div>
                          </li>
                       </ul>
                    </div>
                    <Button variant="ghost" className="w-full justify-between group mt-4">
                       <span className="text-[9px] font-bold tracking-widest uppercase">Ver diagnóstico detalhado</span>
                       <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      </Modal>

      {/* PERFORMANCE MODAL (MANTIDO PARA OUTROS RELATÓRIOS) */}
      <Modal 
        isOpen={activeReport === 'performance'} 
        onClose={() => setActiveReport(null)} 
        title="Intelligence Report: Fluxo de Receita" 
        size="2xl"
      >
        <div className="flex flex-col gap-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-900/60 p-4 rounded-2xl border border-white/5 shadow-inner">
                 <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Faturamento Bruto</p>
                 <h4 className="text-xl font-mono font-bold text-white">R$ 142.5k</h4>
              </div>
              <div className="bg-dark-900/60 p-4 rounded-2xl border border-white/5 shadow-inner">
                 <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Ticket Médio</p>
                 <h4 className="text-xl font-mono font-bold text-accent">R$ 115.40</h4>
              </div>
              <div className="bg-dark-900/60 p-4 rounded-2xl border border-white/5 shadow-inner">
                 <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Transações</p>
                 <h4 className="text-xl font-mono font-bold text-slate-300">1.234</h4>
              </div>
              <div className="bg-dark-900/60 p-4 rounded-2xl border border-white/5 shadow-inner">
                 <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Eficácia Meta</p>
                 <h4 className="text-xl font-mono font-bold text-emerald-400">92%</h4>
              </div>
           </div>

           <div className="glass-card rounded-3xl p-6 border-white/5 bg-dark-900/40 shadow-xl overflow-hidden relative">
              <div className="h-72 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={REVENUE_DETAILED_DATA}>
                       <defs>
                          <linearGradient id="revGrad" x1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                       <XAxis dataKey="hour" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <Tooltip 
                        contentStyle={{ backgroundColor: '#080812', border: '1px solid #1e1e2d', borderRadius: '12px', fontSize: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                       />
                       <Area type="monotone" dataKey="revenue" fill="url(#revGrad)" stroke="#10b981" strokeWidth={2} />
                       <Bar dataKey="transactions" fill="#00e0ff" radius={[4, 4, 0, 0]} barSize={20} />
                       <Line type="monotone" dataKey="avgTicket" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
              <div className="border-animation absolute bottom-0 left-0 w-full"></div>
           </div>
        </div>
      </Modal>

      {/* FILTER DRAWER */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
           <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
           <div className="relative w-full max-w-sm bg-dark-900 border-l border-white/5 h-full p-8 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
              <h2 className="text-lg font-bold text-white mb-8 flex items-center gap-2"><Settings size={20} className="text-accent"/> Parâmetros de Filtro</h2>
              <div className="flex-1 space-y-6">
                 <Input label="Janela de Amostragem" defaultValue={dateRange} className="bg-dark-950/50" />
                 <div className="p-4 bg-white/2 rounded-xl border border-white/5 space-y-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ativos em Foco</p>
                    <div className="space-y-2">
                       {CATEGORIES.slice(0, 5).map(cat => (
                          <div key={cat} className="flex items-center gap-2">
                             <input type="checkbox" className="accent-accent" defaultChecked />
                             <span className="text-xs text-slate-300">{cat}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
              <Button onClick={() => setIsFilterOpen(false)} className="mt-8 py-4 shadow-accent-glow">Atualizar Dashboards</Button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
