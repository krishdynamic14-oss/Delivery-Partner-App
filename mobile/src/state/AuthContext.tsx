import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import type { LoginPayload, Partner } from '../types';
import { clearPartner, loadPartner, savePartner } from '../services/storage';
import { loginWithPhone } from '../services/api';
import { setupPushNotifications, unregisterPushNotifications } from '../services/notifications';

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
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    loadPartner().then(setUser).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let active = true;
    if (!user) {
      setExpoPushToken(null);
      return undefined;
    }

    setupPushNotifications(user)
      .then((token) => {
        if (active) setExpoPushToken(token);
      })
      .catch(() => {
        if (active) setExpoPushToken(null);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const value = useMemo<AuthState>(() => ({
    user,
    loading,
    async login(payload: LoginPayload) {
      const partner = await loginWithPhone(payload);
      await savePartner(partner);
      setUser(partner);
    },
    async logout() {
      await unregisterPushNotifications(expoPushToken, user?.token);
      await clearPartner();
      setExpoPushToken(null);
      setUser(null);
    },
  }), [expoPushToken, loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
