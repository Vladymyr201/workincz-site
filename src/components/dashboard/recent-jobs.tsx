"use client";

import React from "react";
import { useJobs } from "@/hooks/useJobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
import { Briefcase, ArrowRight, Loader2 } from "lucide-react";

interface RecentJobsProps {
  limit?: number;
}

export function RecentJobs({ limit = 3 }: RecentJobsProps) {
  const { jobs, loading, error } = useJobs({ limit });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Последние вакансии
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Briefcase className="h-5 w-5" />
            Последние вакансии
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Ошибка загрузки вакансий: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Последние вакансии
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <a href="/jobs" className="flex items-center gap-1">
              Все вакансии
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Пока нет доступных вакансий</p>
            <Button className="mt-4" asChild>
              <a href="/jobs">Найти вакансии</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.slice(0, limit).map((job) => (
              <JobCard key={job.id} job={job} compact />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 