import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../lib/apiClient';
import { disconnectSocket } from '../services/socketService';

export function useAuth() {
  const { user, accessToken, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    async function checkAuthSession() {
      try {
        const { data } = await apiClient.post('/auth/refresh');
        if (isMounted && data.success && data.data.accessToken) {
          setAuth(data.data.user, data.data.accessToken);
        } else if (isMounted) {
          clearAuth();
        }
      } catch (error) {
        if (isMounted) clearAuth();
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (!isAuthenticated && isLoading) {
      checkAuthSession();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    if (data.success) {
      setAuth(data.data.user, data.data.accessToken);
    }
    return data;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // ignore logout network errors
    } finally {
      disconnectSocket();
      clearAuth();
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
