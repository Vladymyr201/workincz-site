"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  FileText, 
  GraduationCap,
  Briefcase,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileForm() {
  const { user, loading, error, updateProfile } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    skills: [] as string[],
    experience: "",
    education: "",
    website: "",
    linkedin: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  // Заполняем форму данными пользователя
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        skills: user.skills || [],
        experience: user.experience || "",
        education: user.education || "",
        website: user.website || "",
        linkedin: user.linkedin || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      await updateProfile(formData);
      setSaveSuccess(true);
      setIsEditing(false);
      
      // Скрываем сообщение об успехе через 3 секунды
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Восстанавливаем исходные данные
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        skills: user.skills || [],
        experience: user.experience || "",
        education: user.education || "",
        website: user.website || "",
        linkedin: user.linkedin || "",
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Загрузка профиля...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12 text-red-600">
          <AlertCircle className="h-8 w-8 mr-2" />
          <span>Ошибка загрузки профиля: {error}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800">Профиль успешно обновлен!</span>
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Основная информация
            </CardTitle>
            {!isEditing && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                Редактировать
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Ваше имя"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={true} // Email нельзя редактировать
                placeholder="your@email.com"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="+420 XXX XXX XXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Местоположение
              </label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Прага, Чехия"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              О себе
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Расскажите о себе, своем опыте и целях..."
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                !isEditing && "bg-gray-50 text-gray-500"
              )}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Навыки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing && (
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Добавить навык"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <Button onClick={handleAddSkill} disabled={!newSkill.trim()}>
                Добавить
              </Button>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                  isEditing 
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                    : "bg-gray-100 text-gray-800"
                )}
                onClick={() => isEditing && handleRemoveSkill(skill)}
              >
                {skill}
                {isEditing && (
                  <span className="ml-1 text-blue-600 hover:text-blue-800">×</span>
                )}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experience & Education */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Опыт и образование
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Опыт работы
            </label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Опишите ваш опыт работы..."
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                !isEditing && "bg-gray-50 text-gray-500"
              )}
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Образование
            </label>
            <textarea
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Укажите ваше образование..."
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                !isEditing && "bg-gray-50 text-gray-500"
              )}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Социальные сети
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Веб-сайт
              </label>
              <Input
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="https://your-website.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <Input
                name="linkedin"
                type="url"
                value={formData.linkedin}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="https://linkedin.com/in/your-profile"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex gap-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSaving}
          >
            Отмена
          </Button>
        </div>
      )}
    </div>
  );
} 