"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/auth";
import { 
  User, 
  Building2, 
  Users, 
  Shield, 
  Crown, 
  Star,
  ChevronDown,
  Check
} from "lucide-react";

// Конфигурация ролей
const roleConfig = {
  candidate: {
    label: "Соискатель",
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "Поиск работы и подача заявок"
  },
  employer: {
    label: "Работодатель",
    icon: Building2,
    color: "text-green-600",
    bgColor: "bg-green-50",
    description: "Размещение вакансий и управление кандидатами"
  },
  agency: {
    label: "Агентство",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "Посреднические услуги и рекрутинг"
  },
  admin: {
    label: "Администратор",
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-50",
    description: "Управление системой и пользователями"
  },
  vip: {
    label: "VIP",
    icon: Crown,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    description: "Премиум возможности и приоритетная поддержка"
  },
  premium: {
    label: "Премиум",
    icon: Star,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    description: "Расширенные функции и эксклюзивные вакансии"
  }
};

export function RoleSwitcher() {
  const { user, switchRole, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const currentRoleConfig = roleConfig[user.currentRole];
  const CurrentRoleIcon = currentRoleConfig.icon;

  const handleRoleSwitch = async (newRole: UserRole) => {
    const result = await switchRole(newRole);
    if (result.success) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        <CurrentRoleIcon className={`w-4 h-4 ${currentRoleConfig.color}`} />
        <span className="hidden sm:block">{currentRoleConfig.label}</span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900 mb-1">Переключить роль</h3>
            <p className="text-sm text-gray-600">
              Текущая роль: {currentRoleConfig.label}
            </p>
          </div>
          
          <div className="p-2">
            {Object.entries(roleConfig).map(([roleKey, config]) => {
              const RoleIcon = config.icon;
              const isCurrentRole = user.currentRole === roleKey;
              const isAvailable = user.role === roleKey || 
                                (user.vipStatus?.isActive && roleKey === 'vip') ||
                                (user.premiumStatus?.isActive && roleKey === 'premium');

              return (
                <button
                  key={roleKey}
                  onClick={() => handleRoleSwitch(roleKey as UserRole)}
                  disabled={!isAvailable || loading}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    isCurrentRole 
                      ? `${config.bgColor} ${config.color} border-2 border-current`
                      : isAvailable
                      ? 'hover:bg-gray-50'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <RoleIcon className={`w-5 h-5 ${config.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{config.label}</span>
                      {isCurrentRole && <Check className="w-4 h-4" />}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {config.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="p-4 border-t bg-gray-50">
            <p className="text-xs text-gray-600">
              💡 Разные роли предоставляют различные возможности и условия оплаты
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 