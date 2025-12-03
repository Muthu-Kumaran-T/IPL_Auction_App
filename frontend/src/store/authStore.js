// frontend/src/store/authStore.js
import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  initialized: false,
  isLoading: true, // Add this for page reload handling

  // Register
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      console.log('Attempting registration with:', { ...userData, password: '***' });
      const response = await authAPI.register(userData);
      console.log('Registration response:', response.data);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      set({ error: errorMessage, loading: false, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Login
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ error: errorMessage, loading: false, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
      isLoading: false
    });
  },

  // Get current user (called on app initialization)
  fetchUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ initialized: true, isLoading: false });
      return;
    }
    
    set({ loading: true, isLoading: true });
    try {
      const response = await authAPI.getMe();
      set({
        user: response.data.user,
        loading: false,
        initialized: true,
        isLoading: false,
        isAuthenticated: true
      });
    } catch (error) {
      console.error('Fetch user error:', error);
      set({ 
        loading: false, 
        initialized: true,
        isLoading: false
      });
      // Token might be invalid
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        isAuthenticated: false
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useAuthStore;