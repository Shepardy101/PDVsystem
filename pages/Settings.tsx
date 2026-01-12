
import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { isAdmin } from '../types';
import DbManager from '../src/renderer/components/adminDb/DbManager';
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
   const [refresh, setRefresh] = useState(0);

   useEffect(() => {
      setLoading(true);
      setError(null);
      Promise.all([
         fetch('/api/admin/ip-control/pending').then(r => r.json()),
         fetch('/api/admin/ip-control/allowed').then(r => r.json())
      ]).then(([pending, allowed]) => {
         setPending(pending);
         setAllowed(allowed);
      }).catch(e => setError('Erro ao carregar IPs')).finally(() => setLoading(false));
   }, [refresh]);

   const handleAllow = async (ip: string, hostname?: string|null) => {
      setLoading(true);
      await fetch('/api/admin/ip-control/allow', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ ip, hostname, autorizado_por: 'admin' })
      });
      setRefresh(r => r + 1);
   };
   const handleDeny = async (ip: string) => {
      setLoading(true);
      await fetch('/api/admin/ip-control/deny', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ ip })
      });
      setRefresh(r => r + 1);
   };
   const handleRemove = async (ip: string) => {
      setLoading(true);
      await fetch('/api/admin/ip-control/remove', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ ip })
      });
      setRefresh(r => r + 1);
   };

   return (
      <div className="glass-panel rounded-3xl p-8 border-white/5 space-y-8 mt-8">
         <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
            <Globe size={14} className="text-accent" /> Controle de Dispositivos/IPs
         </h3>
         {error && <div className="text-red-400 text-xs">{error}</div>}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
               <h4 className="text-xs font-bold text-slate-300 mb-2">Aguardando Autorização</h4>
               <div className="space-y-2">
                  {pending.length === 0 && <div className="text-slate-500 text-xs">Nenhum IP pendente.</div>}
                  {pending.map(ip => (
                     <div key={ip.id} className="flex items-center justify-between bg-dark-950/60 border border-white/10 rounded-xl px-3 py-2">
                        <div>
                           <span className="font-mono text-sm text-slate-100">{ip.ip}</span>
                           {ip.hostname && <span className="ml-2 text-slate-500 text-xs">({ip.hostname})</span>}
                           <span className="ml-2 text-slate-500 text-[10px]">{ip.tentado_em?.replace('T',' ').slice(0,19)}</span>
                        </div>
                        <div className="flex gap-2">
                           <Button size="xs" variant="success" onClick={() => handleAllow(ip.ip, ip.hostname)}>Autorizar</Button>
                           <Button size="xs" variant="danger" onClick={() => handleDeny(ip.ip)}>Negar</Button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
            <div>
               <h4 className="text-xs font-bold text-slate-300 mb-2">IPs Autorizados</h4>
               <div className="space-y-2">
                  {allowed.length === 0 && <div className="text-slate-500 text-xs">Nenhum IP autorizado.</div>}
                  {allowed.map(ip => (
                     <div key={ip.id} className="flex items-center justify-between bg-dark-950/60 border border-white/10 rounded-xl px-3 py-2">
                        <div>
                           <span className="font-mono text-sm text-slate-100">{ip.ip}</span>
                           {ip.hostname && <span className="ml-2 text-slate-500 text-xs">({ip.hostname})</span>}
                           <span className="ml-2 text-slate-500 text-[10px]">{ip.autorizado_em?.replace('T',' ').slice(0,19)}</span>
                        </div>
                        <div className="flex gap-2">
                           <Button size="xs" variant="danger" onClick={() => handleRemove(ip.ip)}>Remover</Button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
         <div className="flex justify-end mt-4">
            <Button size="sm" variant="secondary" onClick={() => setRefresh(r => r + 1)} icon={<RefreshCcw size={14}/>}>Atualizar</Button>
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
   const [logs, setLogs] = useState<{time: string, event: string, level: 'info' | 'warn' | 'error'}[]>([]);
   const [showDbManager, setShowDbManager] = useState(false);
  
  // Simular feed de logs técnicos
  useEffect(() => {
    const mockEvents = [
      "Protocolo SSL/TLS 1.3 estabelecido",
      "Sincronização de estoque concluída com sucesso",
      "Tentativa de acesso via IP 192.168.1.45 bloqueada",
      "Backup automático enviado para Cloud Cluster 01",
      "Latência de banco de dados: 14ms",
      "Novo terminal registrado: PDV-POS-04",
      "Cache de imagens limpo (242 itens)",
      "Venda ID: TX-9948 processada offline"
    ];

    const interval = setInterval(() => {
      const newLog = {
        time: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
        event: mockEvents[Math.floor(Math.random() * mockEvents.length)],
        level: Math.random() > 0.8 ? 'warn' : 'info' as any
      };
      setLogs(prev => [newLog, ...prev].slice(0, 15));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

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
      <div className="p-8 flex flex-col h-full overflow-hidden assemble-view bg-dark-950 bg-cyber-grid relative">
         
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
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           
          

           {/* Seção de Periféricos */}
           <div className="glass-panel rounded-3xl p-8 border-white/5 space-y-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                 <Bluetooth size={14} className="text-accent" /> Periféricos & Hardware
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-dark-950/50 rounded-2xl border border-white/5">
                       <div className="flex items-center gap-4">
                          <Printer size={20} className="text-slate-400" />
                          <div>
                             <p className="text-xs font-bold text-slate-200">Impressora Térmica</p>
                             <p className="text-[9px] text-slate-500 uppercase">Status: Conectado (USB-0)</p>
                          </div>
                       </div>
                       <Switch enabled={true} onChange={() => {}} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-dark-950/50 rounded-2xl border border-white/5">
                       <div className="flex items-center gap-4">
                          <Wifi size={20} className="text-slate-400" />
                          <div>
                             <p className="text-xs font-bold text-slate-200">Scanner Bluetooth</p>
                             <p className="text-[9px] text-slate-500 uppercase">Status: Emparelhado</p>
                          </div>
                       </div>
                       <Switch enabled={true} onChange={() => {}} />
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-dark-950/50 rounded-2xl border border-white/5">
                       <div className="flex items-center gap-4">
                          <CreditCard size={20} className="text-slate-400" />
                          <div>
                             <p className="text-xs font-bold text-slate-200">TEF / Pinpad</p>
                             <p className="text-[9px] text-slate-500 uppercase">Status: Inativo</p>
                          </div>
                       </div>
                       <Switch enabled={false} onChange={() => {}} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-dark-950/50 rounded-2xl border border-white/5">
                       <div className="flex items-center gap-4">
                          <Laptop size={20} className="text-slate-400" />
                          <div>
                             <p className="text-xs font-bold text-slate-200">Display Secundário</p>
                             <p className="text-[9px] text-slate-500 uppercase">Status: Desconectado</p>
                          </div>
                       </div>
                       <Switch enabled={false} onChange={() => {}} />
                    </div>
                 </div>
              </div>
           </div>

           {/* Seção de Controle de IPs */}
           <IPControlPanel />

           {/* Seção de Segurança */}
           <div className="glass-panel rounded-3xl p-8 border-white/5 space-y-8">
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
           </div>
        </div>

        {/* Coluna Direita: Logs Técnicos */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-hidden">
           <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2 ml-2">
              <Terminal size={14} className="text-accent" /> Audit Trail // Real-time
           </h3>
           <div className="flex-1 bg-dark-900 border border-white/5 rounded-3xl p-6 font-mono overflow-hidden flex flex-col shadow-inner">
              <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar-thin">
                 {logs.map((log, i) => (
                    <div key={i} className="text-[10px] flex gap-3 animate-in fade-in slide-in-from-right-2">
                       <span className="text-slate-600 shrink-0">[{log.time}]</span>
                       <span className={log.level === 'warn' ? 'text-amber-500' : 'text-slate-400'}>
                          <span className="text-accent mr-2 opacity-50">{'>>'}</span>
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
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                 <span>Listening to stream...</span>
                 <button className="hover:text-accent transition-colors">Clear Buffer</button>
              </div>
           </div>

           {/* Painel de Manutenção Rápida */}
           <div className="glass-panel rounded-3xl p-6 border-white/5 space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ferramentas de Manutenção</h4>
              <div className="grid grid-cols-2 gap-3">
                 <Button variant="secondary" className="text-[9px] py-3" icon={<RefreshCcw size={12}/>}>Limpar Cache</Button>
                 <Button variant="secondary" className="text-[9px] py-3" icon={<Database size={12}/>}>Fix DB Indexes</Button>
                 <Button variant="danger" className="text-[9px] py-3 col-span-2" icon={<Trash2 size={12}/>}>Wipe Local Storage</Button>
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
