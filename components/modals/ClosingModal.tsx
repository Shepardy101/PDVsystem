import React from 'react';
import { Button, Input } from '../UI';
import { X, Lock } from 'lucide-react';

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
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onClose, closeResult]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-md cyber-modal-container bg-dark-900/95 rounded-2xl border border-accent/30 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-dark-950/80">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <Lock className="text-red-400" size={20} />
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em] assemble-text">Fechamento de Caixa</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-accent p-2"><X size={20} /></button>
        </div>
        <div className="p-8 space-y-6">
          {!closeResult ? (
            <>
              <Input
                label="Valor físico contado (R$)"
                value={physicalCashInput}
                onChange={e => onInputChange(e.target.value)}
                placeholder="0.00"
                className="text-center text-3xl font-mono text-accent bg-dark-950/50"
                autoFocus
              />
              {closeError && <div className="text-red-500 text-sm text-center">{closeError}</div>}
              <Button
                onClick={onConfirm}
                className="w-full py-5 text-xs font-bold tracking-[0.2em] uppercase shadow-accent-glow"
                disabled={closeLoading}
              >
                {closeLoading ? 'Processando...' : 'Confirmar Fechamento'}
              </Button>
            </>
          ) : (
            <div className="mt-6 p-4 bg-dark-950/60 rounded-xl border border-accent/20">
              <h3 className="text-lg font-bold text-accent mb-2">Resumo do Fechamento</h3>
              <p className="text-sm text-slate-300">Operador: <span className="font-bold">{closeResult.operatorId}</span></p>
              <p className="text-sm text-slate-300">Abertura: <span className="font-mono">{new Date(closeResult.openedAt).toLocaleString()}</span></p>
              <p className="text-sm text-slate-300">Fechamento: <span className="font-mono">{new Date(closeResult.closedAt).toLocaleString()}</span></p>
              <p className="text-sm text-slate-300">Saldo Inicial: <span className="font-mono">R$ {(closeResult.initialBalance/100).toFixed(2)}</span></p>
              <p className="text-sm text-slate-300">Valor Contado: <span className="font-mono">R$ {(closeResult.physicalCount/100).toFixed(2)}</span></p>
              <p className="text-sm text-slate-300">Total de Vendas: <span className="font-mono">R$ {(closeResult.totalVendas/100).toFixed(2)}</span></p>
              <p className="text-sm text-slate-300">
                Total de Vendas em Dinheiro: 
                <span className="font-mono">
                  R$ {((closeResult.totalVendasCash ?? 0) / 100).toFixed(2)}
                </span>
              </p>
              <p className="text-sm text-slate-300">Diferença: <span className="font-mono">R$ {(closeResult.difference/100).toFixed(2)}</span></p>
              <div className="mt-2">
                <h4 className="text-sm font-bold text-accent mb-1">Vendas do Turno:</h4>
                <ul className="text-xs text-slate-400 max-h-32 overflow-y-auto">
                  {closeResult.sales.map((s: any) => (
                    <li key={s.id} className="mb-1">Venda #{s.id} - R$ {(s.total/100).toFixed(2)}</li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={onClose} className="px-6 py-3 text-xs font-bold shadow-accent-glow">Fechar [ENTER]</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClosingModal;
