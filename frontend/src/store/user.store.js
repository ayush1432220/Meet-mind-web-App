import { create } from 'zustand';
import api from '@/api/apiClient';
import { socket } from '@/utils/socket.client';

export const useAuthStore = create((set, get) => ({

  user: null,
  isLoading: false, // Start loading on app load
  error: null,
  
  
  // Action: Check if user is authenticated (call on app load)
  checkAuth: async () => {
    console.log("hello")
    set({ isLoading: true, error: null });
    try {
        
      const response = await api.get('/auth/me');
      console.log(response)
      const user = response.data.data;
      set({ user, isLoading: false });
      // Connect socket ONLY after user is authenticated
      socket.auth = { userId: user._id };
      socket.connect();
    } catch (err) {
      set({ user: null, isLoading: false });
      socket.disconnect();
    }
  },

  // Action: Login
  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', data);
      const user = response.data.data.user;
      console.log(user)
      set({ user, isLoading: false });
      // Connect socket
      socket.auth = { userId: user._id };
      socket.connect();
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  // Action: Register
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/register', data);
      // After register, call login
      await get().login({ email: data.email, password: data.password });
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  // Action: Logout
  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
      set({ user: null, isLoading: false });
      socket.disconnect();
    } catch (err) {
      // Still log out on client even if server fails
      set({ user: null, isLoading: false });
      socket.disconnect();
    }
  },
}));
