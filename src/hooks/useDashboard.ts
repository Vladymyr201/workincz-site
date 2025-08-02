import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/components/auth/auth-provider";
import { ApplicationsService } from "@/lib/services/applications";
import { JobsService } from "@/lib/services/jobs";

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  totalJobsPosted: number;
  activeJobsPosted: number;
  profileViews: number;
  savedJobs: number;
}

interface UseDashboardOptions {
  autoFetch?: boolean;
}

interface UseDashboardReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export function useDashboard(options: UseDashboardOptions = {}): UseDashboardReturn {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { autoFetch = true } = options;

  const fetchStats = useCallback(async () => {
    if (!user?.uid) {
      setStats(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Получаем заявки пользователя
      const userApplications = await ApplicationsService.getUserApplications(user.uid);
      
      // Получаем вакансии, созданные пользователем (если он работодатель)
      const userJobs = await JobsService.getJobsByEmployer(user.uid);

      // Подсчитываем статистику
      const totalApplications = userApplications.length;
      const pendingApplications = userApplications.filter(app => app.status === "pending").length;
      const acceptedApplications = userApplications.filter(app => app.status === "accepted").length;
      const rejectedApplications = userApplications.filter(app => app.status === "rejected").length;

      const totalJobsPosted = userJobs.length;
      const activeJobsPosted = userJobs.filter(job => job.status === "active").length;

      // Временные данные (в реальном приложении эти данные будут храниться в базе)
      const profileViews = Math.floor(Math.random() * 50) + 10; // Заглушка
      const savedJobs = Math.floor(Math.random() * 20) + 5; // Заглушка

      setStats({
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
        totalJobsPosted,
        activeJobsPosted,
        profileViews,
        savedJobs,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки статистики");
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (autoFetch && user?.uid) {
      fetchStats();
    }
  }, [autoFetch, user?.uid, fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
} 