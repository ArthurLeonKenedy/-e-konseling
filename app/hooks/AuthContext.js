"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiFetch } from '../../lib/apiFetch';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load from localStorage on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('api_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setIsInitializing(false);
  }, []);

  const login = (userData, apiToken) => {
    localStorage.setItem('user', JSON.stringify(userData));
    if (apiToken) localStorage.setItem('api_token', apiToken);
    setUser(userData);
    if (apiToken) setToken(apiToken);
  };

  const logout = async () => {
    try {
      if (token) {
        await apiFetch('/api/logout', { method: 'POST' });
      }
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('api_token');
      setUser(null);
      setToken(null);
      router.replace('/');
    }
  };

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, isInitializing, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
