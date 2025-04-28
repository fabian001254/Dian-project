import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api.config';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
    nit: string;
    isAuthorized: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyId: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state - verificamos si hay una sesión guardada
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        // Restaurar la sesión del usuario
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        
        // Configurar el header de autorización para las peticiones
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (error) {
        // Si hay algún error al parsear el usuario, limpiamos todo
        console.error('Error al restaurar la sesión:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Store in state
        setToken(token);
        setUser(user);
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Set default Authorization header for all requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        throw new Error(response.data.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      console.error('Error de autenticación:', error, 'Response:', error.response, 'Request:', error.request);
      setError(error.response?.data?.message || error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/register', userData);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Store in state
        setToken(token);
        setUser(user);
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Set default Authorization header for all requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        throw new Error(response.data.message || 'Error al registrarse');
      }
    } catch (error: any) {
      console.error('Error de registro de usuario:', error, 'Response:', error.response, 'Request:', error.request);
      setError(error.response?.data?.message || error.message || 'Error al registrarse');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear Authorization header
    delete api.defaults.headers.common['Authorization'];
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
    register,
    error,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
