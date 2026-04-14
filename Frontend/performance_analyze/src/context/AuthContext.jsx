import { useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { AuthContext } from './authContextInstance';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const { data } = await authService.login({ email, password });
    localStorage.setItem('isp_token', data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = () => {
    localStorage.removeItem('isp_token');
    setUser(null);
  };

  const refreshProfile = async () => {
    const token = localStorage.getItem('isp_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await authService.me();
      setUser(data.data.user);
    } catch {
      localStorage.removeItem('isp_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshProfile,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
