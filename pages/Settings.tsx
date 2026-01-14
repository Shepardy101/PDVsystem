
import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { isAdmin } from '../types';
import DbManager from '../src/renderer/components/adminDb/DbManager';
import { toast } from 'react-hot-toast';
import { 
  Settings as SettingsIcon, Shield, Cpu, Printer, Database, Globe, 
  Lock, RefreshCcw, Bell, HardDrive, Wifi, Terminal, Zap, 
  Activity, Cloud, Save, Trash2, Key, Server, Laptop, Bluetooth,
  CreditCard, Clock
} from 'lucide-react';
import { Button, Card, Input, Switch, Badge } from '../components/UI';
import AccessDenied from '@/components/AccessDenied';
import SystemMonitorCards from '../components/SystemMonitorCards';

// --- Painel de Controle de IPs ---
type IpEntry = { id: number; ip: string; hostname?: string|null; tentado_em?: string; autorizado_em?: string; autorizado_por?: string|null };

const IPControlPanel: React.FC = () => {
   const [pending, setPending] = useState<IpEntry[]>([]);
   const [allowed, setAllowed] = useState<IpEntry[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string|null>(null);
   const [blocked, setBlocked] = useState<IpEntry[]>([]);
   const [refresh, setRefresh] = useState(0);

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
      setLoading(true);
      try {
         const res = await fetch('/api/admin/ip-control/allow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip, hostname, autorizado_por: 'admin' })
         });
         if (!res.ok) throw new Error('Erro ao autorizar');
         setRefresh(r => r + 1);
      } catch (e) {
         setError('Falha ao autorizar IP');
      } finally {
         setLoading(false);
      }
   };
   const handleDeny = async (ip: string) => {
      setLoading(true);
      try {
         const res = await fetch('/api/admin/ip-control/deny', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip })
         });
         if (!res.ok) throw new Error('Erro ao negar');
         setRefresh(r => r + 1);
      } catch (e) {
         setError('Falha ao negar IP');
      } finally {
         setLoading(false);
      }
   };
   const handleRemove = async (ip: string) => {
      setLoading(true);
      try {
         const res = await fetch('/api/admin/ip-control/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip })
         });
         if (!res.ok) throw new Error('Erro ao remover');
         setRefresh(r => r + 1);
      } catch (e) {
         setError('Falha ao remover IP');
      } finally {
         setLoading(false);
      }
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
               <Button size="sm" variant="secondary" disabled={loading} onClick={() => setRefresh(r => r + 1)} icon={<RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />}>Sync</Button>
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
                     <div key={ip.id} className="bg-[#0b1924] border border-accent/20 rounded-xl px-4 py-3 flex flex-col gap-2 shadow-[0_0_12px_-6px_rgba(34,211,238,0.7)]">
                        <div className="flex items-center justify-between">
                           <div className="font-mono text-xs md:text-sm text-accent">{ip.ip}</div>
                           <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-mono text-slate-400">
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-400/30 text-amber-200">Pendente</span>
                              <span>{ip.tentado_em?.replace('T',' ').slice(0,19)}</span>
                           </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] md:text-[11px] text-slate-300 font-mono">
                           <span>{ip.hostname ? `host:${ip.hostname}` : 'host:desconhecido'}</span>
                           <div className="flex gap-2">
                              <Button size="xs" variant="success" disabled={loading} onClick={() => handleAllow(ip.ip, ip.hostname)}>allow</Button>
                              <Button size="xs" variant="danger" disabled={loading} onClick={() => handleDeny(ip.ip)}>deny</Button>
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
                     <div key={ip.id} className="bg-[#0b1f1a] border border-emerald-400/20 rounded-xl px-4 py-3 flex flex-col gap-2 shadow-[0_0_12px_-6px_rgba(16,185,129,0.7)]">
                        <div className="flex items-center justify-between">
                           <div className="font-mono text-xs md:text-sm text-emerald-200">{ip.ip}</div>
                           <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-mono text-slate-400">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-400/30 text-emerald-200">Allow</span>
                              <span>{ip.autorizado_em?.replace('T',' ').slice(0,19)}</span>
                           </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] md:text-[11px] text-slate-300 font-mono">
                           <span>{ip.hostname ? `host:${ip.hostname}` : 'host:desconhecido'}</span>
                           <div className="flex gap-2">
                              <Button size="xs" variant="danger" disabled={loading} onClick={() => handleRemove(ip.ip)}>remove</Button>
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
                     <div key={ip.id} className="bg-[#1f0b12] border border-rose-400/25 rounded-xl px-4 py-3 flex flex-col gap-2 shadow-[0_0_12px_-6px_rgba(244,63,94,0.7)]">
                        <div className="flex items-center justify-between">
                           <div className="font-mono text-xs md:text-sm text-rose-200">{ip.ip}</div>
                           <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-mono text-slate-400">
                              <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-400/30 text-rose-200">Blocked</span>
                              <span>{ip.autorizado_em?.replace('T',' ').slice(0,19) || ip.tentado_em?.replace('T',' ').slice(0,19)}</span>
                           </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] md:text-[11px] text-slate-300 font-mono">
                           <span>{ip.hostname ? `host:${ip.hostname}` : 'host:desconhecido'}</span>
                           <div className="flex gap-2">
                              <Button size="xs" variant="success" disabled={loading} onClick={() => handleAllow(ip.ip, ip.hostname)}>allow</Button>
                              <Button size="xs" variant="danger" disabled={loading} onClick={() => handleRemove(ip.ip)}>remove</Button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
};

