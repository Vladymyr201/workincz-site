import React from "react";
import { UserMenu } from "@/components/auth/user-menu";
import { JobCreateForm } from "@/components/jobs/job-create-form";
import { Briefcase, Plus } from "lucide-react";

export default function CreateJobPage() {
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
            <Plus className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Создать вакансию</h1>
          </div>
          <p className="text-gray-600">
            Разместите новую вакансию и найдите подходящих кандидатов
          </p>
        </div>

        {/* Job Creation Form */}
        <JobCreateForm />

        {/* Additional Info */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Советы для привлекательной вакансии
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <strong>1. Четкое описание</strong>
              <p>Детально опишите обязанности и требования</p>
            </div>
            <div>
              <strong>2. Конкурентная зарплата</strong>
              <p>Укажите адекватную оплату труда</p>
            </div>
            <div>
              <strong>3. Условия работы</strong>
              <p>Опишите преимущества и условия</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 