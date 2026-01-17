import React from 'react';
import { Button, InputNumber } from '../UI';
import { Unlock, X } from 'lucide-react';

export interface OpeningModalProps {
  isOpen: boolean;
  initialBalance: string;
  onClose: () => void;
  onChange: (value: string) => void;
  onConfirm: () => void;
}

const OpeningModal: React.FC<OpeningModalProps> = ({ isOpen, initialBalance, onClose, onChange, onConfirm }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(0, inputRef.current.value.length);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, onConfirm]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-md cyber-modal-container bg-dark-900/95 rounded-2xl border border-accent/30 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-dark-950/80">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Unlock className="text-accent" size={20} />
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em] assemble-text">Abertura de Caixa</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-accent p-2"><X size={20} /></button>
        </div>
        <div className="p-6 sm:p-8 space-y-6">
          <InputNumber
            label="Saldo Inicial (R$)x "
            value={initialBalance}
            onChange={e => onChange(e.target.value)}
            placeholder="0.00"
            className="text-center text-3xl font-mono text-accent bg-dark-950/50"
            ref={inputRef}
          />
          
          <Button
            onClick={onConfirm}
            className="w-full py-4 sm:py-5 text-[11px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase shadow-accent-glow"
          >
            Liberar Acesso
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OpeningModal;
