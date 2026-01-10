import React, { useEffect, useRef } from 'react';
import { Modal, Input, Button } from '../UI';

interface SubtotalModalProps {
  isOpen: boolean;
  initialValue: number;
  onClose: () => void;
  onConfirm: (newSubtotal: number) => void;
}

export const SubtotalModal: React.FC<SubtotalModalProps> = ({ isOpen, initialValue, onClose, onConfirm }) => {
  const [value, setValue] = React.useState(initialValue.toFixed(2));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue.toFixed(2));
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, initialValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      const parsed = parseFloat(value.replace(',', '.'));
      if (!isNaN(parsed) && parsed >= 0) {
        onConfirm(parsed);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajustar Subtotal da Venda" size="sm">
      <div className="space-y-6 p-6">
        <label className="block text-xs font-bold uppercase tracking-widest text-accent mb-2">Novo Subtotal (R$)</label>
        <Input
          ref={inputRef}
          type="number"
          min={0}
          step={0.01}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-lg font-mono border-accent/40 bg-dark-950/60"
          autoFocus
        />
        <div className="flex gap-4 pt-4">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" onClick={() => {
            const parsed = parseFloat(value.replace(',', '.'));
            if (!isNaN(parsed) && parsed >= 0) {
              onConfirm(parsed);
            }
          }}>Confirmar</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SubtotalModal;
