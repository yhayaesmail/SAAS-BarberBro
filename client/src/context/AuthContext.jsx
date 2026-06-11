import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext();

function setTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem('km-barber-token', accessToken);
  else localStorage.removeItem('km-barber-token');
  if (refreshToken) localStorage.setItem('km-barber-refresh', refreshToken);
  else localStorage.removeItem('km-barber-refresh');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('km-barber-token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/profile');
      setUser(res.data);
    } catch {
      setTokens(null, null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    setTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    setTokens(null, null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}