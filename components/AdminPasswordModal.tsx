// c:/PDVsystem/components/AdminPasswordModal.tsx
import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/settings/admin_password');
      if (!res.ok) {
        const body = await res.text();
        console.error('[AdminPasswordModal] Erro API admin_password', res.status, body);
        setError('Erro ao validar senha.');
        return;
      }
      const data = await res.json();
      if (data.value === password) {
        onSuccess();
        setPassword('');
        onClose();
      } else {
        console.warn('[AdminPasswordModal] Senha incorreta. Valor API:', data.value);
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
      <form onSubmit={handleSubmit} className="space-y-6 p-6" autoComplete="off">
        <Input
          type="password"
          label="Senha Administrador"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          autoFocus
          name="admin-new-password"
          autoComplete="new-password"
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
