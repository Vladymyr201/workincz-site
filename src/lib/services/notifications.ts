import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Notification, NotificationType } from "@/types";

const COLLECTION_NAME = "notifications";

export interface NotificationsQueryParams {
  userId?: string;
  type?: NotificationType;
  isRead?: boolean;
  limit?: number;
}

export class NotificationsService {
  static async getNotifications(params: NotificationsQueryParams = {}): Promise<Notification[]> {
    try {
      const constraints: QueryConstraint[] = [];
      
      if (params.userId) {
        constraints.push(where("userId", "==", params.userId));
      }
      
      if (params.type) {
        constraints.push(where("type", "==", params.type));
      }
      
      if (params.isRead !== undefined) {
        constraints.push(where("isRead", "==", params.isRead));
      }
      
      constraints.push(orderBy("createdAt", "desc"));
      
      if (params.limit) {
        constraints.push(limit(params.limit));
      }
      
      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Notification[];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw new Error("Ошибка загрузки уведомлений");
    }
  }

  static async getNotificationById(id: string): Promise<Notification | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        } as Notification;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching notification:", error);
      throw new Error("Ошибка загрузки уведомления");
    }
  }

  static async createNotification(notificationData: Omit<Notification, "id" | "createdAt">): Promise<Notification> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...notificationData,
        createdAt: new Date(),
      });
      
      return {
        id: docRef.id,
        ...notificationData,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error("Error creating notification:", error);
      throw new Error("Ошибка создания уведомления");
    }
  }

  static async updateNotification(id: string, updates: Partial<Notification>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating notification:", error);
      throw new Error("Ошибка обновления уведомления");
    }
  }

  static async deleteNotification(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw new Error("Ошибка удаления уведомления");
    }
  }

  static async markAsRead(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        isRead: true,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw new Error("Ошибка обновления статуса уведомления");
    }
  }

  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications({ userId, isRead: false });
      
      const updatePromises = notifications.map(notification =>
        this.markAsRead(notification.id)
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw new Error("Ошибка обновления статуса уведомлений");
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getNotifications({ userId, isRead: false });
      return notifications.length;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  // Helper methods for creating specific types of notifications
  static async createApplicationReceivedNotification(
    userId: string,
    jobTitle: string,
    companyName: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: "application_received",
      title: "Новая заявка",
      message: `Получена заявка на вакансию "${jobTitle}" в компании ${companyName}`,
      isRead: false,
      data: { jobTitle, companyName },
    });
  }

  static async createApplicationStatusNotification(
    userId: string,
    jobTitle: string,
    companyName: string,
    status: "accepted" | "rejected"
  ): Promise<Notification> {
    const type: NotificationType = status === "accepted" ? "application_accepted" : "application_rejected";
    const title = status === "accepted" ? "Заявка принята" : "Заявка отклонена";
    const message = status === "accepted" 
      ? `Ваша заявка на вакансию "${jobTitle}" в компании ${companyName} была принята!`
      : `К сожалению, ваша заявка на вакансию "${jobTitle}" в компании ${companyName} была отклонена.`;

    return this.createNotification({
      userId,
      type,
      title,
      message,
      isRead: false,
      data: { jobTitle, companyName, status },
    });
  }

  static async createNewMessageNotification(
    userId: string,
    senderName: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: "new_message",
      title: "Новое сообщение",
      message: `У вас новое сообщение от ${senderName}`,
      isRead: false,
      data: { senderName },
    });
  }

  static async createJobViewedNotification(
    userId: string,
    jobTitle: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: "job_viewed",
      title: "Вакансия просмотрена",
      message: `Ваша вакансия "${jobTitle}" была просмотрена`,
      isRead: false,
      data: { jobTitle },
    });
  }

  static async createProfileViewedNotification(
    userId: string,
    viewerName: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: "profile_viewed",
      title: "Профиль просмотрен",
      message: `Ваш профиль просмотрел ${viewerName}`,
      isRead: false,
      data: { viewerName },
    });
  }

  static async createSystemAlertNotification(
    userId: string,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: "system_alert",
      title,
      message,
      isRead: false,
      data,
    });
  }
} 