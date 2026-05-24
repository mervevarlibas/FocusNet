import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { appApi, authApi, setToken, type MeResponse, type User } from '../api/client';
import { useTheme } from '../theme/ThemeContext';

type AuthContextValue = {
  user: User | null;
  me: MeResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setMode } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const data = await appApi.me();
      setMe(data);
      setUser(data.user);
      if (data.user.theme === 'light' || data.user.theme === 'dark') {
        setMode(data.user.theme);
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'SESSION_EXPIRED') {
        await setToken(null);
        setUser(null);
        setMe(null);
      }
      throw e;
    }
  }, [setMode]);

  useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } catch {
        setUser(null);
        setMe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token, user: u } = await authApi.login(email, password);
      await setToken(token);
      setUser(u);
      await refreshMe();
    },
    [refreshMe]
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      const { token, user: u } = await authApi.register(email, password, displayName);
      await setToken(token);
      setUser(u);
      await refreshMe();
    },
    [refreshMe]
  );

  const logout = useCallback(async () => {
    await setToken(null);
    setUser(null);
    setMe(null);
  }, []);

  const value = useMemo(
    () => ({ user, me, loading, login, register, logout, refreshMe }),
    [user, me, loading, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider içinde kullanılmalı');
  return ctx;
}
