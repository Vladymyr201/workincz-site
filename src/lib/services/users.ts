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
import { User, UserRole } from "@/types";

const COLLECTION_NAME = "users";

export interface UsersQueryParams {
  role?: UserRole;
  location?: string;
  limit?: number;
}

export class UsersService {
  /**
   * Получить список пользователей с фильтрацией
   */
  static async getUsers(params: UsersQueryParams = {}): Promise<User[]> {
    try {
      const constraints: QueryConstraint[] = [];
      
      // Фильтры
      if (params.role) {
        constraints.push(where("role", "==", params.role));
      }
      if (params.location) {
        constraints.push(where("location", "==", params.location));
      }
      
      // Сортировка по дате регистрации (новые сначала)
      constraints.push(orderBy("createdAt", "desc"));
      
      // Лимит
      if (params.limit) {
        constraints.push(limit(params.limit));
      }
      
      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);
      
      const users: User[] = [];
      snapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as User);
      });
      
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Не удалось загрузить пользователей");
    }
  }

  /**
   * Получить пользователя по ID
   */
  static async getUserById(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
        } as User;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Не удалось загрузить пользователя");
    }
  }

  /**
   * Получить пользователя по email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("email", "==", email)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as User;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw new Error("Не удалось загрузить пользователя");
    }
  }

  /**
   * Создать нового пользователя
   */
  static async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    try {
      const now = new Date();
      const userToCreate = {
        ...userData,
        createdAt: now,
        updatedAt: now,
        isVerified: false,
        isActive: true,
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), userToCreate);
      
      return {
        id: docRef.id,
        ...userToCreate,
      } as User;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Не удалось создать пользователя");
    }
  }

  /**
   * Обновить пользователя
   */
  static async updateUser(id: string, updates: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Не удалось обновить пользователя");
    }
  }

  /**
   * Удалить пользователя
   */
  static async deleteUser(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Не удалось удалить пользователя");
    }
  }

  /**
   * Обновить профиль пользователя
   */
  static async updateProfile(id: string, profileData: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...profileData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new Error("Не удалось обновить профиль");
    }
  }

  /**
   * Изменить роль пользователя
   */
  static async updateUserRole(id: string, role: UserRole): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        role,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      throw new Error("Не удалось обновить роль пользователя");
    }
  }

  /**
   * Активировать/деактивировать пользователя
   */
  static async toggleUserStatus(id: string, isActive: boolean): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        isActive,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
      throw new Error("Не удалось изменить статус пользователя");
    }
  }

  /**
   * Подтвердить email пользователя
   */
  static async verifyUser(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        isVerified: true,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error verifying user:", error);
      throw new Error("Не удалось подтвердить пользователя");
    }
  }

  /**
   * Получить количество пользователей по роли
   */
  static async getUserCountByRole(role: UserRole): Promise<number> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("role", "==", role)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Error getting user count by role:", error);
      return 0;
    }
  }

  /**
   * Получить активных пользователей
   */
  static async getActiveUsers(): Promise<User[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(q);
      const users: User[] = [];
      
      snapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as User);
      });
      
      return users;
    } catch (error) {
      console.error("Error fetching active users:", error);
      throw new Error("Не удалось загрузить активных пользователей");
    }
  }
} 