import { useState, useEffect, useCallback } from "react";
import { Application, ApplicationStatus } from "@/types";
import { ApplicationsService, ApplicationsQueryParams } from "@/lib/services/applications";

interface UseApplicationsOptions {
  initialParams?: ApplicationsQueryParams;
  autoFetch?: boolean;
}

interface UseApplicationsReturn {
  applications: Application[];
  loading: boolean;
  error: string | null;
  fetchApplications: (params?: ApplicationsQueryParams) => Promise<void>;
  createApplication: (applicationData: Omit<Application, "id" | "createdAt" | "updatedAt">) => Promise<Application>;
  updateApplication: (id: string, updates: Partial<Application>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  hasUserApplied: (jobId: string, userId: string) => Promise<boolean>;
  getApplicationCount: (jobId: string) => Promise<number>;
  getUserApplications: (userId: string) => Promise<Application[]>;
  refreshApplications: () => Promise<void>;
}

export function useApplications(options: UseApplicationsOptions = {}): UseApplicationsReturn {
  const { initialParams = {}, autoFetch = true } = options;
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState<ApplicationsQueryParams>(initialParams);

  // Получить список заявок
  const fetchApplications = useCallback(async (params?: ApplicationsQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = params || currentParams;
      const result = await ApplicationsService.getApplications(queryParams);
      
      setApplications(result);
      setCurrentParams(queryParams);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  }, [currentParams]);

  // Создать новую заявку
  const createApplication = useCallback(async (applicationData: Omit<Application, "id" | "createdAt" | "updatedAt">): Promise<Application> => {
    try {
      setError(null);
      const newApplication = await ApplicationsService.createApplication(applicationData);
      
      // Добавляем новую заявку в начало списка
      setApplications(prev => [newApplication, ...prev]);
      
      return newApplication;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Не удалось создать заявку";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Обновить заявку
  const updateApplication = useCallback(async (id: string, updates: Partial<Application>): Promise<void> => {
    try {
      setError(null);
      await ApplicationsService.updateApplication(id, updates);
      
      // Обновляем заявку в списке
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, ...updates } : app
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Не удалось обновить заявку";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Удалить заявку
  const deleteApplication = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await ApplicationsService.deleteApplication(id);
      
      // Удаляем заявку из списка
      setApplications(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Не удалось удалить заявку";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Изменить статус заявки
  const updateApplicationStatus = useCallback(async (id: string, status: ApplicationStatus): Promise<void> => {
    try {
      setError(null);
      await ApplicationsService.updateApplicationStatus(id, status);
      
      // Обновляем статус заявки в списке
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, status } : app
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Не удалось обновить статус заявки";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Проверить, подавал ли пользователь заявку
  const hasUserApplied = useCallback(async (jobId: string, userId: string): Promise<boolean> => {
    try {
      setError(null);
      return await ApplicationsService.hasUserApplied(jobId, userId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Не удалось проверить заявку";
      setError(errorMessage);
      return false;
    }
  }, []);

  // Получить количество заявок на вакансию
  const getApplicationCount = useCallback(async (jobId: string): Promise<number> => {
    try {
      setError(null);
      return await ApplicationsService.getApplicationCount(jobId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Не удалось получить количество заявок";
      setError(errorMessage);
      return 0;
    }
  }, []);

  // Получить заявки пользователя
  const getUserApplications = useCallback(async (userId: string): Promise<Application[]> => {
    try {
      setError(null);
      const userApplications = await ApplicationsService.getUserApplications(userId);
      
      // Обновляем список заявок
      setApplications(userApplications);
      
      return userApplications;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Не удалось загрузить заявки пользователя";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Обновить список заявок
  const refreshApplications = useCallback(async () => {
    await fetchApplications();
  }, [fetchApplications]);

  // Автоматическая загрузка при монтировании
  useEffect(() => {
    if (autoFetch) {
      fetchApplications();
    }
  }, [autoFetch, fetchApplications]);

  return {
    applications,
    loading,
    error,
    fetchApplications,
    createApplication,
    updateApplication,
    deleteApplication,
    updateApplicationStatus,
    hasUserApplied,
    getApplicationCount,
    getUserApplications,
    refreshApplications,
  };
} 