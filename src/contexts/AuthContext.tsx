import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthService } from '../api/services';
import type { UserRead } from '../types';
import { AuthContext } from './auth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRead | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        // Try silent refresh if no token but cookie exists
        const res = await AuthService.refresh();
        localStorage.setItem('access_token', res.access_token);
      }
      const userRes = await AuthService.getMe();
      setUser(userRes);
    } catch {
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void checkAuth();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const login = async (access_token: string) => {
    localStorage.setItem('access_token', access_token);
    try {
      const userRes = await AuthService.getMe();
      setUser(userRes);
    } catch (err) {
      console.error('Failed to fetch user after login', err);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (err) {
      console.error('Failed to logout on server', err);
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
