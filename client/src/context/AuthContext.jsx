import { useEffect, useState } from 'react';
import { AuthContext } from './authContextDef';
import api from '../services/api';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('glow_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem('glow_token'));

  useEffect(() => {
    if (!token) return;

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('glow_token');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('glow_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('glow_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const logout = () => {
    localStorage.removeItem('glow_token');
    setToken(null);
    setUser(null);
  };

  const updateSkinProfile = async (profileData) => {
    const res = await api.put('/auth/skin-profile', profileData);
    const updatedUser = res.data.user;
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateSkinProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
