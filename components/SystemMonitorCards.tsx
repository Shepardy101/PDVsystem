import React, { useEffect, useState } from 'react';
import { Cpu, Activity, MemoryStick } from 'lucide-react';
import { useBrowserPerformance } from '@/hooks/useBrowserPerformance';

const neonBar = (percent: number, color: string) => (
  <div className="w-full h-3 bg-dark-900/60 rounded-xl overflow-hidden relative">
    <div
      className="h-full rounded-xl transition-all duration-700"
      style={{
        width: percent + '%',
        background: `linear-gradient(90deg,${color},#fff0 80%)`,
        boxShadow: `0 0 16px 2px ${color}55, 0 0 2px 1px ${color}99 inset`
      }}
    />
  </div>
);

function formatGB(val: number) {
  return val >= 1 ? val.toFixed(1) + ' GB' : (val * 1024).toFixed(0) + ' MB';
}

export const SystemMonitorCards: React.FC = () => {
  const [serverCpu, setServerCpu] = useState(0);
  const [serverMem, setServerMem] = useState({ used: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const browser = useBrowserPerformance(3000);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      const [cpuRes, memRes] = await Promise.all([
        fetch('/api/sys/cpu').then(r => r.json()),
        fetch('/api/sys/mem').then(r => r.json())
      ]);
      if (mounted) {
        setServerCpu(cpuRes.cpu);
        setServerMem(memRes);
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {/* CPU Servidor */}
      <div className="rounded-2xl bg-dark-950/80 border border-cyan-400/20 shadow-[0_0_32px_#22d3ee33] p-6 flex flex-col items-center animate-in fade-in duration-700">
        <div className="flex items-center gap-3 mb-2">
          <Cpu className="text-cyan-400 animate-pulse" size={28} />
          <span className="text-cyan-300 text-xs font-bold uppercase tracking-widest">CPU Servidor</span>
        </div>
        <div className="text-4xl font-extrabold text-cyan-200 drop-shadow-neon-cyan animate-pulse-slow">{serverCpu}%</div>
        <div className="w-full mt-3">{neonBar(serverCpu, '#22d3ee')}</div>
      </div>
      {/* RAM Servidor */}
      <div className="rounded-2xl bg-dark-950/80 border border-violet-400/20 shadow-[0_0_32px_#a855f733] p-6 flex flex-col items-center animate-in fade-in duration-700">
        <div className="flex items-center gap-3 mb-2">
          <MemoryStick className="text-violet-400 animate-pulse" size={28} />
          <span className="text-violet-300 text-xs font-bold uppercase tracking-widest">RAM Servidor</span>
        </div>
        <div className="text-2xl font-extrabold text-violet-200 drop-shadow-neon-violet animate-pulse-slow">
          {formatGB(serverMem.used)} <span className="text-violet-400 text-lg font-bold">/ {formatGB(serverMem.total)}</span>
        </div>
        <div className="w-full mt-3">{neonBar(serverMem.total ? (serverMem.used / serverMem.total) * 100 : 0, '#a855f7')}</div>
      </div>
      {/* Navegador */}
      <div className="rounded-2xl bg-dark-950/80 border border-cyan-400/20 shadow-[0_0_32px_#22d3ee33] p-6 flex flex-col items-center animate-in fade-in duration-700">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="text-cyan-400 animate-pulse" size={28} />
          <span className="text-cyan-300 text-xs font-bold uppercase tracking-widest">Navegador</span>
        </div>
        {browser.supported ? (
          <>
            <div className="text-2xl font-extrabold text-cyan-200 drop-shadow-neon-cyan animate-pulse-slow">
              RAM: {formatGB(browser.jsHeapUsed)} <span className="text-cyan-400 text-lg font-bold">/ {formatGB(browser.jsHeapTotal)}</span>
            </div>
            <div className="w-full mt-2 mb-2">{neonBar(browser.jsHeapTotal ? (browser.jsHeapUsed / browser.jsHeapTotal) * 100 : 0, '#22d3ee')}</div>
            <div className="text-lg font-bold text-cyan-300 mt-2 animate-pulse">CPU: {browser.cpu}%</div>
            <div className="w-full mt-2">{neonBar(browser.cpu, '#22d3ee')}</div>
          </>
        ) : (
          <div className="text-slate-400 text-sm mt-4">Performance.memory não suportado neste navegador.</div>
        )}
      </div>
    </div>
  );
};

export default SystemMonitorCards;
