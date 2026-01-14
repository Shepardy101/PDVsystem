import React, { useEffect, useMemo, useState } from 'react';
import { X, Cpu, MemoryStick, Activity, AlertTriangle, Server, Gauge } from 'lucide-react';
import { useBrowserPerformance } from '@/hooks/useBrowserPerformance';
import { Button } from '../UI';

type Props = { open: boolean; onClose: () => void };

type ServerMem = { used: number; total: number };

type BarProps = { percent: number; color: string };

const Bar: React.FC<BarProps> = ({ percent, color }) => (
  <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
    <div
      className="h-full rounded-full transition-all duration-500"
      style={{
        width: `${Math.min(100, Math.max(0, percent))}%`,
        background: `linear-gradient(90deg, ${color}cc, ${color}88 60%, transparent 100%)`,
        boxShadow: `0 0 12px ${color}33`,
      }}
    />
  </div>
);

function formatBytes(bytes: number) {
  if (!bytes || Number.isNaN(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
}

function formatGB(bytes: number) {
  if (!bytes || Number.isNaN(bytes)) return '0 GB';
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

const PerformanceMetricsModal: React.FC<Props> = ({ open, onClose }) => {
  const [serverCpu, setServerCpu] = useState(0);
  const [serverMem, setServerMem] = useState<ServerMem>({ used: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const browser = useBrowserPerformance(3000);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const [cpuRes, memRes] = await Promise.all([
          fetch('/api/sys/cpu').then(r => r.json()),
          fetch('/api/sys/mem').then(r => r.json()),
        ]);
        if (!mounted) return;
        setServerCpu(Number(cpuRes?.cpu ?? 0));
        setServerMem({ used: Number(memRes?.used ?? 0), total: Number(memRes?.total ?? 0) });
        setLoading(false);
      } catch (e) {
        if (!mounted) return;
        setError('Falha ao coletar métricas do servidor');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const serverMemPct = useMemo(() => {
    if (!serverMem.total) return 0;
    return (serverMem.used / serverMem.total) * 100;
  }, [serverMem]);

  const browserMemPct = useMemo(() => {
    if (!browser.jsHeapTotal) return 0;
    return (browser.jsHeapUsed / browser.jsHeapTotal) * 100;
  }, [browser.jsHeapTotal, browser.jsHeapUsed]);

  const alerts = useMemo(() => {
    const list: string[] = [];
    if (serverCpu >= 85) list.push('CPU do servidor acima de 85%');
    if (serverMemPct >= 85) list.push('RAM do servidor acima de 85%');
    if (browser.supported && browserMemPct >= 70) list.push('Heap do navegador acima de 70%');
    if (browser.cpu >= 80) list.push('CPU do navegador acima de 80%');
    if (!list.length) list.push('Nenhuma sobrecarga detectada agora.');
    return list;
  }, [serverCpu, serverMemPct, browserMemPct, browser.supported, browser.cpu]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl bg-[#040a12] border border-accent/25 rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.08),transparent_45%)]" />
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-accent flex items-center gap-2">
              <Gauge size={14} className="text-accent" /> Performance Radar
            </p>
            <p className="text-[11px] text-slate-400 font-mono">Monitor de sobrecarga (CPU, RAM e heap do navegador)</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-accent transition-colors p-2 rounded-lg border border-white/10">
            <X size={16} />
          </button>
        </div>

        <div className="relative p-6 space-y-6">
          {error ? (
            <div className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">{error}</div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200 text-xs uppercase tracking-[0.3em]">
                  <Cpu size={16} className="text-accent" /> CPU Servidor
                </div>
                <span className="text-sm font-mono text-accent">{Math.round(serverCpu)}%</span>
              </div>
              <Bar percent={serverCpu} color="#22d3ee" />
              <p className="text-[11px] text-slate-400">Coletado de /api/sys/cpu (média ~3-4s)</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200 text-xs uppercase tracking-[0.3em]">
                  <MemoryStick size={16} className="text-violet-300" /> RAM Servidor
                </div>
                <span className="text-sm font-mono text-violet-200">{serverMemPct.toFixed(0)}%</span>
              </div>
              <Bar percent={serverMemPct} color="#a855f7" />
              <p className="text-[11px] text-slate-300 font-mono">{formatGB(serverMem.used)} / {formatGB(serverMem.total)}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200 text-xs uppercase tracking-[0.3em]">
                  <Activity size={16} className="text-emerald-300" /> Navegador
                </div>
                <span className="text-sm font-mono text-emerald-200">{browser.supported ? `${browserMemPct.toFixed(0)}%` : 'Sem suporte'}</span>
              </div>
              <Bar percent={browser.supported ? browserMemPct : 0} color="#22d3ee" />
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>{browser.supported ? `${formatBytes(browser.jsHeapUsed)} / ${formatBytes(browser.jsHeapTotal)} (heap JS)` : 'performance.memory indisponível'}</span>
                <span className="font-mono text-slate-200">CPU ~{browser.cpu}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-300">
                <AlertTriangle size={14} className="text-amber-300" /> Alertas rápidos
              </div>
              <ul className="space-y-2 text-sm text-slate-200">
                {alerts.map((msg, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-[12px] text-slate-300">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-300">
                <Server size={14} className="text-accent" /> Fontes de coleta
              </div>
              <p>/api/sys/cpu: uso médio do servidor (ajuda a encontrar gargalos ou processos pesados)</p>
              <p>/api/sys/mem: RAM usada/total do servidor (risco de swap quando acima de 85%)</p>
              <p>performance.memory + event loop: heap JS e CPU estimada do navegador (abas pesadas, vazamentos)</p>
              <p>Atualização automática a cada 4s enquanto o modal estiver aberto.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetricsModal;
