import { AuthUser } from '@/types';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { setSecureItem, getSecureItem } from '../utils/secureStorage';



interface LoginResult { ok: boolean; message?: string; }

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ ok: false }),
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Tenta restaurar usuário do localStorage de forma segura
    const stored = getSecureItem('auth_user');
    if (stored) setUser(stored);
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        let payload: any = {};
        try { payload = await res.json(); } catch {}
        return { ok: false, message: payload?.message || payload?.error || 'Usuário ou senha inválidos' };
      }
      const userData = await res.json();
      setUser(userData);
      setSecureItem('auth_user', userData);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Falha ao autenticar. Tente novamente.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user'); // Remove apenas a chave específica
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
