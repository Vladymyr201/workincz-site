"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  User, 
  Settings, 
  Bell, 
  Bookmark,
  Upload,
  MessageSquare
} from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Создать вакансию",
      description: "Разместить новую вакансию",
      icon: Plus,
      href: "/jobs/create",
      color: "bg-blue-500 hover:bg-blue-600",
      iconColor: "text-blue-600",
    },
    {
      title: "Найти работу",
      description: "Поиск вакансий",
      icon: Search,
      href: "/jobs",
      color: "bg-green-500 hover:bg-green-600",
      iconColor: "text-green-600",
    },
    {
      title: "Редактировать профиль",
      description: "Обновить информацию",
      icon: User,
      href: "/profile",
      color: "bg-purple-500 hover:bg-purple-600",
      iconColor: "text-purple-600",
    },
    {
      title: "Уведомления",
      description: "Настройки уведомлений",
      icon: Bell,
      href: "/notifications",
      color: "bg-orange-500 hover:bg-orange-600",
      iconColor: "text-orange-600",
    },
    {
      title: "Сохраненные",
      description: "Избранные вакансии",
      icon: Bookmark,
      href: "/saved",
      color: "bg-red-500 hover:bg-red-600",
      iconColor: "text-red-600",
    },
    {
      title: "Загрузить резюме",
      description: "Добавить документы",
      icon: Upload,
      href: "/profile/documents",
      color: "bg-indigo-500 hover:bg-indigo-600",
      iconColor: "text-indigo-600",
    },
    {
      title: "Сообщения",
      description: "Чат с работодателями",
      icon: MessageSquare,
      href: "/messages",
      color: "bg-teal-500 hover:bg-teal-600",
      iconColor: "text-teal-600",
    },
    {
      title: "Настройки",
      description: "Параметры аккаунта",
      icon: Settings,
      href: "/settings",
      color: "bg-gray-500 hover:bg-gray-600",
      iconColor: "text-gray-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Быстрые действия</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all"
              asChild
            >
              <a href={action.href}>
                <div className={`p-3 rounded-full ${action.iconColor} bg-opacity-10`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {action.description}
                  </div>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 