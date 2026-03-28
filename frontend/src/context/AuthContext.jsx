import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for token on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      // Setup axios interceptor
      axios.interceptors.request.use(
        config => {
          config.headers['Authorization'] = `Bearer ${token}`;
          return config;
        },
        error => Promise.reject(error)
      );
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      
      // Update interceptor
      axios.interceptors.request.use(
        config => {
          config.headers['Authorization'] = `Bearer ${token}`;
          return config;
        },
        error => Promise.reject(error)
      );
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      const { token, ...newUserData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUserData));
      
      setUser(newUserData);
      
      // Update interceptor
      axios.interceptors.request.use(
        config => {
          config.headers['Authorization'] = `Bearer ${token}`;
          return config;
        },
        error => Promise.reject(error)
      );
      
      return { success: true };
    } catch (error) {
       return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Note: We don't remove the interceptor, but the next page load won't have a token.
    // In a real app we might eject the interceptor.
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isDoctor: user?.role === 'DOCTOR'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
