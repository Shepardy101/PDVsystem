import React, { useState } from 'react';
import { Modal, Input, Button } from '../UI';
import { DollarSign, MessageSquare, FolderPlus, Check } from 'lucide-react';

interface SangriaModalProps {
  isOpen: boolean;
  onClose: (reason?: string) => void;
  txCategories: string[];
  onCategoryModalOpen: () => void;
  operatorId?: string;
  cashSessionId?: string;
  availableCashCents?: number;
  telemetry?: (area: string, action: string, meta?: Record<string, any>) => void;
}

const SangriaModal: React.FC<SangriaModalProps> = ({ isOpen, onClose, txCategories, onCategoryModalOpen, operatorId, cashSessionId, availableCashCents, telemetry }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(txCategories[0] || 'Sangria');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const amountCents = Math.round(parsedAmount * 100);
  const exceedsCash = typeof availableCashCents === 'number' && amountCents > availableCashCents;

  // Reset estado ao abrir
  React.useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDescription('');
      setError('');
      setCategory(txCategories[0] || 'Sangria');
      telemetry?.('modal', 'open', { modal: 'sangria' });
    }
  }, [isOpen, txCategories, telemetry]);

  const handleSubmit = async () => {
    setError('');
    const normalizedCategory = category || 'Sangria';
    const numericAmount = parseFloat(amount.replace(',', '.'));
    const amountCentsSubmit = Math.round(numericAmount * 100);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0 || !normalizedCategory || !description) {
      setError('Preencha todos os campos.');
      telemetry?.('sangria', 'validation-fail', { reason: 'missing-fields' });
      return;
    }
    if (typeof availableCashCents === 'number' && amountCentsSubmit > availableCashCents) {
      setError('Valor excede o saldo disponível em caixa.');
      telemetry?.('sangria', 'validation-fail', { reason: 'exceeds-cash', availableCashCents, amountCents: amountCentsSubmit });
      return;
    }
    telemetry?.('sangria', 'submit-start', { amount: numericAmount, category: normalizedCategory });
    setLoading(true);
    try {
      const response = await fetch('/api/cash/sangria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          category: normalizedCategory,
          description,
          operatorId,
          cashSessionId
        })
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Erro ao registrar sangria.');
          telemetry?.('sangria', 'submit-error', { message: data.error || 'Erro ao registrar sangria.' });
      } else {
          telemetry?.('sangria', 'submit-success', { amount: numericAmount, category: normalizedCategory });
          onClose('success');
      }
    } catch (err) {
      setError('Erro ao registrar sangria.');
        telemetry?.('sangria', 'submit-error', { message: 'network' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sangria de Emergência">
      <div className="space-y-6 animate-in zoom-in-95 duration-200">
        <Input
          label="Valor da Retirada"
          placeholder="0.00"
          icon={<DollarSign size={18} className="text-red-400" />}
          className="bg-dark-950/50 border-red-500/10 text-xl font-mono text-red-400"
          value={amount}
          onChange={e => {
            const sanitized = e.target.value.replace(/[^0-9.,]/g, '');
            setAmount(sanitized);
            telemetry?.('sangria', 'change-amount', { value: sanitized });
          }}
        />
        {typeof availableCashCents === 'number' && (
          <p className="text-[15px] text-slate-500 font-semibold">Saldo disponível: R$ {(availableCashCents / 100).toFixed(2)}</p>
        )}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 ml-1">Alocação / Categoria</label>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-dark-950/50 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:border-accent outline-none transition-all"
              value="Dinheiro"
              disabled
            />
          </div>
        </div>
        <Input
          label="Motivo / Destino"
          placeholder="Ex: Retirada p/ depósito em cofre"
          icon={<MessageSquare size={16} className="text-slate-500" />}
          className="bg-dark-950/50"
          value={description}
          onChange={e => {
            setDescription(e.target.value);
            telemetry?.('sangria', 'change-description');
          }}
        />
        {error && <div className="text-red-500 text-xs font-bold">{error}</div>}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <Button variant="secondary" className="py-4 uppercase text-[10px] font-bold tracking-widest" onClick={() => onClose('cancel')} disabled={loading}>Abortar</Button>
          <Button className="py-4 uppercase text-[10px] font-bold tracking-widest shadow-red-500/10 bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20" icon={<Check size={18}/>} onClick={handleSubmit} disabled={loading || !amount || !category || !description || exceedsCash}>Executar Sangria</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SangriaModal;
