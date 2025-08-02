import React from "react";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentJobs } from "@/components/dashboard/recent-jobs";
import { UserApplications } from "@/components/dashboard/user-applications";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RoleStatus } from "@/components/dashboard/role-status";
import { UserMenu } from "@/components/auth/user-menu";
import { Briefcase, BarChart3, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Briefcase className="w-8 h-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">WorkInCZ</h1>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Добро пожаловать в личный кабинет
              </h1>
              <p className="text-gray-600">
                Управляйте своими заявками, отслеживайте статистику и находите новые возможности
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                На главную
              </a>
            </Button>
          </div>
        </div>

        {/* Role Status */}
        <div className="mb-8">
          <RoleStatus />
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Статистика</h2>
          </div>
          <DashboardStats />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Jobs */}
          <div>
            <RecentJobs limit={3} />
          </div>

          {/* User Applications */}
          <div>
            <UserApplications limit={5} />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Советы для успешного поиска работы
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <strong>1. Обновите профиль</strong>
              <p>Добавьте актуальную информацию о себе и своем опыте</p>
            </div>
            <div>
              <strong>2. Настройте уведомления</strong>
              <p>Получайте уведомления о новых подходящих вакансиях</p>
            </div>
            <div>
              <strong>3. Будьте активны</strong>
              <p>Регулярно просматривайте новые вакансии и подавайте заявки</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 