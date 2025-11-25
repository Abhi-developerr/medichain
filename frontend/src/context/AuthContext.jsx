import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const loadUser = async () => {
    try {
      const { data } = await axios.get('/api/auth/me');
      setUser(data.user);
      setLoading(false);
    } catch (error) {
      console.error('Load user error:', error.response?.data || error.message);
      // Only logout if token is invalid (401), not on network/server errors (500, 503, etc.)
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, logging out');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    }
  };

  // Set axios default headers and load user on mount
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const register = async (userData) => {
    try {
      const { data } = await axios.post('/api/auth/register', userData);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success('Registration successful!');
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const { data } = await axios.post('/api/auth/login', { email, password });
      console.log('Login successful, received token');
      
      // Set token in localStorage first
      localStorage.setItem('token', data.token);
      
      // Set axios header immediately
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // Set user and token in state - this prevents the race condition
      setUser(data.user);
      setToken(data.token);
      
      toast.success('Login successful!');
      return data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isPatient: user?.role === 'patient',
    isDoctor: user?.role === 'doctor',
    isAdmin: user?.role === 'admin',
    API_URL: '/api'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};