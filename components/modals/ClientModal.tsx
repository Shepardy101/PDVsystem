import React, { useRef , useEffect } from 'react';
import { Users, X } from 'lucide-react';

export interface ClientModalProps {
  isOpen: boolean;
  clientSearch: string;
  clientResults: any[];
 selectedClientIndex: number;
setSelectedClientIndex: React.Dispatch<React.SetStateAction<number>>;

  onClose: () => void;
  onSearch: (value: string) => void;
  onSelect: (client: any) => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, clientSearch, clientResults, selectedClientIndex, setSelectedClientIndex, onClose, onSearch, onSelect }) => {
  const clientInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => clientInputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-md cyber-modal-container bg-dark-900/95 rounded-2xl border border-accent/30 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-dark-950/80">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Users className="text-accent" size={20} />
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em] assemble-text">Vincular Cliente</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-accent p-2"><X size={20} /></button>
        </div>
        <div className="p-6 sm:p-8 space-y-4 max-h-[70vh] overflow-y-auto">
          <input
  ref={clientInputRef}
  type="text"
  className="w-full bg-dark-950/50 border border-white/10 rounded-lg py-3 px-4 text-slate-100 outline-none text-lg focus:border-accent transition-all"
  placeholder="Buscar cliente por nome ou CPF..."
  value={clientSearch}
  onChange={e => onSearch(e.target.value)}
  onKeyDown={e => {
    if (clientResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedClientIndex(prev => (prev + 1) % clientResults.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedClientIndex(prev => (prev - 1 + clientResults.length) % clientResults.length);
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const client = clientResults[selectedClientIndex];
      if (client) {
        onSelect(client);
        onClose();
      }
    }
  }}
/>

          <div className="max-h-60 overflow-y-auto divide-y divide-white/5 mt-2">
            {clientResults.length === 0 && <div className="text-slate-500 text-sm text-center py-6">Nenhum cliente encontrado</div>}
            {clientResults.map((c, idx) => (
              <button
                key={c.id}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${idx === selectedClientIndex ? 'bg-accent/10 text-accent' : 'hover:bg-white/5 text-slate-200'}`}
                onMouseDown={e => {
                  e.preventDefault();
                  onSelect(c);
                  onClose();
                }}
              >
                <div className="font-bold text-base">{c.name}</div>
                <div className="text-xs text-slate-400">CPF: {c.cpf}</div>
                <div className="text-xs text-slate-400">{c.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;
