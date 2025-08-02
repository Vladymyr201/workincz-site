import { useState, useEffect, useCallback } from "react";
import { Job, JobType, JobStatus } from "@/types";
import { JobsService, JobsQueryParams, JobsResponse } from "@/lib/services/jobs";

interface UseJobsOptions {
  initialParams?: JobsQueryParams;
  autoFetch?: boolean;
}

interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  lastDoc: any;
  fetchJobs: (params?: JobsQueryParams) => Promise<void>;
  fetchMoreJobs: () => Promise<void>;
  createJob: (jobData: Omit<Job, "id" | "createdAt" | "updatedAt">) => Promise<Job>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  getJobById: (id: string) => Promise<Job | null>;
  refreshJobs: () => Promise<void>;
}

export function useJobs(options: UseJobsOptions = {}): UseJobsReturn {
  const { initialParams = {}, autoFetch = true } = options;
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [currentParams, setCurrentParams] = useState<JobsQueryParams>(initialParams);

  // Получить список вакансий
  const fetchJobs = useCallback(async (params?: JobsQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = params || currentParams;
      const result: JobsResponse = await JobsService.getJobs(queryParams);
      
      setJobs(result.jobs);
      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
      setCurrentParams(queryParams);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить вакансии");
    } finally {
      setLoading(false);
    }
  }, [currentParams]);

  // Загрузить еще вакансий (пагинация)
  const fetchMoreJobs = useCallback(async () => {
    if (!hasMore || loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result: JobsResponse = await JobsService.getJobs({
        ...currentParams,
        lastDoc,
      });
      
      setJobs(prev => [...prev, ...result.jobs]);
      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить вакансии");
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, currentParams, lastDoc]);

  // Создать новую вакансию
  const createJob = useCallback(async (jobData: Omit<Job, "id" | "createdAt" | "updatedAt">): Promise<Job> => {
    try {
      setError(null);
      const newJob = await JobsService.createJob(jobData);
      
      // Добавляем новую вакансию в начало списка
      setJobs(prev => [newJob, ...prev]);
      
      return newJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Не удалось создать вакансию";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Обновить вакансию
  const updateJob = useCallback(async (id: string, updates: Partial<Job>): Promise<void> => {
    try {
      setError(null);
      await JobsService.updateJob(id, updates);
      
      // Обновляем вакансию в списке
      setJobs(prev => prev.map(job => 
        job.id === id ? { ...job, ...updates } : job
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Не удалось обновить вакансию";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Удалить вакансию
  const deleteJob = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await JobsService.deleteJob(id);
      
      // Удаляем вакансию из списка
      setJobs(prev => prev.filter(job => job.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Не удалось удалить вакансию";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Получить конкретную вакансию
  const getJobById = useCallback(async (id: string): Promise<Job | null> => {
    try {
      setError(null);
      return await JobsService.getJobById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Не удалось загрузить вакансию";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Обновить список вакансий
  const refreshJobs = useCallback(async () => {
    await fetchJobs();
  }, [fetchJobs]);

  // Автоматическая загрузка при монтировании
  useEffect(() => {
    if (autoFetch) {
      fetchJobs();
    }
  }, [autoFetch, fetchJobs]);

  return {
    jobs,
    loading,
    error,
    hasMore,
    lastDoc,
    fetchJobs,
    fetchMoreJobs,
    createJob,
    updateJob,
    deleteJob,
    getJobById,
    refreshJobs,
  };
} 