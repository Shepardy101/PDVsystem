import React from 'react';
import { Modal, Button } from '../UI';
import { Printer, CheckCircle2 } from 'lucide-react';

export interface ReceiptModalProps {
  isOpen: boolean;
  lastSaleData: any;
  onClose: () => void;
  onPrint: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, lastSaleData, onClose, onPrint }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onClose();
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        onPrint();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrint]);
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recibo de Transação">
      <div className="flex flex-col items-center gap-6" >
        <div className="bg-white text-black p-8 rounded shadow-2xl w-full max-w-[80mm] font-mono receipt-assemble" id="thermal-receipt">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold">NOVABEV POS</h2>
            <p className="text-[10px]">DISTRIBUIDORA DE BEBIDAS LTDA</p>
            <div className="border-b border-black border-dashed my-2"></div>
            <p className="text-[10px] font-bold">CUPOM FISCAL VIRTUAL</p>
            <p className="text-[9px]">{new Date().toLocaleString()}</p>
          </div>
          <div className="text-[9px] space-y-1 mb-4 border-b border-black border-dashed pb-2">
            <div className="flex justify-between font-bold">
              <span>ITEM</span>
              <span>TOTAL</span>
            </div>
            {lastSaleData?.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between">
                <span>{item.quantity}x {item.productName}</span>
                <span>{((item.unitPrice / 100) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="text-right text-xs font-bold uppercase">
            Total: R$ {lastSaleData?.total ? (lastSaleData.total / 100).toFixed(2) : '0.00'}
          </div>
          {lastSaleData?.clientName && lastSaleData?.clientCpf && (
            <div className="mt-2 text-[9px] text-right text-black/80 opacity-80">
              <span>Cliente: {lastSaleData.clientName}</span><br />
              <span>CPF: {lastSaleData.clientCpf}</span>
            </div>
          )}
        </div>
        <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4 no-print">
          <Button variant="secondary" className="flex-1 py-4" icon={<Printer size={18} />} onClick={onPrint}>Imprimir [I]</Button>
          <Button autoFocus className="flex-1 py-4 shadow-accent-glow" icon={<CheckCircle2 size={18} />} onClick={onClose}>Finalizar [ENTER]</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
