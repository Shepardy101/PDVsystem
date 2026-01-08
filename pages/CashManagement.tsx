

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { getUserById, getOperatorNameById } from '../services/user';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Clock, Info, CheckCircle2, Receipt, User, Tag, Calendar, FileText, CreditCard, Printer, X, Check, Zap, AlertTriangle, History, Search, ChevronRight, Calculator, Archive, ShoppingBag, Eye, Shield, MessageSquare, FolderPlus } from 'lucide-react';
import { Button, Input, Card, Badge, Modal } from '../components/UI';
import SuprimentoModal from '../components/modals/SuprimentoModal';
import { CashSession, CashTransaction } from '../types';

// Mock de Histórico de Caixas Fechados com Transações Vinculadas
const MOCK_CASH_HISTORY = [
   {
      id: 'CS-20231026-A',
      openedAt: '2023-10-26T08:00:00Z',
      closedAt: '2023-10-26T22:00:00Z',
      operator: 'Operador Alfa',
      initialBalance: 200.00,
      finalBalance: 4580.50,
      expectedBalance: 4580.50,
      salesCount: 3,
      salesTotal: 4450.50,
      sangriasTotal: 100.00,
      suprimentosTotal: 50.00,
      paymentsTotal: 20.00,
      status: 'success',
      transactions: [
         { id: 'TX-H1', type: 'sale', amount: 1500.00, description: 'Venda #1023', timestamp: '2023-10-26T09:30:00Z', metadata: { method: 'Pix', operator: 'Operador Alfa', items: [{ name: 'Cerveja Pilsen Lata 350ml', qty: 333, price: 4.50 }] } },
         { id: 'TX-H2', type: 'sangria', amount: 100.00, description: 'Sangria Provedor', timestamp: '2023-10-26T14:15:00Z', metadata: { method: 'Dinheiro', operator: 'Gerente', category: 'Logística' } },
         { id: 'TX-H3', type: 'sale', amount: 2950.50, description: 'Venda #1024', timestamp: '2023-10-26T18:45:00Z', metadata: { method: 'Cartão', operator: 'Operador Alfa', items: [{ name: 'Vodka Absolut 1L', qty: 30, price: 98.35 }] } },
         { id: 'TX-H4', type: 'suprimento', amount: 50.00, description: 'Troco Inicial Extra', timestamp: '2023-10-26T08:05:00Z', metadata: { method: 'Dinheiro', operator: 'Admin' } },
      ]
   },
   {
      id: 'CS-20231025-A',
      openedAt: '2023-10-25T08:00:00Z',
      closedAt: '2023-10-25T21:45:00Z',
      operator: 'Operador Beta',
      initialBalance: 200.00,
      finalBalance: 3120.00,
      expectedBalance: 3125.00,
      salesCount: 2,
      salesTotal: 3000.00,
      sangriasTotal: 50.00,
      suprimentosTotal: 0.00,
      paymentsTotal: 25.00,
      status: 'warning',
      transactions: [
         { id: 'TX-H5', type: 'sale', amount: 2000.00, description: 'Venda #1021', timestamp: '2023-10-25T11:00:00Z', metadata: { method: 'Pix', operator: 'Operador Beta', items: [{ name: 'Whisky Red Label', qty: 1, price: 2000.00 }] } },
         { id: 'TX-H6', type: 'sale', amount: 1000.00, description: 'Venda #1022', timestamp: '2023-10-25T16:20:00Z', metadata: { method: 'Dinheiro', operator: 'Operador Beta', items: [{ name: 'Cerveja Brahma', qty: 250, price: 4.00 }] } },
         { id: 'TX-H7', type: 'pagamento', amount: 25.00, description: 'Café p/ Equipe', timestamp: '2023-10-25T17:00:00Z', metadata: { method: 'Dinheiro', operator: 'Operador Beta', category: 'Despesas Gerais' } },
         { id: 'TX-H8', type: 'sangria', amount: 50.00, description: 'Sangria p/ Cofre', timestamp: '2023-10-25T21:00:00Z', metadata: { method: 'Dinheiro', operator: 'Admin', category: 'Retirada Lucro' } },
      ]
   }
];

const INITIAL_TX_CATEGORIES = ['Logística', 'Infraestrutura', 'Retirada Lucro', 'Despesas Gerais', 'Marketing', 'Manutenção'];

