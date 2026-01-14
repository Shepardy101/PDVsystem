import React, { useState } from 'react';
import { Modal, Input, Button } from '../UI';
import { DollarSign, MessageSquare, FolderPlus, Check, CreditCard } from 'lucide-react';

interface PagamentoModalProps {
  isOpen: boolean;
  onClose: (reason?: string) => void;
  txCategories: string[];
  onCategoryModalOpen: () => void;
  operatorId?: string;
  cashSessionId?: string;
  paymentLimitCents?: number;
  telemetry?: (area: string, action: string, meta?: Record<string, any>) => void;
}

const PagamentoModal: React.FC<PagamentoModalProps> = ({ isOpen, onClose, txCategories, onCategoryModalOpen, operatorId, cashSessionId, paymentLimitCents, telemetry }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(txCategories[0] || '');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const amountRef = React.useRef<HTMLInputElement>(null);
  const categoryRef = React.useRef<HTMLSelectElement>(null);
  const descriptionRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      telemetry?.('modal', 'open', { modal: 'pagamento' });
      setTimeout(() => amountRef.current?.focus(), 50);
    }
  }, [isOpen, telemetry]);

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const amountCents = Math.round(parsedAmount * 100);
  const exceedsLimit = typeof paymentLimitCents === 'number' && amountCents > paymentLimitCents;
  const isSubmitDisabled = loading || !amount || !category || !description || exceedsLimit;

  const handleSubmit = async () => {
    setError('');
    if (!amount || !category || !description) {
      setError('Preencha todos os campos.');
      telemetry?.('pagamento', 'validation-fail', { reason: 'missing-fields' });
      return;
    }
    const numericAmount = parseFloat(amount.replace(',', '.'));
    const amountCentsSubmit = Math.round((numericAmount || 0) * 100);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Informe um valor válido.');
      telemetry?.('pagamento', 'validation-fail', { reason: 'invalid-value' });
      return;
    }
    if (typeof paymentLimitCents === 'number' && amountCentsSubmit > paymentLimitCents) {
      setError('Valor excede o limite permitido para pagamento nesta sessão.');
      telemetry?.('pagamento', 'validation-fail', { reason: 'exceeds-limit', paymentLimitCents, amountCents: amountCentsSubmit });
      return;
    }
    telemetry?.('pagamento', 'submit-start', { amount: numericAmount, category });
    setLoading(true);
    try {
      const response = await fetch('/api/cash/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount.replace(',', '.')),
          category,
          description,
          operatorId,
          cashSessionId
        })
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Erro ao registrar pagamento.');
          telemetry?.('pagamento', 'submit-error', { message: data.error || 'Erro ao registrar pagamento.' });
      } else {
          telemetry?.('pagamento', 'submit-success', { amount: numericAmount, category });
          onClose('success');
      }
    } catch (err) {
      setError('Erro ao registrar pagamento.');
        telemetry?.('pagamento', 'submit-error', { message: 'network' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quitação de Despesas">
      <div className="space-y-6 animate-in zoom-in-95 duration-200">
        <Input
          label="Valor do Lançamento"
          placeholder="0.00"
          icon={<DollarSign size={18} className="text-amber-500" />}
          className="bg-dark-950/50 border-amber-500/10 text-xl font-mono text-amber-500"
          value={amount}
          ref={amountRef}
          onChange={e => {
            const sanitized = e.target.value.replace(/[^0-9.,]/g, '');
            setAmount(sanitized);
            telemetry?.('pagamento', 'change-amount', { value: sanitized });
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              categoryRef.current?.focus();
            }
          }}
        />
        {typeof paymentLimitCents === 'number' && (
          <p className="text-[10px] text-slate-500 font-semibold">Limite disponível: R$ {(paymentLimitCents / 100).toFixed(2)}</p>
        )}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 ml-1">Alocação / Categoria</label>
          <div className="flex gap-2">
            <select
              ref={categoryRef}
              className="flex-1 bg-dark-950/50 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:border-accent outline-none transition-all"
              value={category}
              onChange={e => setCategory(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  descriptionRef.current?.focus();
                }
              }}
            >
              {txCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="button" onClick={() => { telemetry?.('pagamento', 'open-category-modal'); onCategoryModalOpen(); }} className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 hover:bg-amber-500/20 transition-all">
              <FolderPlus size={18} />
            </button>
          </div>
        </div>
        <Input
          label="Detalhes da Despesa"
          placeholder="Ex: Pagamento de fornecedor de gelo"
          icon={<MessageSquare size={16} className="text-slate-500" />}
          className="bg-dark-950/50"
          value={description}
          ref={descriptionRef}
          onChange={e => {
            setDescription(e.target.value);
            telemetry?.('pagamento', 'change-description');
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (!isSubmitDisabled) {
                handleSubmit();
              }
            }
          }}
        />
        {error && <div className="text-red-500 text-xs font-bold">{error}</div>}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <Button variant="secondary" className="py-4 uppercase text-[10px] font-bold tracking-widest" onClick={() => onClose('cancel')} disabled={loading}>Cancelar</Button>
          <Button className="py-4 uppercase text-[10px] font-bold tracking-widest shadow-amber-500/10 bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20" icon={<CreditCard size={18}/>} onClick={handleSubmit} disabled={isSubmitDisabled}>Efetuar Pagamento</Button>
        </div>
      </div>
    </Modal>
  );
};

export default PagamentoModal;
