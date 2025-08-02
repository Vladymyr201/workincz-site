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
import { Application, ApplicationStatus } from "@/types";

const COLLECTION_NAME = "applications";

export interface ApplicationsQueryParams {
  jobId?: string;
  userId?: string;
  status?: ApplicationStatus;
  limit?: number;
}

export class ApplicationsService {
  /**
   * Получить список заявок с фильтрацией
   */
  static async getApplications(params: ApplicationsQueryParams = {}): Promise<Application[]> {
    try {
      const constraints: QueryConstraint[] = [];
      
      // Фильтры
      if (params.jobId) {
        constraints.push(where("jobId", "==", params.jobId));
      }
      if (params.userId) {
        constraints.push(where("userId", "==", params.userId));
      }
      if (params.status) {
        constraints.push(where("status", "==", params.status));
      }
      
      // Сортировка по дате подачи (новые сначала)
      constraints.push(orderBy("createdAt", "desc"));
      
      // Лимит
      if (params.limit) {
        constraints.push(limit(params.limit));
      }
      
      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);
      
      const applications: Application[] = [];
      snapshot.forEach((doc) => {
        applications.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as Application);
      });
      
      return applications;
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw new Error("Не удалось загрузить заявки");
    }
  }

  /**
   * Получить конкретную заявку по ID
   */
  static async getApplicationById(id: string): Promise<Application | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
        } as Application;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching application:", error);
      throw new Error("Не удалось загрузить заявку");
    }
  }

  /**
   * Создать новую заявку
   */
  static async createApplication(applicationData: Omit<Application, "id" | "createdAt" | "updatedAt">): Promise<Application> {
    try {
      const now = new Date();
      const applicationToCreate = {
        ...applicationData,
        createdAt: now,
        updatedAt: now,
        status: "pending" as ApplicationStatus,
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), applicationToCreate);
      
      return {
        id: docRef.id,
        ...applicationToCreate,
      } as Application;
    } catch (error) {
      console.error("Error creating application:", error);
      throw new Error("Не удалось создать заявку");
    }
  }

  /**
   * Обновить заявку
   */
  static async updateApplication(id: string, updates: Partial<Application>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating application:", error);
      throw new Error("Не удалось обновить заявку");
    }
  }

  /**
   * Удалить заявку
   */
  static async deleteApplication(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting application:", error);
      throw new Error("Не удалось удалить заявку");
    }
  }

  /**
   * Изменить статус заявки
   */
  static async updateApplicationStatus(id: string, status: ApplicationStatus): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      throw new Error("Не удалось обновить статус заявки");
    }
  }

  /**
   * Проверить, подавал ли пользователь заявку на вакансию
   */
  static async hasUserApplied(jobId: string, userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("jobId", "==", jobId),
        where("userId", "==", userId)
      );
      
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking application:", error);
      return false;
    }
  }

  /**
   * Получить количество заявок на вакансию
   */
  static async getApplicationCount(jobId: string): Promise<number> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("jobId", "==", jobId)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Error getting application count:", error);
      return 0;
    }
  }

  /**
   * Получить заявки пользователя
   */
  static async getUserApplications(userId: string): Promise<Application[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(q);
      const applications: Application[] = [];
      
      snapshot.forEach((doc) => {
        applications.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as Application);
      });
      
      return applications;
    } catch (error) {
      console.error("Error fetching user applications:", error);
      throw new Error("Не удалось загрузить заявки пользователя");
    }
  }
} 