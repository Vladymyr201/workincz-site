"use client";

import React, { useState, useEffect } from "react";
import { useJobs } from "@/hooks/useJobs";
import { JobCard } from "./job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobType, JobStatus } from "@/types";
import { Search, Filter, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobsListProps {
  initialFilters?: {
    status?: JobStatus;
    type?: JobType;
    location?: string;
    category?: string;
    salaryMin?: number;
    salaryMax?: number;
  };
  showFilters?: boolean;
  limit?: number;
}

export function JobsList({ 
  initialFilters = {}, 
  showFilters = true, 
  limit = 20 
}: JobsListProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const {
    jobs,
    loading,
    error,
    hasMore,
    fetchJobs,
    fetchMoreJobs,
    refreshJobs,
  } = useJobs({
    initialParams: { ...filters, limit },
    autoFetch: true,
  });

  // Применяем фильтры
  const applyFilters = () => {
    const newFilters = {
      ...filters,
      ...(searchQuery && { search: searchQuery }),
    };
    fetchJobs(newFilters);
  };

  // Сброс фильтров
  const resetFilters = () => {
    setFilters({});
    setSearchQuery("");
    fetchJobs({ limit });
  };

  // Обработка поиска
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  // Обработка изменения фильтров
  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Загрузка дополнительных вакансий
  const handleLoadMore = () => {
    fetchMoreJobs();
  };

  // Обновление списка
  const handleRefresh = () => {
    refreshJobs();
  };

  return (
    <div className="space-y-6">
      {/* Поиск и фильтры */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Поиск */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Поиск вакансий..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Найти"}
              </Button>
            </div>
          </form>

          {/* Кнопка расширенных фильтров */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Фильтры
            </Button>
            <Button
              variant="ghost"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              Обновить
            </Button>
          </div>

          {/* Расширенные фильтры */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Тип работы */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип работы
                </label>
                <select
                  value={filters.type || ""}
                  onChange={(e) => handleFilterChange("type", e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Все типы</option>
                  <option value="full-time">Полная занятость</option>
                  <option value="part-time">Частичная занятость</option>
                  <option value="contract">Контракт</option>
                  <option value="freelance">Фриланс</option>
                </select>
              </div>

              {/* Статус */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Статус
                </label>
                <select
                  value={filters.status || ""}
                  onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Все статусы</option>
                  <option value="active">Активные</option>
                  <option value="paused">Приостановленные</option>
                  <option value="closed">Закрытые</option>
                </select>
              </div>

              {/* Локация */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Локация
                </label>
                <Input
                  type="text"
                  placeholder="Город"
                  value={filters.location || ""}
                  onChange={(e) => handleFilterChange("location", e.target.value || undefined)}
                />
              </div>

              {/* Категория */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория
                </label>
                <Input
                  type="text"
                  placeholder="Категория"
                  value={filters.category || ""}
                  onChange={(e) => handleFilterChange("category", e.target.value || undefined)}
                />
              </div>

              {/* Зарплата */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Мин. зарплата (CZK)
                </label>
                <Input
                  type="number"
                  placeholder="От"
                  value={filters.salaryMin || ""}
                  onChange={(e) => handleFilterChange("salaryMin", e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Макс. зарплата (CZK)
                </label>
                <Input
                  type="number"
                  placeholder="До"
                  value={filters.salaryMax || ""}
                  onChange={(e) => handleFilterChange("salaryMax", e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>

              {/* Кнопки управления фильтрами */}
              <div className="md:col-span-2 flex gap-2">
                <Button onClick={applyFilters} disabled={loading} className="flex-1">
                  Применить
                </Button>
                <Button variant="outline" onClick={resetFilters} disabled={loading}>
                  Сбросить
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Список вакансий */}
      <div className="space-y-4">
        {jobs.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Вакансии не найдены</p>
            <p className="text-gray-400">Попробуйте изменить фильтры или поисковый запрос</p>
          </div>
        ) : (
          <>
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </>
        )}
      </div>

      {/* Кнопка "Загрузить еще" */}
      {hasMore && (
        <div className="text-center">
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            variant="outline"
            className="px-8"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Загрузка...
              </>
            ) : (
              "Загрузить еще"
            )}
          </Button>
        </div>
      )}

      {/* Индикатор загрузки */}
      {loading && jobs.length === 0 && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-500 mt-2">Загрузка вакансий...</p>
        </div>
      )}
    </div>
  );
} 