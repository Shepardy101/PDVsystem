import React, { useRef } from 'react';
import { Button, Input } from '../UI';

export interface DiscountModalProps {
  isOpen: boolean;
  tempDiscount: string;
  onClose: () => void;
  onChange: (value: string) => void;
  onApply: () => void;
}

const DiscountModal: React.FC<DiscountModalProps> = ({ isOpen, tempDiscount, onClose, onChange, onApply }) => {
  const discountInputRef = useRef<HTMLInputElement>(null);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-md cyber-modal-container bg-dark-900/95 rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 bg-dark-950/80 rounded-2xl border border-white/10">
          <Input
            ref={discountInputRef}
            label="Crédito de Desconto (R$)"
            type="number"
            step="0.01"
            className="text-center text-3xl font-mono text-accent"
            value={tempDiscount}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onApply()}
          />
        </div>
        <div className="flex gap-4 p-6">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" onClick={onApply}>Injetar Desconto</Button>
        </div>
      </div>
    </div>
  );
};

export default DiscountModal;