const Settings: React.FC = () => {
   const { user } = useAuth();
   if (!user || !isAdmin(user)) {
      return (
         <AccessDenied />
      );
   }
   const [logs, setLogs] = useState<{id?: string; time: string; event: string; level: 'info' | 'warn' | 'error'}[]>([]);
   const [showDbManager, setShowDbManager] = useState(false);
   const [allowNegativeStock, setAllowNegativeStock] = useState<boolean>(true);
   const [settingsLoading, setSettingsLoading] = useState(false);
  
   // Polling simples do audit log real
   useEffect(() => {
      let active = true;
      const fetchLogs = async () => {
         try {
            const res = await fetch('/api/logs?limit=30');
            if (!res.ok) return;
            const data = await res.json();
            if (!active || !Array.isArray(data?.logs)) return;
            const mapped = data.logs.map((log: any) => ({
               id: log.id,
               time: new Date(log.created_at || Date.now()).toLocaleTimeString('pt-BR', { hour12: false }),
               event: log.message,
               level: (log.level === 'warn' || log.level === 'error') ? log.level : 'info',
            }));
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
   }, []);

   const handleClearLogs = () => setLogs([]);
   
      const handlePurgeCache = async () => {
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
               <Button variant="secondary" icon={<Database size={18} />} onClick={() => setShowDbManager(true)}>
                  DB Manager
               </Button>
           <div className="flex items-center gap-2 px-4 py-2 bg-dark-900/60 border border-white/5 rounded-full backdrop-blur-md">
              <Server size={14} className="text-accent" />
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Instance: US-EAST-01</span>
           </div>
           <Button icon={<RefreshCcw size={18} />}>Reiniciar Kernel</Button>
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
           <IPControlPanel />

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
         <div className="flex-1 bg-[#050b11] border border-accent/30 rounded-3xl p-6 font-mono overflow-hidden flex flex-col shadow-[0_0_25px_-12px_rgba(34,211,238,0.9)] relative">
            <div className="absolute inset-0 pointer-events-none opacity-40 bg-gradient-to-br from-accent/10 via-transparent to-purple-500/10" />
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.35em] text-slate-500 mb-3 relative z-10">
               <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Packet Stream
               </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar-thin relative z-10">
               {logs.map((log, index) => (
                  <div
                     key={`${log.time}-${index}`}
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
                        {log.event}
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
               <button className="hover:text-accent transition-colors" onClick={handleClearLogs}>Clear Buffer</button>
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
                  icon={<Database size={12} className="text-emerald-300" />}
               >
                  Rebuild Indexes
               </Button>
               <Button
                  variant="danger"
                  className="text-[9px] py-3 col-span-2 w-full bg-[#1f0b12]/70 border border-rose-400/40 hover:shadow-[0_0_24px_-10px_rgba(244,63,94,0.9)]"
                  icon={<Trash2 size={12} className="text-rose-300" />}
               >
                  Wipe Local Storage
               </Button>
            </div>
         </div>
        </div>
      </div>

      {/* Rodapé de Ações Globais */}
      <div className="mt-8 pt-6 border-t border-white/5 flex justify-end gap-4 relative z-10 shrink-0">
         <Button variant="secondary" className="px-8 py-3 uppercase text-[10px] font-bold tracking-widest">Descartar Alterações</Button>
         <Button className="px-10 py-3 uppercase text-[10px] font-bold tracking-widest shadow-accent-glow" icon={<Save size={18} />}>Commit Changes</Button>
      </div>
    </div>
  );
};

export default Settings;
