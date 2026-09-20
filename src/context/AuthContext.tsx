import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, setAuthToken, clearAuthToken } from '../services/api';

interface User {
  id: string;
  email: string;
  role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: 'CANDIDATE' | 'RECRUITER' | 'ADMIN') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('skillproof_token');
    if (storedToken) {
      setTokenState(storedToken);
      setAuthToken(storedToken);
      // Verify token by fetching current user
      apiClient.get<User>('/api/auth/me')
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          // Token invalid, clear it
          clearAuthToken();
          setTokenState(null);
          localStorage.removeItem('skillproof_token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/api/auth/login', {
        email,
        password,
      });

      const { user: userData, token: newToken } = response.data;
      setUser(userData);
      setTokenState(newToken);
      setAuthToken(newToken);
      localStorage.setItem('skillproof_token', newToken);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN' = 'RECRUITER'
  ) => {
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/api/auth/register', {
        email,
        password,
        role,
      });

      const { user: userData, token: newToken } = response.data;
      setUser(userData);
      setTokenState(newToken);
      setAuthToken(newToken);
      localStorage.setItem('skillproof_token', newToken);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setTokenState(null);
    clearAuthToken();
    localStorage.removeItem('skillproof_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
