import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import type { LoginPayload, Partner } from '../types';
import { clearPartner, loadPartner, savePartner } from '../services/storage';
import { loginWithPhone } from '../services/api';

type AuthState = {
  user: Partner | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartner().then(setUser).finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthState>(() => ({
    user,
    loading,
    async login(payload: LoginPayload) {
      const partner = await loginWithPhone(payload);
      await savePartner(partner);
      setUser(partner);
    },
    async logout() {
      await clearPartner();
      setUser(null);
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
