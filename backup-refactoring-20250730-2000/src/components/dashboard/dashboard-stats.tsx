"use client";

import React from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Briefcase, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Bookmark,
  TrendingUp,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardStats() {
  const { stats, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <p>Ошибка загрузки статистики: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: "Всего заявок",
      value: stats.totalApplications,
      icon: FileText,
      description: "Подано заявок",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Ожидающие",
      value: stats.pendingApplications,
      icon: Clock,
      description: "На рассмотрении",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Принятые",
      value: stats.acceptedApplications,
      icon: CheckCircle,
      description: "Успешные заявки",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Отклоненные",
      value: stats.rejectedApplications,
      icon: XCircle,
      description: "Неудачные заявки",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Вакансии",
      value: stats.totalJobsPosted,
      icon: Briefcase,
      description: "Создано вакансий",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Активные",
      value: stats.activeJobsPosted,
      icon: TrendingUp,
      description: "Активные вакансии",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Просмотры",
      value: stats.profileViews,
      icon: Eye,
      description: "Просмотров профиля",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      title: "Сохраненные",
      value: stats.savedJobs,
      icon: Bookmark,
      description: "Сохранено вакансий",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={cn("p-2 rounded-full", card.bgColor)}>
              <card.icon className={cn("h-4 w-4", card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {card.value}
            </div>
            <p className="text-xs text-gray-500">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 