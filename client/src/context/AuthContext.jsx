import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('krishi_user') || 'null'));
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('krishi_token');
    if (!token) return setLoading(false);
    api.get('/auth/me').then(({ data }) => setUser(data.data.user)).catch(() => {
      localStorage.removeItem('krishi_token'); localStorage.removeItem('krishi_user'); setUser(null);
    }).finally(() => setLoading(false));
  }, []);
  const value = useMemo(() => ({
    user, loading,
    login: (payload) => { localStorage.setItem('krishi_token', payload.token); localStorage.setItem('krishi_user', JSON.stringify(payload.user)); setUser(payload.user); },
    logout: () => { localStorage.removeItem('krishi_token'); localStorage.removeItem('krishi_user'); setUser(null); },
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
