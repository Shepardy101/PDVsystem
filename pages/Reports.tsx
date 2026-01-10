
import { Button } from '@/components/UI';
import { Calendar, Download, Filter, Layers } from 'lucide-react';
import React, { useState, useMemo } from 'react';



const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState('Últimos 30 dias');


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

    
   
    </div>
  );
};

export default Reports;
