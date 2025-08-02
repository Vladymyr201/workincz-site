import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Notification, NotificationType } from "@/types";
import { NotificationsService, NotificationsQueryParams } from "@/lib/services/notifications";

interface UseNotificationsOptions {
  autoFetch?: boolean;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const { autoFetch = true, limit, type, isRead } = options;

  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: NotificationsQueryParams = {
        userId: session.user.id,
        limit,
        type,
        isRead,
      };

      const [notificationsData, unreadCountData] = await Promise.all([
        NotificationsService.getNotifications(params),
        NotificationsService.getUnreadCount(session.user.id),
      ]);

      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки уведомлений");
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, limit, type, isRead]);

  const markAsRead = useCallback(async (id: string) => {
    if (!session?.user?.id) return;

    try {
      await NotificationsService.markAsRead(id);
      
      // Обновляем локальное состояние
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Обновляем счетчик непрочитанных
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
      throw err;
    }
  }, [session?.user?.id]);

  const markAllAsRead = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      await NotificationsService.markAllAsRead(session.user.id);
      
      // Обновляем локальное состояние
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Сбрасываем счетчик непрочитанных
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      throw err;
    }
  }, [session?.user?.id]);

  const deleteNotification = useCallback(async (id: string) => {
    if (!session?.user?.id) return;

    try {
      await NotificationsService.deleteNotification(id);
      
      // Удаляем из локального состояния
      setNotifications(prev =>
        prev.filter(notification => notification.id !== id)
      );
      
      // Обновляем счетчик непрочитанных если уведомление было непрочитанным
      const deletedNotification = notifications.find(n => n.id === id);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      throw err;
    }
  }, [session?.user?.id, notifications]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Автоматическая загрузка при изменении сессии или параметров
  useEffect(() => {
    if (autoFetch && session?.user?.id) {
      fetchNotifications();
    }
  }, [autoFetch, session?.user?.id, fetchNotifications]);

  // Периодическое обновление непрочитанного счетчика
  useEffect(() => {
    if (!session?.user?.id) return;

    const interval = setInterval(async () => {
      try {
        const count = await NotificationsService.getUnreadCount(session.user.id);
        setUnreadCount(count);
      } catch (err) {
        console.error("Error updating unread count:", err);
      }
    }, 30000); // Обновляем каждые 30 секунд

    return () => clearInterval(interval);
  }, [session?.user?.id]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };
} 