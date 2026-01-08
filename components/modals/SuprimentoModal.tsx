import React from "react";
import { DollarSign, FolderPlus, MessageSquare, Check } from "lucide-react";
import { Button, Input, Modal } from "../UI";


interface SuprimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  txCategories: string[];
  onCategoryModalOpen: () => void;
}


const SuprimentoModal: React.FC<SuprimentoModalProps> = ({
  isOpen,
  onClose,
  txCategories,
  onCategoryModalOpen,
}) => {
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState(txCategories[0] || '');
  const [description, setDescription] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setAmount('');
      setCategory(txCategories[0] || '');
      setDescription('');
      setError('');
    }
  }, [isOpen, txCategories]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cash/suprimento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'suprimento',
          amount: parseFloat(amount),
          category,
          description,
        }),
      });
      if (!res.ok) throw new Error('Erro ao registrar suprimento');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Injeção de Suprimento">
      <div className="space-y-6 animate-in zoom-in-95 duration-200">
        <Input 
          label="Montante de Injeção" 
          placeholder="0.00" 
          icon={<DollarSign size={18} className="text-blue-400" />} 
          className="bg-dark-950/50 border-blue-500/10 text-xl font-mono text-blue-400" 
          value={amount}
          onChange={e => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
        />
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 ml-1">Alocação / Categoria</label>
          <div className="flex gap-2">
            <select className="flex-1 bg-dark-950/50 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:border-accent outline-none transition-all" value={category} onChange={e => setCategory(e.target.value)}>
              {txCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="button" onClick={onCategoryModalOpen} className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/20 transition-all">
              <FolderPlus size={18} />
            </button>
          </div>
        </div>
        <Input 
          label="Descrição / Origem" 
          placeholder="Ex: Reforço de troco p/ turno vespertino" 
          icon={<MessageSquare size={16} className="text-slate-500" />}
          className="bg-dark-950/50" 
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        {error && <div className="text-red-500 text-xs font-bold">{error}</div>}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <Button variant="secondary" className="py-4 uppercase text-[10px] font-bold tracking-widest" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button className="py-4 uppercase text-[10px] font-bold tracking-widest shadow-blue-500/10 bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20" icon={<Check size={18}/>} onClick={handleSubmit} disabled={loading || !amount || !category || !description}>Confirmar Entrada</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SuprimentoModal;
