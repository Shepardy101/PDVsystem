
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../components/AuthContext';
import { isAdmin } from '../types';
import DbManager from '../src/renderer/components/adminDb/DbManager';
import { toast } from 'react-hot-toast';
import { 
   Settings as SettingsIcon, Shield, Cpu, Printer, Database, Globe, 
   Lock, RefreshCcw, Bell, HardDrive, Wifi, Terminal, Zap, 
   Activity, Cloud, Save, Trash2, Key, Server, Laptop, Bluetooth,
   CreditCard, Clock, ChevronDown, ChevronRight
} from 'lucide-react';
import { Button, Card, Input, Switch, Badge } from '../components/UI';
import AccessDenied from '@/components/AccessDenied';
import PerformanceMetricsModal from '../components/modals/PerformanceMetricsModal';
import { logUiEvent } from '../services/telemetry';

// Reusable small detail row for the IP detail modal
const DetailRow = ({ label, value }: { label: string; value: string }) => (
   <div className="bg-black/30 border border-white/5 rounded-lg px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{label}</div>
      <div className="text-[12px] text-slate-200 break-words leading-tight">{value || '-'}</div>
   </div>
);

// --- Painel de Controle de IPs ---
type IpEntry = {
   id: number;
   ip: string;
   hostname?: string|null;
   tentado_em?: string;
   autorizado_em?: string;
   autorizado_por?: string|null;
   user_agent?: string|null;
   requested_path?: string|null;
   request_method?: string|null;
   referer?: string|null;
   accept_language?: string|null;
   accept_header?: string|null;
   accept_encoding?: string|null;
   forwarded_for_raw?: string|null;
   remote_port?: number|null;
   http_version?: string|null;
};
type IPControlPanelProps = { canManage: boolean; telemetry: (area: string, action: string, meta?: Record<string, any>) => void };

type UiLog = {
   id: string;
   message: string;
   level: 'info' | 'warn' | 'error';
   createdAt: number;
   time: string;
   context?: any;
};

