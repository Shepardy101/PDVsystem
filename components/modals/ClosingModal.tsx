import React from 'react';
import { Button, Input } from '../UI';
import { X, Lock, ShoppingCart, DollarSign, CreditCard, Landmark, ArrowDownCircle, ArrowUpCircle, QrCode } from 'lucide-react';

export interface ClosingModalProps {
  isOpen: boolean;
  physicalCashInput: string;
  closeError: string;
  closeLoading: boolean;
  closeResult: any;
  onClose: () => void;
  onInputChange: (value: string) => void;
  onConfirm: () => void;
}

const ClosingModal: React.FC<ClosingModalProps> = ({ isOpen, physicalCashInput, closeError, closeLoading, closeResult, onClose, onInputChange, onConfirm }) => {
    // Estado para expandir/recolher vendas
    const [expandedSale, setExpandedSale] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (closeResult) {
          onClose();
        } else {
          onConfirm();
        }
      }
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onClose, closeResult]);
 
  // Abas: 0 = Resumo, 1 = Vendas
  const [tab, setTab] = React.useState(0);
  // Quantidade total de unidades de produtos vendidos (soma das quantidades de todos os itens de todas as vendas)
  const totalItensVendidos = closeResult?.sales?.reduce((acc: number, venda: any) => {
    if (Array.isArray(venda.items)) {
      return acc + venda.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    }
    return acc;
  }, 0);
  // Função para ícone de pagamento
  const getPaymentIcon = (tipo: string) => {
    if (tipo === 'dinheiro') return <DollarSign className="text-emerald-400" size={18} title="Dinheiro" />;
    if (tipo === 'pix') return <QrCode className="text-cyan-400" size={18} title="Pix" />;
    if (tipo === 'cartao') return <CreditCard className="text-indigo-400" size={18} title="Cartão" />;
    return <Landmark className="text-accent" size={18} title="Outro" />;
  };
  // Função para ícone de operação
  const getOperationIcon = (tipo: string) => {
    if (tipo === 'suprimento') return <ArrowUpCircle className="text-blue-400" size={18} title="Suprimento" />;
    if (tipo === 'sangria') return <ArrowDownCircle className="text-orange-400" size={18} title="Sangria" />;
    if (tipo === 'pagamento') return <CreditCard className="text-pink-400" size={18} title="Pagamento" />;
    return null;
  };


   if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in slide-in-from-top-8 duration-400">
      <div className="absolute inset-0 bg-dark-950/90 backdrop-blur-xl transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-4xl cyber-modal-container bg-dark-900/95 rounded-2xl border-2 border-accent/40 shadow-accent-glow flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-400">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-accent/20 bg-dark-950/80">
          <div className="flex items-center gap-4">
            <Lock className="text-accent" size={28} />
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Operador</div>
              <div className="text-lg font-mono text-accent">{closeResult?.operatorId}</div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Abertura</span>
              <span className="text-sm font-mono text-white">{closeResult ? new Date(closeResult.openedAt).toLocaleString() : '--'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Fechamento</span>
              <span className="text-sm font-mono text-white">{closeResult ? new Date(closeResult.closedAt).toLocaleString() : '--'}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-accent p-2"><X size={24} /></button>
        </div>
        {/* Abas */}
        <div className="flex border-b border-accent/20 bg-dark-950/70">
          <button className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all ${tab === 0 ? 'text-accent border-b-2 border-accent' : 'text-slate-400 hover:text-accent'}`} onClick={() => setTab(0)}>
            Resumo
          </button>
          <button className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all ${tab === 1 ? 'text-accent border-b-2 border-accent' : 'text-slate-400 hover:text-accent'}`} onClick={() => setTab(1)}>
            Vendas do Turno
          </button>
        </div>
        <div className="px-8 py-6">
          {!closeResult ? (
            <div className="flex flex-col gap-6 sm:gap-8 items-center">
              <Input
                label="Valor físico contado (R$)"
                value={physicalCashInput}
                onChange={e => onInputChange(e.target.value)}
                placeholder="0.00"
                className="text-center text-4xl font-mono text-accent bg-dark-950/50 border-2 border-accent/30 rounded-xl py-6"
                autoFocus
              />
              {closeError && <div className="text-red-500 text-base text-center font-bold animate-pulse">{closeError}</div>}
              <Button
                onClick={onConfirm}
                className="w-full py-5 sm:py-6 text-base sm:text-lg font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase shadow-accent-glow rounded-xl"
                disabled={closeLoading}
              >
                {closeLoading ? 'Processando...' : 'Confirmar Fechamento'}
              </Button>
            </div>
          ) : (
            <>
              {tab === 0 && (
                <div className="flex flex-row gap-8">
                  {/* Coluna esquerda: cards */}
                  <div className="flex-1 flex flex-col gap-4 justify-center">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-dark-950/80 rounded-xl border border-accent/20 p-4 flex flex-col items-center justify-center shadow-lg">
                        <span className="text-xs text-slate-400 font-bold uppercase mb-1">Saldo Inicial</span>
                        <span className="text-2xl font-mono text-accent">R$ {(closeResult.initialBalance/100).toFixed(2)}</span>
                      </div>
                      <div className="bg-dark-950/80 rounded-xl border border-accent/20 p-4 flex flex-col items-center justify-center shadow-lg">
                        <span className="text-xs text-slate-400 font-bold uppercase mb-1">Valor Contado</span>
                        <span className="text-2xl font-mono text-white">R$ {(closeResult.physicalCount/100).toFixed(2)}</span>
                      </div>
                      <div className="bg-dark-950/80 rounded-xl border border-accent/20 p-4 flex flex-col items-center justify-center shadow-lg">
                        <span className="text-xs text-slate-400 font-bold uppercase mb-1">Total de Vendas</span>
                        <span className="text-2xl font-mono text-white">R$ {(closeResult.totalVendas/100).toFixed(2)}</span>
                      </div>
                      <div className="bg-dark-950/80 rounded-xl border border-accent/20 p-4 flex flex-col items-center justify-center shadow-lg">
                        <span className="text-xs text-slate-400 font-bold uppercase mb-1">Vendas em Dinheiro</span>
                        <span className="text-2xl font-mono text-accent">R$ {((closeResult.totalVendasCash ?? 0) / 100).toFixed(2)}</span>
                      </div>
                      <div className="bg-dark-950/80 rounded-xl border border-accent/20 p-4 flex flex-col items-center justify-center shadow-lg">
                        <span className="text-xs text-slate-400 font-bold uppercase mb-1">Itens Vendidos</span>
                        <span className="text-2xl font-mono text-emerald-400 flex items-center gap-2"><ShoppingCart size={22} />{totalItensVendidos || 0}</span>
                      </div>
                      <div className={`rounded-xl border p-4 flex flex-col items-center justify-center shadow-lg transition-all duration-300 ${closeResult.difference === 0 ? 'border-accent/40 bg-dark-950/60' : closeResult.difference < 0 ? 'border-red-500 bg-red-900/30' : 'border-emerald-400 bg-emerald-900/30'}`}>
                        <span className="text-xs font-bold uppercase mb-1 text-slate-400">Diferença</span>
                        <span className={`text-2xl font-mono font-bold ${closeResult.difference === 0 ? 'text-accent' : closeResult.difference < 0 ? 'text-red-500' : 'text-emerald-400'}`}>R$ {(closeResult.difference/100).toFixed(2)}</span>
                      </div>
                    </div>
                    {/* Legenda/alerta de diferença */}
                    <div className="flex items-center gap-3 mt-2 px-2">
                      {closeResult.difference !== 0 ? (
                        <>
                          <span className={`rounded-full p-2 ${closeResult.difference < 0 ? 'bg-red-500/20 text-red-500' : 'bg-emerald-400/20 text-emerald-400'}`}>
                            <Lock size={16} />
                          </span>
                          <span className={`text-xs font-bold ${closeResult.difference < 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                            {closeResult.difference < 0 ? 'Atenção: Diferença negativa no fechamento do caixa!' : 'Fechamento com sobra de caixa.'}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-accent">Fechamento sem diferença.</span>
                      )}
                    </div>
                    <div className="flex justify-end mt-6">
                      <Button onClick={onClose} className="px-8 py-4 text-lg font-bold shadow-accent-glow rounded-xl transition-all duration-300 hover:scale-105">Fechar [ENTER]</Button>
                    </div>
                  </div>
                </div>
              )}
              {tab === 1 && (
                <div className="w-full max-h-[480px] overflow-y-auto bg-dark-900/80 rounded-xl border border-accent/20 p-4 shadow-lg animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col">
                  <h4 className="text-base font-bold text-accent mb-4">Vendas do Turno</h4>
                  <ul className="text-xs text-slate-300 space-y-4">
                    {closeResult.sales.map((s: any, idx: number) => (
                      <React.Fragment key={s.id}>
                        <li
                          className="border-b border-accent/10 pb-2 cursor-pointer hover:bg-accent/5 rounded transition-all"
                          onClick={() => setExpandedSale(expandedSale === s.id ? null : s.id)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-accent">#{idx+1}</span>
                            <span className="font-mono text-white">Venda {s.id.slice(0, 8)}...</span>
                            <span className="font-mono text-accent">R$ {(s.total/100).toFixed(2)}</span>
                            <span className="font-mono text-emerald-400 flex items-center gap-1"><ShoppingCart size={14} />{(s.items ? s.items.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) : 0)}</span>
                            <span className="font-mono text-slate-400 ml-2">{s.timestamp ? new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                            <span className="ml-auto text-[10px] text-slate-500">{expandedSale === s.id ? 'Clique para recolher' : 'Clique para expandir'}</span>
                          </div>
                          {/* Pagamentos detalhados */}
                          {s.payments && s.payments.length > 0 && (
                            <div className="ml-6 mt-1 flex flex-wrap gap-2">
                              <span className="text-[11px] text-slate-400 font-bold">Pagamentos:</span>
                              {s.payments.map((pay: any, i: number) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-dark-950/60 border border-accent/10 font-mono">
                                  {getPaymentIcon(pay.method)}
                                  <span className="capitalize">{pay.method}</span>
                                  <span>R$ {(pay.amount/100).toFixed(2)}</span>
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Produtos vendidos - expandido */}
                          {expandedSale === s.id && s.items && s.items.length > 0 && (
                            (() => {
                              console.log('Venda expandida:', s.id, 'Itens:', s.items);
                              return (
                                <div className="ml-6 mt-2">
                                  <span className="text-[11px] text-slate-400 font-bold">Produtos:</span>
                                  <ul className="ml-2">
                                    {Array.isArray(s.items) && s.items.length > 0 ? s.items.map((p: any, idx: number) => (
                                      <li key={p.id || idx} className="text-[11px] text-slate-300 flex gap-4 items-center">
                                        <span className="font-mono text-slate-400">{p.product_internal_code_snapshot || p.codigo || '-'}</span>
                                        <span className="font-mono text-accent">{p.product_name_snapshot || p.nome}</span>
                                        <span className="font-mono text-emerald-400">x{p.quantity}</span>
                                        <span className="font-mono text-slate-400">R$ {(p.line_total/100).toFixed(2)}</span>
                                      </li>
                                    )) : <li className="text-[11px] text-red-400">Nenhum item encontrado nesta venda.</li>}
                                  </ul>
                                </div>
                              );
                            })()
                          )}
                          {/* Suprimentos, sangrias, pagamentos */}
                          {s.tipoOperacao && (
                            <div className="ml-6 mt-1 flex items-center gap-2">
                              {getOperationIcon(s.tipoOperacao)}
                              <span className="text-[11px] font-bold text-slate-400">{s.tipoOperacao.charAt(0).toUpperCase() + s.tipoOperacao.slice(1)}</span>
                            </div>
                          )}
                        </li>
                      </React.Fragment>
                    ))}
                  </ul>
                </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClosingModal;
