import React from "react";
import { UserMenu } from "@/components/auth/user-menu";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileStats } from "@/components/profile/profile-stats";
import { Briefcase, User } from "lucide-react";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Мой профиль</h1>
          </div>
          <p className="text-gray-600">
            Управляйте своей личной информацией и настройками профиля
          </p>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2">
            <ProfileForm />
          </div>

          {/* Profile Stats */}
          <div className="lg:col-span-1">
            <ProfileStats />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Советы для привлекательного профиля
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <strong>1. Добавьте фото</strong>
              <p>Профессиональное фото увеличивает шансы на успех</p>
            </div>
            <div>
              <strong>2. Опишите опыт</strong>
              <p>Детально опишите ваш опыт работы и навыки</p>
            </div>
            <div>
              <strong>3. Укажите контакты</strong>
              <p>Убедитесь, что контактная информация актуальна</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 