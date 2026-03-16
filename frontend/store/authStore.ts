import { create } from 'zustand';
import { User, AuthState } from '@/types';

interface AuthStore extends AuthState {
  setUser: (user: User) => void;
  setToken: (token: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  initializeAuth: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user: User) =>
    set({ user, isAuthenticated: true, isLoading: false }),

  setToken: (token: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
    }
    set({ token, refreshToken });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),

  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      if (token && refreshToken) {
        set({ token, refreshToken });
      } else {
        set({ isLoading: false });
      }
    }
  },
}));

export default useAuthStore;
