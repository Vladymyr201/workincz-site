import React from "react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import { JobsList } from "@/components/jobs/jobs-list";
import { ConditionalCTA } from "@/components/auth/conditional-cta";
import {
  Search, MapPin, Briefcase, Users, Star, Zap, ArrowRight, CheckCircle
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Briefcase className="w-8 h-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">WorkInCZ</h1>
            </div>
                         <div className="flex items-center space-x-4">
               <UserMenu />
               <div className="hidden md:flex items-center space-x-4">
                 <a href="/auth/signin" className="text-gray-600 hover:text-gray-900">Войти</a>
                 <a href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Регистрация</a>
               </div>
             </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Найдите лучшую работу в{" "}
            <span className="text-blue-600">Чехии</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Тысячи вакансий для мигрантов, студентов и профессионалов. 
            Начните свой путь к успешной карьере в Европе уже сегодня.
          </p>
          
          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Активных вакансий</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">5,000+</div>
              <div className="text-gray-600">Компаний-партнеров</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">50,000+</div>
              <div className="text-gray-600">Успешных трудоустройств</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Список вакансий */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Последние вакансии</h2>
            <Button asChild>
              <a href="/jobs" className="flex items-center gap-2">
                Все вакансии
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
          <JobsList limit={6} showFilters={false} />
        </div>

        {/* Features Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Почему выбирают WorkInCZ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Мы помогаем мигрантам найти работу в Чехии с 2020 года. 
              Наша платформа соединяет талантливых специалистов с лучшими работодателями.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Умный поиск
              </h3>
              <p className="text-gray-600">
                Находите вакансии, которые точно подходят вашим навыкам и опыту
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Проверенные работодатели
              </h3>
              <p className="text-gray-600">
                Все компании проходят тщательную проверку перед размещением вакансий
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Быстрое трудоустройство
              </h3>
              <p className="text-gray-600">
                Получайте отклики от работодателей в течение 24 часов
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                По всей Чехии
              </h3>
              <p className="text-gray-600">
                Вакансии в Праге, Брно, Остраве и других городах Чехии
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Поддержка мигрантов
              </h3>
              <p className="text-gray-600">
                Помощь с документами, визами и адаптацией в новой стране
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Премиум вакансии
              </h3>
              <p className="text-gray-600">
                Доступ к эксклюзивным предложениям с высокой зарплатой
              </p>
            </div>
          </div>
        </section>

        {/* Conditional CTA Section */}
        <ConditionalCTA />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Briefcase className="w-8 h-8 text-blue-400 mr-2" />
                <span className="text-xl font-bold">WorkInCZ</span>
              </div>
              <p className="text-gray-400">
                Лучшая платформа для поиска работы в Чехии
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Для соискателей</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/jobs" className="hover:text-white">Найти работу</a></li>
                <li><a href="/profile" className="hover:text-white">Создать резюме</a></li>
                <li><a href="/applications" className="hover:text-white">Мои заявки</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Для работодателей</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/jobs/create" className="hover:text-white">Разместить вакансию</a></li>
                <li><a href="/employers" className="hover:text-white">Для компаний</a></li>
                <li><a href="/pricing" className="hover:text-white">Тарифы</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Поддержка</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white">Помощь</a></li>
                <li><a href="/contact" className="hover:text-white">Контакты</a></li>
                <li><a href="/privacy" className="hover:text-white">Конфиденциальность</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 WorkInCZ. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 