import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('blum_token'));
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const fetchUser = useCallback(async () => {
    const storedToken = localStorage.getItem('blum_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
      setToken(storedToken);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Only logout if it's an auth error
      if (error.response?.status === 401) {
        localStorage.removeItem('blum_token');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      fetchUser();
    }
  }, [fetchUser]);

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { access_token, user: userData } = response.data;
    
    localStorage.setItem('blum_token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setToken(access_token);
    setUser(userData);
    
    return userData;
  };

  const register = async (email, password, name, role = 'user') => {
    const response = await axios.post(`${API}/auth/register`, { 
      email, 
      password, 
      name,
      role 
    });
    const { access_token, user: userData } = response.data;
    
    localStorage.setItem('blum_token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setToken(access_token);
    setUser(userData);
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('blum_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
