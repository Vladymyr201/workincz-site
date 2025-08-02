"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Briefcase, Star, Crown } from "lucide-react";

export function ConditionalCTA() {
  const { user, isAuthenticated } = useAuth();

  // Если пользователь авторизован, показываем информацию о VIP/премиум
  if (isAuthenticated && user) {
    return (
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">
          Добро пожаловать, {user.firstName || user.displayName || 'Пользователь'}!
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Управляйте своими заявками и получайте доступ к эксклюзивным возможностям
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild>
            <a href="/dashboard" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Личный кабинет
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="/jobs" className="flex items-center gap-2">
              Найти вакансию
            </a>
          </Button>
        </div>
        
        {/* Информация о VIP и премиум статусах */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Crown className="w-6 h-6 text-yellow-300 mr-2" />
              <h3 className="font-semibold">VIP Статус</h3>
            </div>
            <p className="text-sm opacity-90">
              {user.vipStatus?.isActive 
                ? `Активен до ${user.vipStatus.expiresAt.toLocaleDateString()}`
                : 'Получите приоритетную поддержку и эксклюзивные вакансии'
              }
            </p>
            {!user.vipStatus?.isActive && (
              <Button size="sm" variant="outline" className="mt-2">
                <a href="/vip">Получить VIP</a>
              </Button>
            )}
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-6 h-6 text-orange-300 mr-2" />
              <h3 className="font-semibold">Премиум</h3>
            </div>
            <p className="text-sm opacity-90">
              {user.premiumStatus?.isActive 
                ? `Активен до ${user.premiumStatus.expiresAt.toLocaleDateString()}`
                : 'Расширенные функции и эксклюзивные предложения'
              }
            </p>
            {!user.premiumStatus?.isActive && (
              <Button size="sm" variant="outline" className="mt-2">
                <a href="/premium">Получить Премиум</a>
              </Button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Если пользователь не авторизован, показываем стандартную CTA секцию
  return (
    <section className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
      <h2 className="text-3xl font-bold mb-4">
        Готовы начать карьеру в Чехии?
      </h2>
      <p className="text-xl mb-8 opacity-90">
        Присоединяйтесь к тысячам успешных мигрантов, которые уже нашли работу своей мечты
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" variant="secondary" asChild>
          <a href="/auth/signup">Создать аккаунт</a>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <a href="/jobs">Найти вакансию</a>
        </Button>
      </div>
    </section>
  );
} 