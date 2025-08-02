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
  startAfter,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Job, JobType, JobStatus } from "@/types";

const COLLECTION_NAME = "jobs";

export interface JobsQueryParams {
  status?: JobStatus;
  type?: JobType;
  location?: string;
  category?: string;
  salaryMin?: number;
  salaryMax?: number;
  limit?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}

export interface JobsResponse {
  jobs: Job[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export class JobsService {
  /**
   * Получить список вакансий с фильтрацией и пагинацией
   */
  static async getJobs(params: JobsQueryParams = {}): Promise<JobsResponse> {
    try {
      const constraints: QueryConstraint[] = [];
      
      // Фильтры
      if (params.status) {
        constraints.push(where("status", "==", params.status));
      }
      if (params.type) {
        constraints.push(where("type", "==", params.type));
      }
      if (params.location) {
        constraints.push(where("location", "==", params.location));
      }
      if (params.category) {
        constraints.push(where("category", "==", params.category));
      }
      if (params.salaryMin) {
        constraints.push(where("salaryMin", ">=", params.salaryMin));
      }
      if (params.salaryMax) {
        constraints.push(where("salaryMax", "<=", params.salaryMax));
      }
      
      // Сортировка по дате создания (новые сначала)
      constraints.push(orderBy("createdAt", "desc"));
      
      // Лимит
      const queryLimit = params.limit || 20;
      constraints.push(limit(queryLimit));
      
      // Пагинация
      if (params.lastDoc) {
        constraints.push(startAfter(params.lastDoc));
      }
      
      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);
      
      const jobs: Job[] = [];
      snapshot.forEach((doc) => {
        jobs.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as Job);
      });
      
      const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      const hasMore = snapshot.docs.length === queryLimit;
      
      return { jobs, lastDoc, hasMore };
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw new Error("Не удалось загрузить вакансии");
    }
  }

  /**
   * Получить конкретную вакансию по ID
   */
  static async getJobById(id: string): Promise<Job | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
        } as Job;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching job:", error);
      throw new Error("Не удалось загрузить вакансию");
    }
  }

  /**
   * Создать новую вакансию
   */
  static async createJob(jobData: Omit<Job, "id" | "createdAt" | "updatedAt">): Promise<Job> {
    try {
      const now = new Date();
      const jobToCreate = {
        ...jobData,
        createdAt: now,
        updatedAt: now,
        status: "active" as JobStatus,
        applications: [],
        views: 0,
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), jobToCreate);
      
      return {
        id: docRef.id,
        ...jobToCreate,
      } as Job;
    } catch (error) {
      console.error("Error creating job:", error);
      throw new Error("Не удалось создать вакансию");
    }
  }

  /**
   * Обновить вакансию
   */
  static async updateJob(id: string, updates: Partial<Job>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating job:", error);
      throw new Error("Не удалось обновить вакансию");
    }
  }

  /**
   * Удалить вакансию
   */
  static async deleteJob(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting job:", error);
      throw new Error("Не удалось удалить вакансию");
    }
  }

  /**
   * Увеличить счетчик просмотров
   */
  static async incrementViews(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        views: increment(1),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error incrementing views:", error);
      // Не бросаем ошибку, так как это не критично
    }
  }

  /**
   * Получить вакансии по работодателю
   */
  static async getJobsByEmployer(employerId: string): Promise<Job[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("employerId", "==", employerId),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(q);
      const jobs: Job[] = [];
      
      snapshot.forEach((doc) => {
        jobs.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        } as Job);
      });
      
      return jobs;
    } catch (error) {
      console.error("Error fetching employer jobs:", error);
      throw new Error("Не удалось загрузить вакансии работодателя");
    }
  }
}

// Импорт для increment
import { increment } from "firebase/firestore"; 