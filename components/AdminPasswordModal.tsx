import React, { useState } from 'react';
import { Modal, Input, Button } from './UI';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/settings/admin_password');
      const data = await res.json();
      if (data.value === password) {
        onSuccess();
        setPassword('');
        onClose();
      } else {
        setError('Senha incorreta. Tente novamente.');
      }
    } catch {
      setError('Erro ao validar senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Autenticação Administrador" size="sm">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <Input
          type="password"
          label="Senha Administrador"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoFocus
          required
        />
        {error && <div className="text-red-500 text-xs font-bold">{error}</div>}
        <div className="flex gap-4 pt-2">
          <Button variant="secondary" type="button" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" className="flex-1" loading={loading}>Confirmar</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminPasswordModal;
