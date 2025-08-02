"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Briefcase, 
  Building, 
  MapPin, 
  DollarSign, 
  FileText, 
  Users, 
  Calendar,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JobType, JobStatus } from "@/types";

export function JobCreateForm() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    requirements: [] as string[],
    responsibilities: [] as string[],
    benefits: [] as string[],
    salaryMin: "",
    salaryMax: "",
    currency: "CZK",
    type: "full-time" as JobType,
    category: "",
    experience: "",
    education: "",
    contactEmail: "",
    contactPhone: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // Новые поля для добавления
  const [newRequirement, setNewRequirement] = useState("");
  const [newResponsibility, setNewResponsibility] = useState("");
  const [newBenefit, setNewBenefit] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddItem = (type: 'requirements' | 'responsibilities' | 'benefits', value: string, setter: (value: string) => void) => {
    if (value.trim() && !formData[type].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
      setter("");
    }
  };

  const handleRemoveItem = (type: 'requirements' | 'responsibilities' | 'benefits', itemToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== itemToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      setError("Необходимо войти в систему");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSubmitSuccess(false);

    try {
      const jobData = {
        ...formData,
        employerId: session.user.id,
        employerName: session.user.name || "",
        employerEmail: session.user.email || "",
        status: "active" as JobStatus,
        views: 0,
        applications: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка создания вакансии");
      }

      const result = await response.json();
      setSubmitSuccess(true);
      
      // Перенаправляем на страницу вакансии через 2 секунды
      setTimeout(() => {
        router.push(`/jobs/${result.job.id}`);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания вакансии");
      console.error("Error creating job:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800">Вакансия успешно создана! Перенаправление...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Основная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название вакансии *
            </label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Например: Frontend Developer"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Компания *
              </label>
              <Input
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Название компании"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Местоположение *
              </label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Прага, Чехия"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип работы *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="full-time">Полная занятость</option>
                <option value="part-time">Частичная занятость</option>
                <option value="contract">Контракт</option>
                <option value="freelance">Фриланс</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категория
              </label>
              <Input
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="IT, Маркетинг, Продажи..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Опыт работы
              </label>
              <Input
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="1-3 года, 3-5 лет..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Описание вакансии
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Подробно опишите вакансию, обязанности, условия работы..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={6}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Требования
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Добавить требование"
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem('requirements', newRequirement, setNewRequirement)}
            />
            <Button 
              type="button"
              onClick={() => handleAddItem('requirements', newRequirement, setNewRequirement)}
              disabled={!newRequirement.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {formData.requirements.map((requirement, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">{requirement}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem('requirements', requirement)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Responsibilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Обязанности
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newResponsibility}
              onChange={(e) => setNewResponsibility(e.target.value)}
              placeholder="Добавить обязанность"
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem('responsibilities', newResponsibility, setNewResponsibility)}
            />
            <Button 
              type="button"
              onClick={() => handleAddItem('responsibilities', newResponsibility, setNewResponsibility)}
              disabled={!newResponsibility.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {formData.responsibilities.map((responsibility, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">{responsibility}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem('responsibilities', responsibility)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Преимущества
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              placeholder="Добавить преимущество"
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem('benefits', newBenefit, setNewBenefit)}
            />
            <Button 
              type="button"
              onClick={() => handleAddItem('benefits', newBenefit, setNewBenefit)}
              disabled={!newBenefit.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {formData.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">{benefit}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem('benefits', benefit)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Salary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Зарплата
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                От (в месяц)
              </label>
              <Input
                name="salaryMin"
                type="number"
                value={formData.salaryMin}
                onChange={handleInputChange}
                placeholder="30000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                До (в месяц)
              </label>
              <Input
                name="salaryMax"
                type="number"
                value={formData.salaryMax}
                onChange={handleInputChange}
                placeholder="50000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Валюта
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="CZK">CZK (чешская крона)</option>
                <option value="EUR">EUR (евро)</option>
                <option value="USD">USD (доллар)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Контактная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email для связи
              </label>
              <Input
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder="hr@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон для связи
              </label>
              <Input
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                placeholder="+420 XXX XXX XXX"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting ? "Создание..." : "Создать вакансию"}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={isSubmitting}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
} 