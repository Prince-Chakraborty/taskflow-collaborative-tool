'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import Loading from '@/components/common/Loading';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, []);

  return <Loading fullScreen text="Loading TaskFlow..." />;
}