const CashManagement: React.FC = () => {
   const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
   const [historyModalTab, setHistoryModalTab] = useState<'resumo' | 'movimentacoes'>('resumo');
   const [refreshFlag, setRefreshFlag] = useState(0);

   // Categorias de Transação
   const [txCategories, setTxCategories] = useState<string[]>(INITIAL_TX_CATEGORIES);
   const [isTxCategoryModalOpen, setIsTxCategoryModalOpen] = useState(false);
   const [newTxCategoryName, setNewTxCategoryName] = useState('');

   const [session, setSession] = useState<CashSession | null>(null);
   const [sessionLoading, setSessionLoading] = useState(true);
   const [sessionError, setSessionError] = useState('');

   //suprimentos

   useEffect(() => {
      setSessionLoading(true);
      fetch('/api/cash/open')
         .then(async res => {
            if (!res.ok) throw new Error('Nenhum caixa aberto');
            const data = await res.json();
            const sessionId = data.session?.id;
            if (sessionId) {
               // Buscar vendas
               const salesRes = await fetch(`/api/pos/sales?cashSessionId=${sessionId}`);
               const salesData = salesRes.ok ? await salesRes.json() : { sales: [] };
               // Buscar suprimentos
               const suprimentosRes = await fetch(`/api/cash/movements`);
               const suprimentosData = suprimentosRes.ok ? await suprimentosRes.json() : { movements: [] };
               // Unir vendas e suprimentos
               const allMovements = [
                  ...(salesData.sales || []),
                  ...(suprimentosData.movements || []).map((m: any) => ({
                     ...m,
                     type: m.type === 'supply_in' ? 'suprimento' : m.type
                  }))
               ];
               // Ordenar por data/hora
               allMovements.sort((a, b) => (a.timestamp || a.created_at) - (b.timestamp || b.created_at));
               setSession({
                  ...data.session,
                  transactions: allMovements
               });
            } else {
               setSession(null);
            }
         })
         .catch(() => {
            setSessionError('Nenhum caixa aberto ou erro ao buscar vendas/suprimentos.');
            setSession(null);
         })
         .finally(() => setSessionLoading(false));
   }, [refreshFlag]);

   const [isSuprimentoModalOpen, setIsSuprimentoModalOpen] = useState(false);
   const [isSangriaModalOpen, setIsSangriaModalOpen] = useState(false);
   const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false);
   const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
   const [selectedTx, setSelectedTx] = useState<CashTransaction | null>(null);
   const [operatorName, setOperatorName] = useState<string>('');

   // Fecha o modal de auditoria de movimentação ao pressionar ESC
   useEffect(() => {
      if (!selectedTx) return;
      const handleEsc = (e: KeyboardEvent) => {
         if (e.key === 'Escape') {
            setSelectedTx(null);
         }
      };
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
   }, [selectedTx]);



   // Buscar nome do operador ao abrir modal de venda
   useEffect(() => {
      async function fetchOperatorName() {
         if (selectedTx && selectedTx.operator_id) {
            const name = await getOperatorNameById(selectedTx.operator_id);
            setOperatorName(name || '');
         } else {
            setOperatorName('');
         }
      }
      fetchOperatorName();
   }, [selectedTx]);
   const [selectedHistory, setSelectedHistory] = useState<any | null>(null);
   const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);

   const handlePrint = useCallback(() => {
      window.print();
   }, []);

   const getStatusColor = (type: string) => {
      switch (type) {
         case 'sale': return 'text-emerald-500';
         case 'suprimento': return 'text-blue-400';
         case 'sangria': return 'text-red-400';
         case 'pagamento': return 'text-amber-500';
         default: return 'text-slate-400';
      }
   };

   const getStatusIcon = (type: string) => {
      switch (type) {
         case 'sale': return <ShoppingBag size={16} />;
         case 'suprimento': return <ArrowDownLeft size={16} />;
         case 'sangria': return <ArrowUpRight size={16} />;
         case 'pagamento': return <FileText size={16} />;
         default: return <Info size={16} />;
      }
   };

   const handleCreateTxCategory = () => {
      if (newTxCategoryName.trim()) {
         setTxCategories(prev => [...prev, newTxCategoryName.trim()]);
         setNewTxCategoryName('');
         setIsTxCategoryModalOpen(false);
      }
   };

   return (
      <div className="p-6 md:p-8 flex flex-col h-full overflow-hidden assemble-view bg-dark-950 bg-cyber-grid relative">
         <div className="flex items-center justify-between shrink-0 mb-6 relative z-10">
            <div>
               <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                  <DollarSign className="text-accent" /> Gestão Financeira
               </h1>
               <p className="text-slate-500 text-xs md:text-sm font-medium">Auditoria em tempo real do fluxo de caixa e sangrias.</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Ativo</span>
               </div>
            </div>
         </div>

         {/* Tabs Principais */}
         <div className="flex items-center gap-2 mb-6 relative z-10 animate-in fade-in slide-in-from-top-2 duration-400 shrink-0">
            <button
               onClick={() => setActiveTab('current')}
               className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 ${activeTab === 'current'
                     ? 'bg-accent/10 border-accent/40 text-accent shadow-accent-glow'
                     : 'bg-dark-900/40 border-white/5 text-slate-500 hover:text-slate-300'
                  }`}
            >
               <Zap size={14} />
               <span className="text-[9px] font-bold uppercase tracking-widest">Sessão Atual</span>
            </button>
            <button
               onClick={() => setActiveTab('history')}
               className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 ${activeTab === 'history'
                     ? 'bg-accent/10 border-accent/40 text-accent shadow-accent-glow'
                     : 'bg-dark-900/40 border-white/5 text-slate-500 hover:text-slate-300'
                  }`}
            >
               <History size={14} />
               <span className="text-[9px] font-bold uppercase tracking-widest">Histórico</span>
            </button>
         </div>

         {activeTab === 'current' ? (
            <>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0 mb-6 relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
                  <Card className="bg-dark-900/40 border-accent/20 shadow-accent-glow/10 p-4">
                     <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mb-1">Liquidez</p>
                     <h3 className="text-xl md:text-2xl font-mono font-bold text-accent">R$ {session && session.currentBalance ? session.currentBalance.toFixed(2) : '0.00'}</h3>
                  </Card>
                  <Card className="bg-dark-900/40 border-white/5 p-4">
                     <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mb-1">Injeções</p>
                     <h3 className="text-lg md:text-xl font-mono font-bold text-blue-400">+ R$ 100.00</h3>
                  </Card>
                  <Card className="bg-dark-900/40 border-white/5 p-4">
                     <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mb-1">Deduções</p>
                     <h3 className="text-lg md:text-xl font-mono font-bold text-red-400">- R$ 135.00</h3>
                  </Card>
                  <Card className="bg-dark-900/40 border-white/5 p-4">
                     <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mb-1">Lastro</p>
                     <h3 className="text-lg md:text-xl font-mono font-bold text-slate-400">R$ {session && session.initialBalance ? session.initialBalance.toFixed(2) : '0.00'}</h3>
                  </Card>
               </div>

               <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0 relative z-10">
                  <div className="lg:col-span-8 flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-700">
                     <div className="flex items-center justify-between mb-3 shrink-0 px-2">
                        <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Fluxo Transacional</h2>
                     </div>
                     <div className="flex-1 bg-dark-900/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-0 shadow-2xl backdrop-blur-md">
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                           <table className="w-full text-left border-collapse">
                              <thead className="sticky top-0 bg-dark-950/90 backdrop-blur-md z-20 border-b border-white/5">
                                 <tr className="text-slate-600 text-[9px] uppercase font-bold tracking-[0.2em]">
                                    <th className="px-6 py-4">Movimento</th>
                                    <th className="px-6 py-4">Evento</th>
                                    <th className="px-6 py-4">Valor</th>
                                    <th className="px-6 py-4 text-right">Hora</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {(session && Array.isArray(session.transactions))
                                  ? session.transactions
                                      .filter(tx => {
                                        // Exibir apenas vendas, suprimentos, sangrias e pagamentos
                                        const type = tx.items && Array.isArray(tx.items) ? 'sale' : tx.type;
                                        return (
                                          type === 'sale' ||
                                          type === 'suprimento' ||
                                          type === 'sangria' ||
                                          type === 'pagamento'
                                        );
                                      })
                                      .map(tx => {
                                        const isSale = tx.items && Array.isArray(tx.items);
                                        const type = isSale ? 'sale' : tx.type;
                                        const total = isSale
                                          ? tx.items.reduce((sum, item) => sum + (typeof item.line_total === 'number' ? item.line_total : 0), 0)
                                          : (typeof tx.amount === 'number' ? tx.amount : 0);
                                        const description = isSale ? `Venda #${tx.id}` : tx.description;
                                        return (
                                          <tr key={tx.id} onClick={() => setSelectedTx(tx)} className="group hover:bg-white/5 transition-all cursor-pointer active:scale-[0.99]">
                                            <td className="px-6 py-4">
                                              <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg bg-white/2 border border-white/5 ${getStatusColor(type)}`}>{getStatusIcon(type)}</div>
                                                <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-300">{type}</span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4 text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors font-medium truncate max-w-[150px]">{description}</td>
                                            <td className={`px-6 py-4 font-mono text-[11px] font-bold ${type === 'sangria' || type === 'pagamento' ? 'text-red-400' : 'text-accent'}`}>{type === 'sangria' || type === 'pagamento' ? '-' : '+'} R$ {total ? (total / 100).toFixed(2) : '0.00'}</td>
                                            <td className="px-6 py-4 text-right text-slate-600 font-mono text-[9px] group-hover:text-slate-400">{new Date(tx.timestamp || tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                          </tr>
                                        );
                                      })
                                  : null}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 animate-in fade-in slide-in-from-right-4 duration-700 overflow-y-auto lg:overflow-visible custom-scrollbar">
                     <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 px-2 shrink-0">Comandos</h2>
                     <div className="flex flex-col gap-3 shrink-0">
                        <Button variant="secondary" onClick={() => setIsSuprimentoModalOpen(true)} className="justify-start py-4 px-5 border-white/5 hover:border-blue-500/30 group bg-dark-900/40 backdrop-blur-md" icon={<ArrowDownLeft className="text-blue-400 group-hover:-translate-y-1 transition-transform" size={18} />}>
                           <div className="text-left"><p className="text-[10px] font-bold uppercase tracking-widest">Suprimento</p></div>
                        </Button>
                        <Button variant="secondary" onClick={() => setIsSangriaModalOpen(true)} className="justify-start py-4 px-5 border-white/5 hover:border-red-500/30 group bg-dark-900/40 backdrop-blur-md" icon={<ArrowUpRight className="text-red-400 group-hover:translate-y-1 transition-transform" size={18} />}>
                           <div className="text-left"><p className="text-[10px] font-bold uppercase tracking-widest">Sangria</p></div>
                        </Button>
                        <Button variant="secondary" onClick={() => setIsPagamentoModalOpen(true)} className="justify-start py-4 px-5 border-white/5 hover:border-amber-500/30 group bg-dark-900/40 backdrop-blur-md" icon={<FileText className="text-amber-500 group-hover:scale-110 transition-transform" size={18} />}>
                           <div className="text-left"><p className="text-[10px] font-bold uppercase tracking-widest">Pagamento</p></div>
                        </Button>
                     </div>
                     <div className="mt-auto lg:mt-6 pt-4 border-t border-white/5 shrink-0">
                        <Button onClick={() => setIsClosureModalOpen(true)} variant="danger" className="w-full py-5 text-[10px] font-bold tracking-[0.2em] uppercase shadow-glass hover:shadow-red-500/10" icon={<DollarSign size={18} />}>FECHAR TURNO [F12]</Button>
                     </div>
                  </div>
               </div>
            </>
         ) : (
            /* ABA DE HISTÓRICO */
            <div className="flex-1 flex flex-col min-h-0 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-600">
               <div className="flex items-center justify-between mb-4 px-2">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Auditoria Retroativa</h2>
                  <div className="bg-dark-900/60 border border-white/5 rounded-xl px-4 py-1.5 flex items-center gap-3">
                     <Search size={14} className="text-slate-600" />
                     <input placeholder="Busca rápida..." className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-slate-400 outline-none w-32 md:w-40" />
                  </div>
               </div>

               <div className="flex-1 bg-dark-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md flex flex-col min-h-0">
                  <div className="overflow-y-auto flex-1 custom-scrollbar">
                     <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-dark-950/90 backdrop-blur-md z-20 border-b border-white/5">
                           <tr className="text-slate-600 text-[9px] uppercase font-bold tracking-[0.2em]">
                              <th className="px-6 py-4">ID</th>
                              <th className="px-6 py-4">Operação</th>
                              <th className="px-6 py-4">Operador</th>
                              <th className="px-6 py-4">Saldo Final</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4 text-right">Ações</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {MOCK_CASH_HISTORY.map(history => (
                              <tr
                                 key={history.id}
                                 className="group hover:bg-white/5 transition-all cursor-pointer"
                                 onClick={() => { setSelectedHistory(history); setHistoryModalTab('resumo'); }}
                              >
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                       <div className="p-1.5 rounded bg-accent/10 border border-accent/20">
                                          <Archive size={12} className="text-accent" />
                                       </div>
                                       <span className="text-[10px] font-mono font-bold text-slate-300">{history.id.split('-').pop()}</span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                       {new Date(history.openedAt).toLocaleDateString()}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className="text-[11px] font-medium text-slate-400">{history.operator}</span>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className="text-[11px] font-mono font-bold text-slate-200">R$ {history.finalBalance.toFixed(2)}</span>
                                 </td>
                                 <td className="px-6 py-4">
                                    {history.status === 'success' ? (
                                       <Badge variant="success">Consolidado</Badge>
                                    ) : (
                                       <Badge variant="danger">Atenção</Badge>
                                    )}
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <button className="p-1.5 rounded-lg bg-white/2 text-slate-500 hover:text-accent transition-all flex items-center gap-2 ml-auto">
                                       <Eye size={14} />
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         )}

         {/* MODAL DETALHADO DE HISTÓRICO (AUDITORIA RETROATIVA) */}
         <Modal
            isOpen={!!selectedHistory}
            onClose={() => setSelectedHistory(null)}
            title={`Auditoria de Turno: ${selectedHistory?.id || ''}`}
            size="3xl"
         >
            {selectedHistory && (
               <div className="flex flex-col h-full space-y-6">
                  {/* Navegação Interna do Modal (Abas) */}
                  <div className="flex items-center gap-1 border-b border-white/5 shrink-0 px-2 -mx-8 -mt-8 pt-4 bg-dark-950/40">
                     <button
                        onClick={() => setHistoryModalTab('resumo')}
                        className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative ${historyModalTab === 'resumo' ? 'text-accent' : 'text-slate-500 hover:text-slate-300'
                           }`}
                     >
                        Consolidado Financeiro
                        {historyModalTab === 'resumo' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent shadow-accent-glow" />}
                     </button>
                     <button
                        onClick={() => setHistoryModalTab('movimentacoes')}
                        className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative ${historyModalTab === 'movimentacoes' ? 'text-accent' : 'text-slate-500 hover:text-slate-300'
                           }`}
                     >
                        Datalhamento de Movimentos
                        {historyModalTab === 'movimentacoes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent shadow-accent-glow" />}
                     </button>
                  </div>

                  {historyModalTab === 'resumo' ? (
                     <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-dark-950/80 rounded-2xl border border-white/5 relative overflow-hidden gap-6">
                           <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
                              <div className={`p-4 rounded-2xl shrink-0 ${selectedHistory.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                 {selectedHistory.status === 'success' ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
                              </div>
                              <div>
                                 <h3 className="text-xl font-bold text-slate-100 font-mono tracking-tighter uppercase">{selectedHistory.id}</h3>
                                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Operador: {selectedHistory.operator}</p>
                              </div>
                           </div>
                           <div className="text-right relative z-10 w-full md:w-auto">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Declarado</p>
                              <h3 className="text-3xl font-mono font-bold text-accent shadow-accent-glow">R$ {selectedHistory.finalBalance.toFixed(2)}</h3>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           <div className="p-4 bg-dark-950/50 rounded-xl border border-white/5 space-y-1">
                              <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Abertura</p>
                              <p className="text-xs font-mono font-bold text-slate-300">{new Date(selectedHistory.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                           <div className="p-4 bg-dark-950/50 rounded-xl border border-white/5 space-y-1">
                              <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Encerramento</p>
                              <p className="text-xs font-mono font-bold text-slate-300">{new Date(selectedHistory.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                           <div className="p-4 bg-dark-950/50 rounded-xl border border-white/5 space-y-1 text-emerald-500/80">
                              <p className="text-[8px] font-bold uppercase tracking-widest">Vendas Totais</p>
                              <p className="text-xs font-mono font-bold">R$ {selectedHistory.salesTotal.toFixed(2)}</p>
                           </div>
                           <div className="p-4 bg-dark-950/50 rounded-xl border border-white/5 space-y-1 text-red-500/80">
                              <p className="text-[8px] font-bold uppercase tracking-widest">Sangrias</p>
                              <p className="text-xs font-mono font-bold">R$ {selectedHistory.sangriasTotal.toFixed(2)}</p>
                           </div>
                        </div>

                        <div className="p-6 bg-dark-900/40 rounded-3xl border border-white/5 shadow-2xl space-y-4">
                           <div className="flex items-center justify-between border-b border-white/5 pb-4">
                              <div className="flex items-center gap-3">
                                 <Calculator size={18} className="text-accent" />
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Auditoria de Lastro Esperado</span>
                              </div>
                              <span className="font-mono text-sm font-bold text-slate-100">R$ {selectedHistory.expectedBalance.toFixed(2)}</span>
                           </div>
                           <div className={`p-5 rounded-2xl flex items-center justify-between border ${selectedHistory.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                              <div>
                                 <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Diferença de Caixa</p>
                                 <h5 className={`text-xl font-mono font-bold ${selectedHistory.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    R$ {(selectedHistory.finalBalance - selectedHistory.expectedBalance).toFixed(2)}
                                 </h5>
                              </div>
                              <Badge variant={selectedHistory.status === 'success' ? 'success' : 'danger'}>
                                 {selectedHistory.status === 'success' ? 'Sessão Íntegra' : 'Quebra Identificada'}
                              </Badge>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-300">
                        <div className="bg-dark-900/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col flex-1 shadow-inner">
                           <div className="overflow-y-auto flex-1 custom-scrollbar">
                              <table className="w-full text-left border-collapse">
                                 <thead className="sticky top-0 bg-dark-950/90 backdrop-blur-md z-20 border-b border-white/5">
                                    <tr className="text-slate-600 text-[8px] uppercase font-bold tracking-[0.2em]">
                                       <th className="px-6 py-4">Evento</th>
                                       <th className="px-6 py-4">Descrição</th>
                                       <th className="px-6 py-4 text-right">Montante</th>
                                       <th className="px-6 py-4 text-right">Horário</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-white/5">
                                    {selectedHistory.transactions?.map((tx: any) => (
                                       <tr key={tx.id} onClick={() => setSelectedTx(tx)} className="group hover:bg-white/5 transition-all cursor-pointer">
                                          <td className="px-6 py-4">
                                             <div className="flex items-center gap-2">
                                                <div className={`p-1 rounded bg-white/2 border border-white/5 ${getStatusColor(tx.type)}`}>
                                                   {getStatusIcon(tx.type)}
                                                </div>
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{tx.type}</span>
                                             </div>
                                          </td>
                                          <td className="px-6 py-4 text-[10px] text-slate-300 truncate max-w-[200px]">{tx.description}</td>
                                          <td className={`px-6 py-4 text-right font-mono text-[11px] font-bold ${tx.type === 'sangria' || tx.type === 'pagamento' ? 'text-red-400' : 'text-accent'}`}>
                                             {tx.type === 'sangria' || tx.type === 'pagamento' ? '-' : '+'} R$ {tx.amount.toFixed(2)}
                                          </td>
                                          <td className="px-6 py-4 text-right text-[9px] font-mono text-slate-600">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 shrink-0">
                     <Button variant="secondary" className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest" onClick={() => setSelectedHistory(null)}>Fechar Auditoria</Button>
                     <Button className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest shadow-accent-glow" icon={<Printer size={16} />} onClick={handlePrint}>Gerar PDF Consolidado</Button>
                  </div>
               </div>
            )}
         </Modal>

         {/* TRANSACTION DETAIL MODAL */}
         <Modal
            isOpen={!!selectedTx && !isReceiptPreviewOpen}
            onClose={() => setSelectedTx(null)}
            title="Auditoria de Movimentação Transacional"
            size="lg"
         >
            {selectedTx && (
               <div className="space-y-8 animate-in zoom-in-95 duration-200">
                  {/* Card de Cabeçalho com Valor e Tipo */}
                  <div className="flex items-center justify-between p-6 bg-dark-950/80 rounded-2xl border border-white/5 shadow-inner">
                     <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl bg-white/2 ${getStatusColor(selectedTx.type)}`}>
                           {getStatusIcon(selectedTx.type)}
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Natureza</p>
                           <h3 className="text-xl font-bold text-slate-100 uppercase tracking-tighter">{selectedTx.type}</h3>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vlr Líquido</p>
                        <h3 className={`text-3xl font-mono font-bold ${selectedTx.type === 'sangria' || selectedTx.type === 'pagamento' ? 'text-red-400' : 'text-accent'}`}>
                           {(() => {
                              if (selectedTx.type === 'sale' || (selectedTx.items && Array.isArray(selectedTx.items) && selectedTx.items.length > 0)) {
                                 // Para vendas, mostrar total - desconto
                                 const total = typeof selectedTx.total === 'number' ? selectedTx.total : 0;
                                 return `+ R$ ${((total) / 100).toFixed(2)}`;
                              }
                              else if(selectedTx.type === 'suprimento') {
                                 return `+ R$ ${typeof selectedTx.amount === 'number' ? (selectedTx.amount / 100).toFixed(2) : '0.00'}`;
                              }
                             else  if (selectedTx.type === 'sangria' || selectedTx.type === 'pagamento') {
                                 return `- R$ ${typeof selectedTx.amount === 'number' ? selectedTx.amount.toFixed(2) : '0.00'}`;
                              }
                              return `+ R$ ${typeof selectedTx.amount === 'number' ? selectedTx.amount.toFixed(2) : '0.00'}`;
                           })()}
                        </h3>
                     </div>
                  </div>

                  {/* Seção completa de venda */}
                  {selectedTx.items && selectedTx.items.length > 0 && selectedTx.payments.length > 0 ? (
                     <div className="space-y-6">
                        <div className="p-6 bg-dark-950/80 rounded-2xl border-2 border-dashed border-white/5 space-y-4">
                           <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 border-b border-white/5 pb-2">Produtos Vendidos</h4>
                           {selectedTx.items && Array.isArray(selectedTx.items) && selectedTx.items.length > 0 ? (
                              <div className="space-y-1">
                                 {selectedTx.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center text-sm font-mono">
                                       <span className="text-slate-400"><span className="text-accent">{item.quantity}x</span> {item.product_name_snapshot}</span>
                                       <span className="text-slate-200">R$ {typeof item.line_total === 'number' ? (item.line_total / 100).toFixed(2) : '0.00'}</span>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <p className="text-[10px] text-slate-600 uppercase italic">Nenhum produto vinculado a esta venda.</p>
                           )}
                           <div className="pt-4 border-t border-white/5 flex flex-col gap-2 font-bold">

                              <div className="flex justify-between text-xs">
                                 <span>Descontos Aplicados:</span>
                                 <span className="text-red-400">- R$ {typeof selectedTx.discount_total === 'number' ? (selectedTx.discount_total / 100).toFixed(2) : '0.00'}</span>
                              </div>
                              <div className="flex flex-col gap-1 mt-2">
                                 <span className="text-xs font-bold text-slate-400">Método de Pagamento:</span>
                                 {selectedTx.payments && Array.isArray(selectedTx.payments) && selectedTx.payments.length > 0 ? (
                                    selectedTx.payments.map((pay: any, idx: number) => (
                                       <span key={idx} className="text-xs text-slate-300">{pay.method}: R$ {typeof pay.amount === 'number' ? (pay.amount / 100).toFixed(2) : '0.00'}</span>
                                    ))
                                 ) : (
                                    <span className="text-xs text-slate-300">Não informado</span>
                                 )}
                              </div>
                              <div className="flex flex-col gap-1 mt-2">
                                 <span className="text-xs font-bold text-slate-400">Operador Responsável:</span>
                                 <span className="text-xs text-slate-300">
                                    {selectedTx.metadata?.operator
                                       || operatorName
                                       || session?.operator
                                       || 'Não informado'}
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>
                  ) : (
                     /* Seção para Outras Movimentações (Sangria, Suprimento, Pagamento) */
                     <div className="space-y-6">
                        <div className="p-6 bg-dark-950/50 rounded-2xl border border-white/5 space-y-3">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Justificativa Operacional</p>
                           <p className="text-xs text-slate-300 leading-relaxed italic">"{selectedTx.description}"</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-white/2 rounded-xl border border-white/5">
                              <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Autorizado por</p>
                              <p className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                 <Shield size={12} className="text-accent" /> {selectedTx.metadata?.operator || 'Admin'}
                              </p>
                           </div>
                           <div className="p-4 bg-white/2 rounded-xl border border-white/5">
                              <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Alocação / Categoria</p>
                              <p className="text-xs font-bold text-slate-300 flex items-center gap-2 uppercase tracking-tighter">
                                 <Tag size={12} className="text-accent" /> {selectedTx.category || 'Operacional'}
                              </p>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Rodapé do Modal */}
                  <div className="flex gap-4 pt-4 border-t border-white/5">
                     <Button variant="secondary" className="flex-1 py-4 text-xs font-bold uppercase tracking-widest" onClick={() => setSelectedTx(null)}>Fechar Auditoria</Button>
                     <Button className="flex-1 py-4 text-xs font-bold uppercase tracking-widest shadow-accent-glow" icon={<Printer size={16} />} onClick={() => setIsReceiptPreviewOpen(true)}>Visualizar Recibo</Button>
                  </div>
               </div>
            )}
         </Modal>

         {/* Modal Virtual Receipt */}
         <Modal isOpen={isReceiptPreviewOpen} onClose={() => setIsReceiptPreviewOpen(false)} title="Visualização de Comprovante">
            <div className="flex flex-col items-center gap-6">
               <div className="bg-white text-black p-8 rounded shadow-2xl w-full max-w-[80mm] font-mono receipt-assemble" id="thermal-receipt">
                  {selectedTx && (
                     <>
                        {console.log('selectedTx:', selectedTx)}
                        <div className="text-center mb-4">
                           <h2 className="text-lg font-bold tracking-tighter">NOVABEV POS</h2>
                           <p className="text-[10px]">DISTRIBUIDORA DE BEBIDAS LTDA</p>
                           <div className="border-b border-black border-dashed my-2"></div>
                           <p className="text-[10px] font-bold uppercase">{selectedTx.type === 'sale' ? 'CUPOM FISCAL VIRTUAL' : 'VALE DE CAIXA'}</p>
                           <p className="text-[9px]">{new Date(selectedTx.timestamp).toLocaleString()}</p>
                        </div>
                        {selectedTx.items && Array.isArray(selectedTx.items) && selectedTx.items.length > 0 && (
                           <div className="text-[9px] space-y-1 mb-4">
                              {selectedTx.items.map((item: any, idx: number) => (
                                 <div key={idx} className="flex justify-between">
                                    <span>{item.quantity}x {item.product_name_snapshot}</span>
                                    <span>{typeof item.line_total === 'number' ? (item.line_total / 100).toFixed(2) : '0.00'}</span>
                                 </div>
                              ))}
                           </div>
                        )}
                        <div className="text-[9px] border-t border-black border-dashed pt-2 space-y-1 font-bold">
                           <div className="flex justify-between text-xs"><span>TOTAL:</span><span>R$ {selectedTx.items && Array.isArray(selectedTx.items) ? (selectedTx.items.reduce((sum: number, item: any) => sum + (typeof item.line_total === 'number' ? item.line_total : 0), 0) / 100).toFixed(2) : '0.00'}</span></div>
                        </div>
                     </>
                  )}
               </div>
               <div className="w-full flex gap-4 no-print">
                  <Button variant="secondary" className="flex-1 py-4" icon={<X size={18} />} onClick={() => setIsReceiptPreviewOpen(false)}>Fechar</Button>
                  <Button className="flex-1 py-4 shadow-accent-glow" icon={<Printer size={18} />} onClick={handlePrint}>Imprimir Agora</Button>
               </div>
            </div>
         </Modal>

         {/* Modal de Suprimento componentizado */}
         <SuprimentoModal
            isOpen={isSuprimentoModalOpen}
            onClose={() => {
               setIsSuprimentoModalOpen(false);
               setRefreshFlag(f => f + 1);
            }}
            txCategories={txCategories}
            onCategoryModalOpen={() => setIsTxCategoryModalOpen(true)}
         />

         <Modal isOpen={isSangriaModalOpen} onClose={() => setIsSangriaModalOpen(false)} title="Sangria de Emergência">
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
               <Input
                  label="Valor da Retirada"
                  placeholder="0.00"
                  icon={<DollarSign size={18} className="text-red-400" />}
                  className="bg-dark-950/50 border-red-500/10 text-xl font-mono text-red-400"
               />
               <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 ml-1">Alocação / Categoria</label>
                  <div className="flex gap-2">
                     <select className="flex-1 bg-dark-950/50 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:border-accent outline-none transition-all">
                        {txCategories.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                     <button onClick={() => setIsTxCategoryModalOpen(true)} className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all">
                        <FolderPlus size={18} />
                     </button>
                  </div>
               </div>
               <Input
                  label="Motivo / Destino"
                  placeholder="Ex: Retirada p/ depósito em cofre"
                  icon={<MessageSquare size={16} className="text-slate-500" />}
                  className="bg-dark-950/50"
               />
               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <Button variant="secondary" className="py-4 uppercase text-[10px] font-bold tracking-widest" onClick={() => setIsSangriaModalOpen(false)}>Abortar</Button>
                  <Button className="py-4 uppercase text-[10px] font-bold tracking-widest shadow-red-500/10 bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20" icon={<Zap size={18} />} onClick={() => setIsSangriaModalOpen(false)}>Executar Sangria</Button>
               </div>
            </div>
         </Modal>

         <Modal isOpen={isPagamentoModalOpen} onClose={() => setIsPagamentoModalOpen(false)} title="Quitação de Despesas">
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
               <Input
                  label="Valor do Lançamento"
                  placeholder="0.00"
                  icon={<DollarSign size={18} className="text-amber-500" />}
                  className="bg-dark-950/50 border-amber-500/10 text-xl font-mono text-amber-500"
               />
               <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 ml-1">Alocação / Categoria</label>
                  <div className="flex gap-2">
                     <select className="flex-1 bg-dark-950/50 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:border-accent outline-none transition-all">
                        {txCategories.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                     <button onClick={() => setIsTxCategoryModalOpen(true)} className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 hover:bg-amber-500/20 transition-all">
                        <FolderPlus size={18} />
                     </button>
                  </div>
               </div>
               <Input
                  label="Detalhes da Despesa"
                  placeholder="Ex: Pagamento de fornecedor de gelo"
                  icon={<MessageSquare size={16} className="text-slate-500" />}
                  className="bg-dark-950/50"
               />
               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <Button variant="secondary" className="py-4 uppercase text-[10px] font-bold tracking-widest" onClick={() => setIsPagamentoModalOpen(false)}>Cancelar</Button>
                  <Button className="py-4 uppercase text-[10px] font-bold tracking-widest shadow-amber-500/10 bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20" icon={<CreditCard size={18} />} onClick={() => setIsPagamentoModalOpen(false)}>Efetuar Pagamento</Button>
               </div>
            </div>
         </Modal>

         {/* MODAL CRIAR CATEGORIA DE TRANSAÇÃO */}
         <Modal
            isOpen={isTxCategoryModalOpen}
            onClose={() => setIsTxCategoryModalOpen(false)}
            title="Nova Classificação Financeira"
            size="md"
         >
            <div className="space-y-8 animate-in zoom-in-95 duration-200">
               <div className="p-6 bg-accent/5 rounded-2xl border border-accent/20 flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl text-accent">
                     <Tag size={24} />
                  </div>
                  <div>
                     <h4 className="text-xs font-bold text-white uppercase tracking-widest">Centro de Custo</h4>
                     <p className="text-[10px] text-slate-500">Adicione uma nova alocação para auditoria de caixa.</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <Input
                     label="Nome da Categoria"
                     placeholder="Ex: Manutenção de Equipamentos"
                     value={newTxCategoryName}
                     onChange={e => setNewTxCategoryName(e.target.value)}
                     icon={<FolderPlus size={18} className="text-accent" />}
                     className="bg-dark-950/50 border-accent/10 text-lg font-bold text-slate-100"
                     autoFocus
                     onKeyDown={(e) => e.key === 'Enter' && handleCreateTxCategory()}
                  />
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <Button variant="secondary" className="py-4 uppercase text-[10px] font-bold tracking-widest" onClick={() => setIsTxCategoryModalOpen(false)}>Cancelar</Button>
                  <Button className="py-4 uppercase text-[10px] font-bold tracking-widest shadow-accent-glow" icon={<Check size={18} />} onClick={handleCreateTxCategory} disabled={!newTxCategoryName.trim()}>Salvar Alocação</Button>
               </div>
            </div>
         </Modal>

         <Modal isOpen={isClosureModalOpen} onClose={() => setIsClosureModalOpen(false)} title="Protocolo de Fechamento">
            <div className="space-y-8 animate-in zoom-in-95 duration-200">
               <div className="p-5 bg-dark-950/80 rounded-2xl border border-white/5 space-y-4 shadow-inner">
                  <div className="flex justify-between items-center"><span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Saldo Sistema</span><span className="font-mono text-accent font-bold text-lg">R$ 1.250,45</span></div>
               </div>
               <Input label="Conferência Física" placeholder="0.00" className="text-center text-xl bg-dark-950/50 font-mono text-white" />
               <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" className="flex-1 py-4 uppercase text-[10px] font-bold tracking-widest" onClick={() => setIsClosureModalOpen(false)}>Voltar</Button>
                  <Button className="flex-1 py-4 uppercase text-[10px] font-bold tracking-widest shadow-red-500/20" variant="danger" icon={<Zap size={18} />}>Confirmar Fechamento</Button>
               </div>
            </div>
         </Modal>
      </div>
   );
};

export default CashManagement;
