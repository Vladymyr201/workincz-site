"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, User, Building2, Users, Shield } from "lucide-react";

const roleIcons = {
  candidate: User,
  employer: Building2,
  agency: Users,
  admin: Shield,
  vip: Crown,
  premium: Star
};

const roleLabels = {
  candidate: "Соискатель",
  employer: "Работодатель",
  agency: "Агентство",
  admin: "Администратор",
  vip: "VIP",
  premium: "Премиум"
};

const roleColors = {
  candidate: "bg-blue-100 text-blue-800",
  employer: "bg-green-100 text-green-800",
  agency: "bg-purple-100 text-purple-800",
  admin: "bg-red-100 text-red-800",
  vip: "bg-yellow-100 text-yellow-800",
  premium: "bg-orange-100 text-orange-800"
};

export function RoleStatus() {
  const { user } = useAuth();

  if (!user) return null;

  const CurrentRoleIcon = roleIcons[user.currentRole];
  const BaseRoleIcon = roleIcons[user.role];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Статус ролей</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Текущая активная роль */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CurrentRoleIcon className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium">Текущая роль</h4>
            </div>
            <Badge className={roleColors[user.currentRole]}>
              {roleLabels[user.currentRole]}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            {user.currentRole === 'candidate' && 'Поиск работы и подача заявок'}
            {user.currentRole === 'employer' && 'Размещение вакансий и управление кандидатами'}
            {user.currentRole === 'agency' && 'Посреднические услуги и рекрутинг'}
            {user.currentRole === 'admin' && 'Управление системой и пользователями'}
            {user.currentRole === 'vip' && 'Премиум возможности и приоритетная поддержка'}
            {user.currentRole === 'premium' && 'Расширенные функции и эксклюзивные вакансии'}
          </p>
        </Card>

        {/* Базовая роль */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BaseRoleIcon className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium">Базовая роль</h4>
            </div>
            <Badge variant="outline" className={roleColors[user.role]}>
              {roleLabels[user.role]}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Основная роль в системе
          </p>
        </Card>
      </div>

      {/* VIP и Премиум статусы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* VIP Статус */}
        <Card className={`p-4 ${user.vipStatus?.isActive ? 'border-yellow-300 bg-yellow-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crown className={`w-5 h-5 ${user.vipStatus?.isActive ? 'text-yellow-600' : 'text-gray-400'}`} />
              <h4 className="font-medium">VIP Статус</h4>
            </div>
            <Badge variant={user.vipStatus?.isActive ? "default" : "secondary"} 
                   className={user.vipStatus?.isActive ? "bg-yellow-100 text-yellow-800" : ""}>
              {user.vipStatus?.isActive ? 'Активен' : 'Неактивен'}
            </Badge>
          </div>
          {user.vipStatus?.isActive ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Истекает: {user.vipStatus.expiresAt.toLocaleDateString()}
              </p>
              <div className="text-xs text-gray-500">
                <p>Доступные функции:</p>
                <ul className="list-disc list-inside mt-1">
                  {user.vipStatus.features?.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Получите приоритетную поддержку и эксклюзивные вакансии
            </p>
          )}
        </Card>

        {/* Премиум Статус */}
        <Card className={`p-4 ${user.premiumStatus?.isActive ? 'border-orange-300 bg-orange-50' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className={`w-5 h-5 ${user.premiumStatus?.isActive ? 'text-orange-600' : 'text-gray-400'}`} />
              <h4 className="font-medium">Премиум</h4>
            </div>
            <Badge variant={user.premiumStatus?.isActive ? "default" : "secondary"}
                   className={user.premiumStatus?.isActive ? "bg-orange-100 text-orange-800" : ""}>
              {user.premiumStatus?.isActive ? 'Активен' : 'Неактивен'}
            </Badge>
          </div>
          {user.premiumStatus?.isActive ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Истекает: {user.premiumStatus.expiresAt.toLocaleDateString()}
              </p>
              <div className="text-xs text-gray-500">
                <p>Доступные функции:</p>
                <ul className="list-disc list-inside mt-1">
                  {user.premiumStatus.features?.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Расширенные функции и эксклюзивные предложения
            </p>
          )}
        </Card>
      </div>
    </div>
  );
} 