import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/apiClient';
import { AuthContextType, AuthState, LoginFormData, RegisterFormData, User } from '../types';

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial auth state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const userJson = await AsyncStorage.getItem('user');
        
        if (token && userJson) {
          const user = JSON.parse(userJson) as User;
          setState({
            isAuthenticated: true,
            user,
            loading: false,
            error: null,
          });
        } else {
          setState({
            ...initialState,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setState({
          ...initialState,
          loading: false,
        });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginFormData) => {
    setState({
      ...state,
      loading: true,
      error: null,
    });

    try {
      const { access_token } = await authAPI.login(credentials);
      await AsyncStorage.setItem('access_token', access_token);
      
      // Get user data
      const user = await authAPI.getCurrentUser();
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      setState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      setState({
        ...state,
        loading: false,
        error: error.response?.data?.detail || 'Login failed',
      });
      throw error;
    }
  };

  // Register function
  const register = async (userData: RegisterFormData) => {
    setState({
      ...state,
      loading: true,
      error: null,
    });

    try {
      await authAPI.register(userData);
      // Auto login after registration
      await login({
        email: userData.email,
        password: userData.password,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      setState({
        ...state,
        loading: false,
        error: error.response?.data?.detail || 'Registration failed',
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('user');
    
    setState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  };

  // Context value
  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};