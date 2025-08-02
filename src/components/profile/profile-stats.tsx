"use client";

import React from "react";
import { useUser } from "@/hooks/useUser";
import { useApplications } from "@/hooks/useApplications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  FileText, 
  Eye, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  Star,
  TrendingUp,
  Loader2
} from "lucide-react";

export function ProfileStats() {
  const { user, loading: userLoading } = useUser();
  const { applications, loading: appsLoading } = useApplications();

  const loading = userLoading || appsLoading;

  // Вычисляем процент заполнения профиля
  const calculateProfileCompletion = () => {
    if (!user) return 0;
    
    const fields = [
      user.name,
      user.phone,
      user.location,
      user.bio,
      user.skills?.length,
      user.experience,
      user.education,
      user.website,
      user.linkedin,
    ];
    
    const filledFields = fields.filter(field => 
      field && (typeof field === 'string' ? field.trim() : field > 0)
    ).length;
    
    return Math.round((filledFields / fields.length) * 100);
  };

  // Статистика заявок
  const getApplicationStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === "pending").length;
    const accepted = applications.filter(app => app.status === "accepted").length;
    const rejected = applications.filter(app => app.status === "rejected").length;
    
    return { total, pending, accepted, rejected };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Загрузка статистики...</span>
        </CardContent>
      </Card>
    );
  }

  const profileCompletion = calculateProfileCompletion();
  const appStats = getApplicationStats();

  return (
    <div className="space-y-6">
      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Заполнение профиля
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Прогресс</span>
              <span className="text-sm font-medium text-gray-900">
                {profileCompletion}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            
            <div className="text-xs text-gray-500">
              {profileCompletion < 50 && "Заполните больше информации для лучших результатов"}
              {profileCompletion >= 50 && profileCompletion < 80 && "Хорошо! Продолжайте улучшать профиль"}
              {profileCompletion >= 80 && "Отличный профиль! Вы готовы к поиску работы"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Статистика заявок
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{appStats.total}</div>
              <div className="text-xs text-gray-600">Всего заявок</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{appStats.pending}</div>
              <div className="text-xs text-gray-600">Ожидают</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{appStats.accepted}</div>
              <div className="text-xs text-gray-600">Приняты</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{appStats.rejected}</div>
              <div className="text-xs text-gray-600">Отклонены</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Активность профиля
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Просмотры профиля</span>
            </div>
            <span className="font-medium">24</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Рейтинг</span>
            </div>
            <span className="font-medium">4.8/5</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">В системе</span>
            </div>
            <span className="font-medium">3 мес.</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">💡 Быстрые советы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Добавьте профессиональное фото</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Опишите опыт работы детально</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Укажите актуальные навыки</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Добавьте ссылки на соцсети</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 