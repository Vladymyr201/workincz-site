import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/components/auth/auth-provider";
import { User } from "@/types";
import { UsersService } from "@/lib/services/users";

interface UseUserOptions {
  autoFetch?: boolean;
}

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useUser(options: UseUserOptions = {}): UseUserReturn {
  const { user: authUser } = useAuthContext();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { autoFetch = true } = options;

  const fetchUser = useCallback(async () => {
    if (!authUser?.uid) {
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userData = await UsersService.getUserById(authUser.uid);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки профиля");
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!session?.user?.id) {
      throw new Error("Пользователь не авторизован");
    }

    setLoading(true);
    setError(null);

    try {
      await UsersService.updateProfile(session.user.id, updates);
      
      // Обновляем локальное состояние
      if (user) {
        setUser({
          ...user,
          ...updates,
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка обновления профиля");
      console.error("Error updating user:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, user]);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (autoFetch && session?.user?.id) {
      fetchUser();
    }
  }, [autoFetch, session?.user?.id, fetchUser]);

  return {
    user,
    loading,
    error,
    updateProfile,
    refreshUser,
  };
} 