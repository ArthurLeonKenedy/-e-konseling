"use client";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/apiFetch';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load dari localStorage terlebih dahulu (cepat, tidak ada delay)
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('api_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);

      // Re-validasi & sinkronisasi profil dari server di background
      // Ini memastikan data seperti foto, hobi, dll. selalu up-to-date
      apiFetch('/api/me')
        .then(res => {
          if (res.ok) return res.json();
          // Token kadaluarsa — paksa logout
          localStorage.removeItem('user');
          localStorage.removeItem('api_token');
          setUser(null);
          setToken(null);
          return null;
        })
        .then(data => {
          if (data?.success && data?.data) {
            // Update data user dengan data terbaru dari database
            const freshUser = { ...JSON.parse(localStorage.getItem('user') || '{}'), ...data.data };
            localStorage.setItem('user', JSON.stringify(freshUser));
            setUser(freshUser);
          }
        })
        .catch(() => {
          // Jika server tidak bisa dihubungi, biarkan data localStorage yang dipakai
          // agar UX tidak terganggu saat koneksi lambat
        });
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

  // Fungsi untuk refresh paksa data profil dari server (dipanggil manual jika perlu)
  const refreshUser = useCallback(async () => {
    try {
      const res = await apiFetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.data) {
          const freshUser = { ...user, ...data.data };
          localStorage.setItem('user', JSON.stringify(freshUser));
          setUser(freshUser);
        }
      }
    } catch (e) {
      console.error("Refresh user error", e);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, isInitializing, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

