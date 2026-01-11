import React from 'react';
import { Modal, Button } from '../UI';
import { AlertTriangle } from 'lucide-react';

interface PermissionDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const PermissionDeniedModal: React.FC<PermissionDeniedModalProps> = ({ isOpen, onClose, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center justify-center p-8">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-500 mb-2">Permissão Negada</h2>
        <p className="text-slate-400 text-center mb-6">{message || 'Você não tem permissão para realizar esta ação.'}</p>
        <Button onClick={onClose} className="w-full py-3 text-xs font-bold uppercase">Fechar</Button>
      </div>
    </Modal>
  );
};

export default PermissionDeniedModal;
