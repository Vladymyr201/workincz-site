"use client";

import { useState } from "react";
import { useAuthContext } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, Briefcase, Bell, Home } from "lucide-react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { RoleSwitcher } from "./role-switcher";

export function UserMenu() {
  const { user, signOut, loading } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <a href="/auth/signin">Войти</a>
        </Button>
        <Button asChild>
          <a href="/auth/signup">Регистрация</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Navigation to Home */}
      <Button variant="ghost" size="sm" asChild>
        <a href="/" className="flex items-center gap-1">
          <Home className="w-4 h-4" />
          <span className="hidden sm:block">Главная</span>
        </a>
      </Button>

      {/* Role Switcher */}
      <RoleSwitcher />
      
      {/* Notification Bell */}
      <NotificationBell />
      
      {/* User Menu */}
      <div className="relative">
        <Button
          variant="ghost"
          className="flex items-center space-x-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="hidden md:block">{user.displayName || "Пользователь"}</span>
        </Button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
            <div className="px-4 py-2 text-sm text-gray-700 border-b">
              <p className="font-medium">{user.displayName || "Пользователь"}</p>
              <p className="text-gray-500">{user.email}</p>
              <p className="text-xs text-blue-600 mt-1">
                Роль: {user.role || 'Пользователь'}
              </p>
            </div>
            
            <a
              href="/dashboard"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Личный кабинет
            </a>
            
            <a
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4 mr-2" />
              Профиль
            </a>
            
            <a
              href="/notifications"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Bell className="w-4 h-4 mr-2" />
              Уведомления
            </a>
            
            <a
              href="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Настройки
            </a>
            
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {loading ? 'Выход...' : 'Выйти'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 