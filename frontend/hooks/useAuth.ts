import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const useAuth = () => {
  const router = useRouter();
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    setUser,
    setToken,
    logout: logoutStore,
    setLoading,
    initializeAuth,
  } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (token && !user && token.length > 10) {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getMe();
      setUser(response.data.data);
    } catch (err) {
      logoutStore();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      const { user, token, refreshToken } = response.data.data;
      setToken(token, refreshToken);
      setUser(user);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.signup({ name, email, password });
      toast.success('Account created! Please login.');
      router.push('/login');
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // ignore
    } finally {
      logoutStore();
      router.push('/login');
      toast.success('Logged out successfully');
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
  };
};

export default useAuth;