const IPControlPanel: React.FC<IPControlPanelProps> = ({ canManage, telemetry }) => {
   const [pending, setPending] = useState<IpEntry[]>([]);
   const [allowed, setAllowed] = useState<IpEntry[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string|null>(null);
   const [blocked, setBlocked] = useState<IpEntry[]>([]);
   const [refresh, setRefresh] = useState(0);
   const [selectedIp, setSelectedIp] = useState<{ entry: IpEntry; list: 'pending' | 'allowed' | 'blocked' } | null>(null);

   useEffect(() => {
      let isMounted = true;
      setLoading(true);
      setError(null);
      const safeFetch = async (url: string) => {
         const res = await fetch(url);
         if (!res.ok) throw new Error(`Erro ao buscar ${url}`);
         return res.json();
      };
      Promise.all([
         safeFetch('/api/admin/ip-control/pending'),
         safeFetch('/api/admin/ip-control/allowed'),
         safeFetch('/api/admin/ip-control/blocked').catch(() => [])
      ]).then(([pendingResp, allowedResp, blockedResp]) => {
         if (!isMounted) return;
         setPending(pendingResp);
         setAllowed(allowedResp);
         setBlocked(blockedResp || []);
      }).catch(e => {
         if (!isMounted) return;
         setError('Erro ao carregar IPs');
      }).finally(() => {
         if (!isMounted) return;
         setLoading(false);
      });
      return () => { isMounted = false; };
   }, [refresh]);

   const handleAllow = async (ip: string, hostname?: string|null) => {
      if (!canManage) return;
      setLoading(true);
      try {
         const res = await fetch('/api/admin/ip-control/allow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip, hostname, autorizado_por: 'admin' })
         });
         if (!res.ok) throw new Error('Erro ao autorizar');
         telemetry('ip-control', 'allow-ip', { ip, hostname });
         setRefresh(r => r + 1);
      } catch (e) {
         setError('Falha ao autorizar IP');
      } finally {
         setLoading(false);
      }
   };
   const handleDeny = async (ip: string) => {
      if (!canManage) return;
      setLoading(true);
      try {
         const res = await fetch('/api/admin/ip-control/deny', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip })
         });
         if (!res.ok) throw new Error('Erro ao negar');
         telemetry('ip-control', 'deny-ip', { ip });
         setRefresh(r => r + 1);
      } catch (e) {
         setError('Falha ao negar IP');
      } finally {
         setLoading(false);
      }
   };
   const handleRemove = async (ip: string) => {
      if (!canManage) return;
      setLoading(true);
      try {
         const res = await fetch('/api/admin/ip-control/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip })
         });
         if (!res.ok) throw new Error('Erro ao remover');
         telemetry('ip-control', 'remove-ip', { ip });
         setRefresh(r => r + 1);
      } catch (e) {
         setError('Falha ao remover IP');
      } finally {
         setLoading(false);
      }
   };
   const openDetails = (entry: IpEntry, list: 'pending' | 'allowed' | 'blocked') => {
      telemetry('ip-control', 'open-details', { ip: entry.ip, list });
      setSelectedIp({ entry, list });
   };
   const closeDetails = () => {
      if (selectedIp) telemetry('ip-control', 'close-details', { ip: selectedIp.entry.ip, list: selectedIp.list });
      setSelectedIp(null);
   };

   return (
      <div className="mt-8 rounded-3xl overflow-hidden border border-accent/20 bg-gradient-to-br from-[#06121a] via-[#061b24] to-[#03090f] shadow-[0_0_35px_-18px_rgba(34,211,238,0.9)]">
         <div className="flex items-center justify-between px-6 py-4 border-b border-accent/20 bg-black/30">
            <div className="flex items-center gap-3">
               <div className="h-8 w-1 bg-accent shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
               <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500 flex items-center gap-2">
                     <Globe size={14} className="text-accent" /> Firewall Sentinel
                  </p>
                  <p className="text-[11px] text-slate-300 font-mono">Controle e bloqueio de dispositivos</p>
               </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-end">
               <span className="text-[10px] font-mono text-amber-200 bg-amber-500/10 border border-amber-400/40 px-3 py-1 rounded-full uppercase">Pending {pending.length}</span>
               <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-400/40 px-3 py-1 rounded-full uppercase">Allowed {allowed.length}</span>
               <span className="text-[10px] font-mono text-rose-200 bg-rose-500/10 border border-rose-400/40 px-3 py-1 rounded-full uppercase">Blocked {blocked.length}</span>
               <Button size="sm" variant="secondary" disabled={loading} onClick={() => { telemetry('ip-control', 'sync'); setRefresh(r => r + 1); }} icon={<RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />}>Sync</Button>
            </div>
         </div>

         {error && <div className="px-6 py-2 text-red-400 text-xs bg-red-900/20 border-b border-red-500/30">{error}</div>}
         {loading && !error && (
            <div className="px-6 py-2 text-[10px] font-mono text-accent bg-accent/5 border-b border-accent/20 flex items-center gap-2">
               <RefreshCcw size={14} className="animate-spin" /> sincronizando listas...
            </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-accent/10">
            <div className="p-6 min-h-[340px] bg-black/20">
               <div className="flex items-center justify-between mb-3">
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400 flex items-center gap-2">
                        <Zap size={14} className="text-amber-400" /> Queue // Pending
                     </p>
                     <p className="text-[11px] text-slate-500 font-mono">Aguardando autorização</p>
                  </div>
                  <Badge variant="secondary">{pending.length} itens</Badge>
               </div>
               <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar-thin">
                  {pending.length === 0 && <div className="text-slate-600 text-xs font-mono bg-dark-950/60 border border-white/5 rounded-xl px-3 py-2">Nenhum IP pendente.</div>}
                  {pending.map(ip => (
                     <div
                        key={ip.id}
                        className="bg-[#0b1924] border border-accent/20 rounded-xl px-4 py-3 flex flex-col gap-2 shadow-[0_0_12px_-6px_rgba(34,211,238,0.7)] cursor-pointer hover:border-accent/40"
                        onClick={() => openDetails(ip, 'pending')}
                     >
                        <div className="flex items-center justify-between">
                           <div className="font-mono text-xs md:text-sm text-accent">{ip.ip}</div>
                           <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-400/30 text-amber-200 text-[9px] md:text-[10px] font-mono">Pendente</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] md:text-[11px] text-slate-300 font-mono">
                           <span>{ip.hostname ? `host:${ip.hostname}` : 'host:desconhecido'}</span>
                           <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                              <Button size="xs" variant="success" disabled={loading || !canManage} onClick={() => handleAllow(ip.ip, ip.hostname)}>allow</Button>
                              <Button size="xs" variant="danger" disabled={loading || !canManage} onClick={() => handleDeny(ip.ip)}>deny</Button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="p-6 min-h-[340px] bg-black/10">
               <div className="flex items-center justify-between mb-3">
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300 flex items-center gap-2">
                        <Shield size={14} className="text-emerald-300" /> Allowlist // Trusted
                     </p>
                     <p className="text-[11px] text-slate-500 font-mono">IPs já autorizados</p>
                  </div>
                  <Badge variant="success">{allowed.length} ativos</Badge>
               </div>
               <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar-thin">
                  {allowed.length === 0 && <div className="text-slate-600 text-xs font-mono bg-dark-950/60 border border-white/5 rounded-xl px-3 py-2">Nenhum IP autorizado.</div>}
                  {allowed.map(ip => (
                     <div
                        key={ip.id}
                        className="bg-[#0b1f1a] border border-emerald-400/20 rounded-xl px-4 py-3 flex flex-col gap-2 shadow-[0_0_12px_-6px_rgba(16,185,129,0.7)] cursor-pointer hover:border-emerald-300/40"
                        onClick={() => openDetails(ip, 'allowed')}
                     >
                        <div className="flex items-center justify-between">
                           <div className="font-mono text-xs md:text-sm text-emerald-200">{ip.ip}</div>
                           <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-[9px] md:text-[10px] font-mono">Allow</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] md:text-[11px] text-slate-300 font-mono">
                           <span>{ip.hostname ? `host:${ip.hostname}` : 'host:desconhecido'}</span>
                           <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                              <Button size="xs" variant="danger" disabled={loading || !canManage} onClick={() => handleRemove(ip.ip)}>remove</Button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="p-6 min-h-[340px] bg-black/20">
               <div className="flex items-center justify-between mb-3">
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-300 flex items-center gap-2">
                        <Shield size={14} className="text-rose-300" /> Blocklist // Deny
                     </p>
                     <p className="text-[11px] text-slate-500 font-mono">IPs bloqueados</p>
                  </div>
                  <Badge variant="danger">{blocked.length} bloqueados</Badge>
               </div>
               <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar-thin">
                  {blocked.length === 0 && <div className="text-slate-600 text-xs font-mono bg-dark-950/60 border border-white/5 rounded-xl px-3 py-2">Nenhum IP bloqueado.</div>}
                  {blocked.map(ip => (
                     <div
                        key={ip.id}
                        className="bg-[#1f0b12] border border-rose-400/25 rounded-xl px-4 py-3 flex flex-col gap-2 shadow-[0_0_12px_-6px_rgba(244,63,94,0.7)] cursor-pointer hover:border-rose-300/40"
                        onClick={() => openDetails(ip, 'blocked')}
                     >
                        <div className="flex items-center justify-between">
                           <div className="font-mono text-xs md:text-sm text-rose-200">{ip.ip}</div>
                           <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-400/30 text-rose-200 text-[9px] md:text-[10px] font-mono">Blocked</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] md:text-[11px] text-slate-300 font-mono">
                           <span>{ip.hostname ? `host:${ip.hostname}` : 'host:desconhecido'}</span>
                           <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                              <Button size="xs" variant="success" disabled={loading || !canManage} onClick={() => handleAllow(ip.ip, ip.hostname)}>allow</Button>
                              <Button size="xs" variant="danger" disabled={loading || !canManage} onClick={() => handleRemove(ip.ip)}>remove</Button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {selectedIp && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4" onClick={closeDetails}>
               <div className="bg-dark-950 border border-accent/30 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/60">
                     <div className="flex items-center gap-2">
                        <Badge variant={selectedIp.list === 'pending' ? 'secondary' : selectedIp.list === 'allowed' ? 'success' : 'danger'} className="uppercase text-[10px] tracking-[0.3em]">
                           {selectedIp.list}
                        </Badge>
                        <span className="font-mono text-sm text-white">{selectedIp.entry.ip}</span>
                     </div>
                     <Button size="sm" variant="secondary" onClick={closeDetails}>Fechar</Button>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px] text-slate-200 font-mono overflow-y-auto max-h-[75vh]">
                     <DetailRow label="Hostname" value={selectedIp.entry.hostname || '-'} />
                     <DetailRow label="Tentado em" value={selectedIp.entry.tentado_em?.replace('T',' ').slice(0,19) || '-'} />
                     <DetailRow label="Autorizado em" value={selectedIp.entry.autorizado_em?.replace('T',' ').slice(0,19) || '-'} />
                     <DetailRow label="Autorizado por" value={selectedIp.entry.autorizado_por || '-'} />
                     <DetailRow label="User-Agent" value={selectedIp.entry.user_agent || '-'} />
                     <DetailRow label="Accept-Language" value={selectedIp.entry.accept_language || '-'} />
                     <DetailRow label="Accept" value={selectedIp.entry.accept_header || '-'} />
                     <DetailRow label="Accept-Encoding" value={selectedIp.entry.accept_encoding || '-'} />
                     <DetailRow label="Rota" value={selectedIp.entry.requested_path || '-'} />
                     <DetailRow label="Método" value={selectedIp.entry.request_method || '-'} />
                     <DetailRow label="Referer" value={selectedIp.entry.referer || '-'} />
                     <DetailRow label="X-Forwarded-For" value={selectedIp.entry.forwarded_for_raw || '-'} />
                     <DetailRow label="Porta Remota" value={selectedIp.entry.remote_port?.toString() || '-'} />
                     <DetailRow label="HTTP" value={selectedIp.entry.http_version || '-'} />
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

const Settings: React.FC = () => {
   const { user } = useAuth();
   const sendTelemetry = React.useCallback((area: string, action: string, meta?: Record<string, any>) => {
      logUiEvent({ userId: user?.id ?? null, page: 'settings', area, action, meta });
   }, [user?.id]);
   if (!user || (!isAdmin(user) && user.role !== 'manager')) {
      return (
         <AccessDenied />
      );
      }
   const [logs, setLogs] = useState<UiLog[]>([]);
   const [logLimit, setLogLimit] = useState<30 | 100 | 1000 | 'all'>(30);
   const [showDbManager, setShowDbManager] = useState(false);
   const [showPerformanceModal, setShowPerformanceModal] = useState(false);
   const [showLogsModal, setShowLogsModal] = useState(false);
   const [showPerfDetails, setShowPerfDetails] = useState(false);
   const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());
   const [allowNegativeStock, setAllowNegativeStock] = useState<boolean>(true);
   const [settingsLoading, setSettingsLoading] = useState(false);
   const isManagerUser = user?.role === 'manager';

   const interactionCounts = useMemo(() => {
      const acc: Record<string, number> = {};
      logs.forEach(log => {
         const ctxArea = log?.context?.area;
         const ctxAction = log?.context?.action;
         let key = (ctxArea && ctxAction) ? `${ctxArea}/${ctxAction}` : undefined;
         if (!key) {
            const match = log.message.match(/\[(.*?)\]\s+([^/]+)\/([^:\s]+)/);
            if (match && match[2] && match[3]) {
               key = `${match[2]}/${match[3]}`;
            }
         }
         if (!key) {
            key = log.message || 'sem-mensagem';
         }
         acc[key] = (acc[key] || 0) + 1;
      });
      return Object.entries(acc)
         .map(([key, count]) => ({ key, count }))
         .sort((a, b) => b.count - a.count);
   }, [logs]);

   const perfSamples = useMemo(() => {
      const items = logs
         .filter((log) => (log.message || '').toLowerCase().includes('performance server'))
         .map((log) => {
            const ctx: any = log.context || {};
            const cpu = Number(ctx.cpuPct ?? ctx.cpu ?? 0);
            const mem = Number(ctx.osMemUsedMb ?? ctx.rssMb ?? ctx.heapUsedMb ?? 0);
            const loop = Number(ctx.eventLoopDelayP95Ms ?? ctx.eventLoopDelayMaxMs ?? 0);
            return {
               t: log.createdAt,
               cpu: Number.isFinite(cpu) ? cpu : 0,
               mem: Number.isFinite(mem) ? mem : 0,
               loop: Number.isFinite(loop) ? loop : 0,
            };
         })
         .filter((s) => s.t && (s.cpu || s.mem || s.loop))
         .sort((a, b) => a.t - b.t);
      return items.slice(-24); // últimas leituras
   }, [logs]);

   const perfStats = useMemo(() => {
      if (!perfSamples.length) return null;
      const pickStats = (key: 'cpu' | 'mem' | 'loop') => {
         const vals = perfSamples.map((p) => p[key]).filter((v) => Number.isFinite(v));
         const last = vals[vals.length - 1] ?? 0;
         return {
            last,
            min: Math.min(...vals),
            max: Math.max(...vals),
         };
      };
      return {
         cpu: pickStats('cpu'),
         mem: pickStats('mem'),
         loop: pickStats('loop'),
      };
   }, [perfSamples]);

   const Sparkline = ({ values, color = '#22d3ee' }: { values: number[]; color?: string }) => {
      const width = 120;
      const height = 36;
      const safeValues = values.length ? values : [0];
      const max = Math.max(...safeValues, 1);
      const points = safeValues.map((v, i) => {
         const x = (i / Math.max(1, safeValues.length - 1)) * width;
         const y = height - (v / max) * height;
         return `${x},${y}`;
      }).join(' ');
      return (
         <svg width={width} height={height} className="opacity-90">
            <polyline
               fill="none"
               stroke={color}
               strokeWidth="2"
               strokeLinejoin="round"
               strokeLinecap="round"
               points={points}
            />
         </svg>
      );
   };

   React.useEffect(() => {
      sendTelemetry('page', 'view');
   }, [sendTelemetry]);
  
   // Polling simples do audit log real
   useEffect(() => {
      let active = true;
      const fetchLogs = async () => {
         try {
            const query = logLimit === 'all' ? '' : `?limit=${logLimit}`;
            const res = await fetch(`/api/logs${query}`);
            if (!res.ok) return;
            const data = await res.json();
            if (!active || !Array.isArray(data?.logs)) return;
            const mapped = data.logs.map((log: any) => {
               const createdAt = Number(log?.created_at || Date.now());
               let context: any = undefined;
               if (log?.context_json) {
                  try {
                     context = JSON.parse(log.context_json);
                  } catch (err) {
                     context = log.context_json;
                  }
               }
               return {
                  id: String(log?.id ?? createdAt),
                  message: log?.message ?? 'Evento sem mensagem',
                  level: (log?.level === 'warn' || log?.level === 'error') ? log.level : 'info',
                  createdAt,
                  time: new Date(createdAt).toLocaleTimeString('pt-BR', { hour12: false }),
                  context,
               } as UiLog;
            });
            setLogs(mapped);
         } catch (err) {
            console.error('[AuditTrail] Falha ao buscar logs:', err);
         }
      };

      fetchLogs();
      const interval = setInterval(fetchLogs, 5000);
      return () => {
         active = false;
         clearInterval(interval);
      };
   }, [logLimit]);

   const openLogsModal = () => {
      setShowLogsModal(true);
   };

   const closeLogsModal = () => {
      setShowLogsModal(false);
      setExpandedLogIds(new Set());
   };

   const toggleLogRow = (id: string) => {
      setExpandedLogIds(prev => {
         const next = new Set(prev);
         if (next.has(id)) {
            next.delete(id);
         } else {
            next.add(id);
         }
         return next;
      });
   };

   const handleClearLogs = () => setLogs([]);
   
         const handlePurgeCache = async () => {
            sendTelemetry('maintenance', 'purge-cache');
         try {
            const res = await fetch('/api/admin/maintenance/purge-cache', { method: 'POST' });
            if (!res.ok) throw new Error('Erro HTTP');
            const data = await res.json();
            toast.success(`Cache limpo (${data.logsDeleted ?? 0} logs, ${data.pendingDeleted ?? 0} pendentes)`);
            setLogs([]);
         } catch (err) {
            console.error('[Settings] Falha ao purgar cache:', err);
            toast.error('Falha ao limpar cache');
         }
      };

      const handleWipeLocal = async () => {
         if (!isManagerUser) {
            toast.error('Apenas usuários manager podem limpar a base.');
            return;
         }
         const confirmPrompt = window.prompt('Digite "wipe" para confirmar a limpeza total e recriar o usuário root.');
         if ((confirmPrompt || '').toLowerCase().trim() !== 'wipe') {
            toast('Limpeza cancelada');
            return;
         }
         sendTelemetry('maintenance', 'wipe-local');
         try {
            const res = await fetch('/api/admin/maintenance/wipe-local', { method: 'POST' });
            if (!res.ok) throw new Error('Erro HTTP');
            await res.json();
            toast.success('Base limpa e usuário root recriado');
            setLogs([]);
         } catch (err) {
            console.error('[Settings] Falha ao limpar base:', err);
            toast.error('Falha ao limpar base');
         }
      };

   // Carrega configuração Enable_Negative_Casher
   useEffect(() => {
      setSettingsLoading(true);
      fetch('/api/settings/Enable_Negative_Casher')
         .then(r => r.ok ? r.json() : { value: 'true' })
         .then(data => {
            const v = (data?.value ?? 'true') === 'true';
            setAllowNegativeStock(v);
         })
         .catch(() => setAllowNegativeStock(true))
         .finally(() => setSettingsLoading(false));
   }, []);

   const toggleNegativeStock = async (value: boolean) => {
      sendTelemetry('inventory', 'toggle-allow-negative', { value });
      setAllowNegativeStock(value);
      try {
         const res = await fetch('/api/settings/Enable_Negative_Casher', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: value ? 'true' : 'false' })
         });
         if (!res.ok) throw new Error('Falha ao salvar');
         toast.success(value ? 'Permitir estoque negativo ativado' : 'Bloqueio de estoque negativo ativado');
      } catch (err) {
         toast.error('Erro ao salvar configuração');
         setAllowNegativeStock(!value); // reverte se falhar
      }
   };

  const TelemetryItem = ({ icon: Icon, label, value, status }: any) => (
    <div className="p-4 bg-dark-900/40 border border-white/5 rounded-2xl space-y-3 relative overflow-hidden group">
       <div className="flex items-center justify-between relative z-10">
          <div className="p-2 bg-dark-950 rounded-lg text-slate-500 group-hover:text-accent transition-colors">
             <Icon size={16} />
          </div>
          <Badge variant={status === 'ok' ? 'success' : 'warning'}>{status}</Badge>
       </div>
       <div className="relative z-10">
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{label}</p>
          <p className="text-xl font-mono font-bold text-white tracking-tighter">{value}</p>
       </div>
       <div className="absolute bottom-0 left-0 h-0.5 bg-accent/20 w-0 group-hover:w-full transition-all duration-500" />
    </div>
  );

   return (
      <div className="p-8 flex flex-col min-h-screen overflow-auto assemble-view bg-dark-950 bg-cyber-grid relative">
         
         {/* Modal DB Manager */}
         {showDbManager && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center animate-in fade-in">
               <div className="relative w-full h-full max-w-7xl max-h-[98vh] bg-dark-950 rounded-3xl shadow-2xl border border-accent/30 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-white/10 bg-dark-950/80">
                     <h2 className="text-lg font-bold text-accent flex items-center gap-2">
                        <span className="bg-accent/10 rounded-lg p-1"><Database size={18} /></span>
                        Gerenciador de Banco de Dados
                     </h2>
                     <button onClick={() => setShowDbManager(false)} className="text-slate-400 hover:text-accent transition-colors text-xs font-bold px-3 py-1 rounded-lg border border-white/10">Fechar</button>
                  </div>
                  <div className="flex-1 min-h-0">
                     <DbManager />
                  </div>
               </div>
            </div>
         )}
         {showPerformanceModal && (
            <PerformanceMetricsModal open={showPerformanceModal} onClose={() => setShowPerformanceModal(false)} />
         )}
      {/* Header Estilo Mission Control */}
      <div className="flex items-center justify-between shrink-0 mb-8 relative z-10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
             <SettingsIcon className="text-accent" /> Mission Control // Painel de Controle
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
             Configurações de Baixo Nível e Auditoria do Kernel v3.1
          </p>
        </div>
            <div className="flex items-center gap-4">
               <Button variant="secondary" icon={<Database size={18} />} disabled={!isManagerUser} onClick={() => { if (isManagerUser) { sendTelemetry('settings', 'open-db-manager'); setShowDbManager(true); } }}>
                  DB Manager
               </Button>
           <div className="flex items-center gap-2 px-4 py-2 bg-dark-900/60 border border-white/5 rounded-full backdrop-blur-md">
              <Server size={14} className="text-accent" />
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Instance: US-EAST-01</span>
           </div>
           <Button icon={<RefreshCcw size={18} />} disabled={!isManagerUser} onClick={() => { sendTelemetry('settings', 'reload-kernel'); window.location.reload(); }}>Reiniciar Kernel</Button>
        </div>
      </div>


    

      <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden min-h-0 relative z-10">
        {/* Coluna Esquerda: Configurações */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar min-h-0 h-full max-h-[calc(100vh-220px)]">
        
        
      <div className="mt-0 rounded-3xl overflow-hidden border border-accent/20 bg-gradient-to-br from-[#06121a] via-[#061b24] to-[#03090f] shadow-[0_0_35px_-18px_rgba(34,211,238,0.9)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-accent/20 bg-black/30">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-accent shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
            <div>
         <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500 flex items-center gap-2">
           <Zap size={14} className="text-accent" /> Estoque no Caixa
         </p>
         <p className="text-[11px] text-slate-300 font-mono">Permitir vender acima do estoque?</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-dark-900/60 border border-accent/30 rounded-2xl px-4 py-2 shadow-[0_0_18px_-8px_rgba(34,211,238,0.9)]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
         {allowNegativeStock ? 'Habilitado' : 'Bloqueado'}
            </span>
            <Switch
         enabled={allowNegativeStock}
         disabled={settingsLoading}
         onChange={(value: boolean) => toggleNegativeStock(value)}
            />
          </div>
        </div>
        <div className="p-6 bg-black/10">
          <p className="text-[10px] text-slate-500 uppercase tracking-tight max-w-xl font-mono">
            Quando desativado, o PDV bloqueia quantidades que excedam o estoque disponível no ato da venda.
          </p>
        </div>
      </div>
           {/* Seção de Controle de IPs */}
           <IPControlPanel canManage={isManagerUser} telemetry={sendTelemetry} />

           {/* Seção de Segurança */}
           {/* <div className="glass-panel rounded-3xl p-8 border-white/5 space-y-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                 <Shield size={14} className="text-accent" /> Protocolos de Segurança
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <Input label="Nível de Criptografia" defaultValue="AES-256-GCM" icon={<Lock size={14} />} disabled />
                    <Input label="Intervalo de Auto-Logout (Segundos)" defaultValue="3600" type="number" icon={<Clock size={14} />} />
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-dark-950/50 rounded-2xl border border-white/5">
                       <div>
                          <p className="text-xs font-bold text-slate-200">Backups Automáticos</p>
                          <p className="text-[9px] text-slate-500 uppercase">A cada 12 horas</p>
                       </div>
                       <Switch enabled={true} onChange={() => {}} />
                    </div>
                    <Button variant="secondary" className="w-full py-3" icon={<Cloud size={16} />}>Configurar Cloud Sync</Button>
                 </div>
              </div>
           </div> */}
        </div>

        {/* Coluna Direita: Logs Técnicos */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-hidden">
           <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2 ml-2">
              <Terminal size={14} className="text-accent" /> Audit Trail // Real-time
           </h3>
         <div className="flex-1 bg-[#050b11] border border-accent/30 rounded-3xl p-6 font-mono overflow-hidden flex flex-col shadow-[0_0_25px_-12px_rgba(34,211,238,0.9)] relative cursor-pointer" role="button" onClick={openLogsModal}>
            <div className="absolute inset-0 pointer-events-none opacity-40 bg-gradient-to-br from-accent/10 via-transparent to-purple-500/10" />
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.35em] text-slate-500 mb-3 relative z-10">
               <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Packet Stream
               </span>
               <div className="flex items-center gap-2">
                  {[30, 100, 1000, 'all'].map(option => (
                     <button
                        key={option}
                        onClick={(e) => { e.stopPropagation(); setLogLimit(option as 30 | 100 | 1000 | 'all'); sendTelemetry('logs', 'change-limit', { limit: option }); }}
                        className={`px-2 py-1 rounded-full border text-[9px] tracking-[0.25em] ${logLimit === option ? 'border-accent text-accent bg-accent/10' : 'border-white/10 text-slate-500 hover:text-accent'}`}
                     >
                        {option === 'all' ? 'ALL' : option}
                     </button>
                  ))}
               </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar-thin relative z-10">
               {logs.map((log) => (
                  <div
                     key={log.id}
                     className="text-[10px] flex gap-3 items-start animate-in fade-in slide-in-from-right-2 bg-black/40 border border-white/5 rounded-xl px-3 py-2 shadow-[0_0_12px_-8px_rgba(34,211,238,0.8)]"
                  >
                     <span className="text-emerald-300 shrink-0">
                        [{log.time}]
                     </span>
                     <span
                        className={
                           log.level === 'warn'
                              ? 'text-amber-400'
                              : log.level === 'error'
                              ? 'text-rose-400'
                              : 'text-slate-300'
                        }
                     >
                        <span className="text-accent mr-2 opacity-60">{'>>'}</span>
                          {log.message}
                     </span>
                  </div>
               ))}
               {logs.length === 0 && (
                  <div className="flex items-center justify-center h-full opacity-10">
                     <Activity size={64} className="animate-pulse" />
                  </div>
               )}
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-widest relative z-10">
               <span className="flex items-center gap-2">
                  <Wifi size={10} className="text-accent" /> Listening to stream...
               </span>
            </div>
         </div>

         {/* Painel de Manutenção Rápida */}
         <div className="rounded-3xl overflow-hidden border border-accent/25 bg-gradient-to-br from-[#0b1420] via-[#0b1f2e] to-[#04090f] shadow-[0_0_28px_-14px_rgba(34,211,238,0.9)] relative">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.08),transparent_40%)]" />
            <div className="flex items-center justify-between px-5 py-4 border-b border-accent/20 bg-black/40 relative z-10">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-accent shadow-[0_0_14px_rgba(34,211,238,0.7)]" />
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400 flex items-center gap-2">
                        <Cpu size={14} className="text-accent" /> Maintenance // Quick Ops
                     </p>
                     <p className="text-[11px] text-slate-500 font-mono">Ferramentas de reparo e limpeza instantânea</p>
                  </div>
               </div>
               <Badge variant="secondary" className="uppercase tracking-[0.3em]">Safe</Badge>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3 relative z-10">
               <Button
                  variant="secondary"
                  className="text-[9px] py-3 w-full bg-dark-900/60 border border-accent/30 hover:shadow-[0_0_18px_-6px_rgba(34,211,238,0.9)]"
                  icon={<RefreshCcw size={12} className="text-accent" />}
                  onClick={handlePurgeCache}
               >
                  Purge Cache
               </Button>
               <Button
                  variant="secondary"
                  className="text-[9px] py-3 w-full bg-dark-900/60 border border-emerald-300/30 hover:shadow-[0_0_18px_-6px_rgba(16,185,129,0.9)]"
                  icon={<Activity size={12} className="text-emerald-300" />}
                  onClick={() => { sendTelemetry('maintenance', 'open-performance-modal'); setShowPerformanceModal(true); }}
               >
                  Monitorar Performance
               </Button>
               <Button
                  variant="danger"
                  className="text-[9px] py-3 col-span-2 w-full bg-[#1f0b12]/70 border border-rose-400/40 hover:shadow-[0_0_24px_-10px_rgba(244,63,94,0.9)]"
                  icon={<Trash2 size={12} className="text-rose-300" />}
                  disabled={!isManagerUser}
                  onClick={handleWipeLocal}
               >
                  Wipe Local Storage
               </Button>
            </div>
         </div>
        </div>
      </div>

         {showLogsModal && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4" onClick={closeLogsModal}>
               <div className="bg-dark-950 border border-accent/40 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/70">
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500 flex items-center gap-2">
                           <Terminal size={14} className="text-accent" /> Logs detalhados
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">Clique em uma linha para expandir e ver o contexto completo</p>
                     </div>
                     <div className="flex items-center gap-2">
                        {[30, 100, 1000, 'all'].map(option => (
                           <Button
                              key={option}
                              size="sm"
                              variant={logLimit === option ? 'primary' : 'secondary'}
                              onClick={() => { setLogLimit(option as 30 | 100 | 1000 | 'all'); sendTelemetry('logs', 'change-limit', { limit: option }); }}
                           >
                              {option === 'all' ? 'All' : `Últimas ${option}`}
                           </Button>
                        ))}
                        <Button size="sm" variant="secondary" onClick={closeLogsModal}>Fechar</Button>
                     </div>
                  </div>
                  <div className="p-4 overflow-auto max-h-[78vh] space-y-4">
                     {(interactionCounts.length > 0 || perfSamples.length > 0) && (
                        <div className="bg-gradient-to-br from-[#0a1b2a] via-[#0c2233] to-[#050b15] border border-accent/30 rounded-2xl p-4 shadow-[0_15px_45px_-20px_rgba(34,211,238,0.7)] relative overflow-hidden">
                           <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.12),transparent_40%)]" />
                           <div className="flex items-center justify-between mb-3 relative z-10 flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                 <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                                 <p className="text-[10px] uppercase tracking-[0.3em] text-slate-300">Distribuição & Performance</p>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                 {interactionCounts.length > 0 && <span>Total tipos: {interactionCounts.length}</span>}
                                 {perfSamples.length > 0 && (
                                    <button
                                       className="px-2 py-1 rounded-full border border-white/10 text-slate-300 hover:text-accent hover:border-accent/50"
                                       onClick={() => setShowPerfDetails(v => !v)}
                                    >
                                       {showPerfDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
                                    </button>
                                 )}
                              </div>
                           </div>
                           {perfSamples.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 relative z-10">
                                 <div className="group relative">
                                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3 flex items-center justify-between">
                                       <div className="text-[10px] uppercase tracking-[0.26em] text-slate-400">CPU (%)</div>
                                       <Sparkline values={perfSamples.map(p => p.cpu)} color="#22d3ee" />
                                    </div>
                                    <div className="pointer-events-none absolute -top-10 right-2 bg-black/80 text-[11px] text-slate-100 px-3 py-1 rounded-lg border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                       Uso da CPU do servidor (100 - idle).
                                    </div>
                                 </div>
                                 <div className="group relative">
                                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3 flex items-center justify-between">
                                       <div className="text-[10px] uppercase tracking-[0.26em] text-slate-400">RAM (MB)</div>
                                       <Sparkline values={perfSamples.map(p => p.mem)} color="#a855f7" />
                                    </div>
                                    <div className="pointer-events-none absolute -top-10 right-2 bg-black/80 text-[11px] text-slate-100 px-3 py-1 rounded-lg border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                       RAM usada no host (inclui outros processos).
                                    </div>
                                 </div>
                                 <div className="group relative">
                                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3 flex items-center justify-between">
                                       <div className="text-[10px] uppercase tracking-[0.26em] text-slate-400">Loop p95 (ms)</div>
                                       <Sparkline values={perfSamples.map(p => p.loop)} color="#fbbf24" />
                                    </div>
                                    <div className="pointer-events-none absolute -top-10 right-2 bg-black/80 text-[11px] text-slate-100 px-3 py-1 rounded-lg border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                       Atraso do event loop (p95); picos indicam travas.
                                    </div>
                                 </div>
                              </div>
                           )}
                           {showPerfDetails && perfStats && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 relative z-10">
                                 <div className="group relative rounded-xl border border-white/10 bg-black/40 p-3 text-[11px] text-slate-200">
                                    <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500 mb-1">CPU</div>
                                    <div>Atual: {perfStats.cpu.last.toFixed(0)}%</div>
                                    <div>Min: {perfStats.cpu.min.toFixed(0)}% · Max: {perfStats.cpu.max.toFixed(0)}%</div>
                                    <div className="pointer-events-none absolute -top-10 right-2 bg-black/80 text-[11px] text-slate-100 px-3 py-1 rounded-lg border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                       CPU do servidor (média das CPUs).
                                    </div>
                                 </div>
                                 <div className="group relative rounded-xl border border-white/10 bg-black/40 p-3 text-[11px] text-slate-200">
                                    <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500 mb-1">RAM usada</div>
                                    <div>Atual: {perfStats.mem.last.toFixed(0)} MB</div>
                                    <div>Min: {perfStats.mem.min.toFixed(0)} · Max: {perfStats.mem.max.toFixed(0)} MB</div>
                                    <div className="pointer-events-none absolute -top-10 right-2 bg-black/80 text-[11px] text-slate-100 px-3 py-1 rounded-lg border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                       RAM usada no host (inclui outros processos).
                                    </div>
                                 </div>
                                 <div className="group relative rounded-xl border border-white/10 bg-black/40 p-3 text-[11px] text-slate-200">
                                    <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500 mb-1">Loop p95</div>
                                    <div>Atual: {perfStats.loop.last.toFixed(0)} ms</div>
                                    <div>Min: {perfStats.loop.min.toFixed(0)} · Max: {perfStats.loop.max.toFixed(0)} ms</div>
                                    <div className="pointer-events-none absolute -top-10 right-2 bg-black/80 text-[11px] text-slate-100 px-3 py-1 rounded-lg border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                       Atraso do event loop (p95); picos = risco de travar.
                                    </div>
                                 </div>
                              </div>
                           )}
                           {interactionCounts.length > 0 && (
                              <div className="flex items-end gap-4 h-48 overflow-x-auto custom-scrollbar-thin pr-2 relative z-10">
                                 {interactionCounts.map(item => {
                                    const max = interactionCounts[0]?.count || 1;
                                    const barMax = 180; // px
                                    const barMin = 16; // px for visibility
                                    const heightPx = Math.max(barMin, Math.round((item.count / max) * barMax));
                                    return (
                                       <div key={item.key} className="flex flex-col items-center min-w-[110px]">
                                          <div className="flex-1 flex items-end w-full">
                                             <div
                                                className="w-full rounded-t-xl bg-[linear-gradient(180deg,rgba(34,211,238,0.9)_0%,rgba(34,211,238,0.45)_55%,rgba(12,34,51,0)_100%)] border border-accent/60 shadow-[0_12px_32px_-18px_rgba(34,211,238,0.9)]"
                                                style={{ height: `${heightPx}px` }}
                                                title={`${item.key}: ${item.count}`}
                                             />
                                          </div>
                                          <div className="mt-2 text-center text-[10px] text-slate-200 font-mono leading-tight w-28 line-clamp-2" title={item.key}>{item.key}</div>
                                          <div className="text-[11px] font-bold text-accent">{item.count}</div>
                                       </div>
                                    );
                                 })}
                              </div>
                           )}
                        </div>
                     )}

                     <div className="overflow-hidden border border-white/10 rounded-2xl">
                        <table className="w-full text-left text-[12px] text-slate-200">
                           <thead className="bg-black/60 uppercase text-[10px] tracking-[0.2em] text-slate-500">
                              <tr>
                                 <th className="px-3 py-2 w-10"></th>
                                 <th className="px-3 py-2 w-56">Horário</th>
                                 <th className="px-3 py-2 w-20">Nível</th>
                                 <th className="px-3 py-2">Mensagem</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5">
                              {logs.map(log => {
                                 const expanded = expandedLogIds.has(log.id);
                                 const formattedDate = new Date(log.createdAt).toLocaleString('pt-BR', { hour12: false });
                                 const shortMessage = log.message.length > 120 ? `${log.message.slice(0, 120)}...` : log.message;
                                 return (
                                    <React.Fragment key={log.id}>
                                       <tr className="hover:bg-white/5 cursor-pointer" onClick={() => toggleLogRow(log.id)}>
                                          <td className="px-3 py-2 text-center text-slate-400">
                                             {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                          </td>
                                          <td className="px-3 py-2 font-mono text-[11px] text-slate-300">{formattedDate}</td>
                                          <td className="px-3 py-2">
                                             <span className={log.level === 'error' ? 'text-rose-300' : log.level === 'warn' ? 'text-amber-300' : 'text-emerald-300'}>{log.level}</span>
                                          </td>
                                          <td className="px-3 py-2 text-slate-200">{shortMessage}</td>
                                       </tr>
                                       {expanded && (
                                          <tr className="bg-black/40">
                                             <td colSpan={4} className="px-4 py-3">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px] text-slate-200">
                                                   <div className="md:col-span-2 bg-white/5 rounded-xl p-3 border border-white/10">
                                                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1">Mensagem completa</p>
                                                      <p className="leading-snug">{log.message}</p>
                                                   </div>
                                                   <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1">ID</p>
                                                      <p className="font-mono break-all">{log.id}</p>
                                                   </div>
                                                   <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1">Timestamp</p>
                                                      <p className="font-mono">{formattedDate}</p>
                                                   </div>
                                                   <div className="md:col-span-4 bg-white/5 rounded-xl p-3 border border-white/10">
                                                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">Contexto</p>
                                                      <pre className="text-[11px] text-slate-100 font-mono whitespace-pre-wrap bg-black/60 rounded-lg p-3 border border-white/5 overflow-x-auto">
                                                         {log.context ? JSON.stringify(log.context, null, 2) : 'Sem contexto'}
                                                      </pre>
                                                   </div>
                                                </div>
                                             </td>
                                          </tr>
                                       )}
                                    </React.Fragment>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            </div>
         )}

      {/* Rodapé de Ações Globais */}
      <div className="mt-8 pt-6 border-t border-white/5 flex justify-end gap-4 relative z-10 shrink-0">
         <Button variant="secondary" className="px-8 py-3 uppercase text-[10px] font-bold tracking-widest">Descartar Alterações</Button>
         <Button className="px-10 py-3 uppercase text-[10px] font-bold tracking-widest shadow-accent-glow" icon={<Save size={18} />}>Commit Changes</Button>
      </div>
    </div>
  );
};

export default Settings;
