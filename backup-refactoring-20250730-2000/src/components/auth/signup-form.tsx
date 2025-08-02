"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  User,
  Building,
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { RegistrationData, UserRole } from "@/types/auth";

export function SignUpForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    company: "",
    position: "",
    role: "" as UserRole
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const { 
    registerWithEmail, 
    registerWithGoogle, 
    error, 
    clearError 
  } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const validateStep1 = () => {
    return formData.email && formData.password && formData.confirmPassword && 
           formData.password === formData.confirmPassword && 
           formData.password.length >= 6;
  };

  const validateStep2 = () => {
    return formData.firstName && formData.lastName;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;

    setIsLoading(true);
    clearError();

    try {
      const registrationData: RegistrationData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        position: formData.position || undefined
      };

      const result = await registerWithEmail(registrationData);

      if (result.success) {
        router.push("/dashboard");
      } else {
        console.error("Ошибка регистрации:", result.error);
      }
    } catch (error) {
      console.error("Неожиданная ошибка:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!formData.role) {
      clearError();
      // Устанавливаем ошибку через setTimeout, чтобы clearError сработал
      setTimeout(() => {
        // Здесь нужно будет добавить способ установки ошибки
        console.error("Выберите роль для регистрации");
      }, 0);
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const result = await registerWithGoogle(formData.role);

      if (result.success) {
        router.push("/dashboard");
      } else {
        console.error("Ошибка регистрации через Google:", result.error);
      }
    } catch (error) {
      console.error("Неожиданная ошибка:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="your@email.com"
            className="pl-10"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Пароль
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder="Минимум 6 символов"
            className="pl-10 pr-10"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Подтвердите пароль
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            placeholder="Повторите пароль"
            className="pl-10 pr-10"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button
        type="button"
        onClick={nextStep}
        className="w-full"
        disabled={!validateStep1() || isLoading}
      >
        Далее
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            Имя
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Имя"
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Фамилия
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Фамилия"
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Телефон (необязательно)
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+7 (999) 123-45-67"
            className="pl-10"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="flex-1"
          disabled={isLoading}
        >
          Назад
        </Button>
        <Button
          type="button"
          onClick={nextStep}
          className="flex-1"
          disabled={!validateStep2() || isLoading}
        >
          Далее
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Выберите вашу роль
        </label>
        <div className="space-y-3">
          {[
            { value: "candidate", label: "Соискатель", description: "Ищу работу" },
            { value: "employer", label: "Работодатель", description: "Размещаю вакансии" },
            { value: "agency", label: "Кадровое агентство", description: "Помогаю с трудоустройством" }
          ].map((role) => (
            <label
              key={role.value}
              className={cn(
                "flex items-center p-3 border rounded-lg cursor-pointer transition-colors",
                formData.role === role.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              )}
            >
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={formData.role === role.value}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="sr-only"
                disabled={isLoading}
              />
              <div className="ml-3">
                <div className="font-medium text-gray-900">{role.label}</div>
                <div className="text-sm text-gray-500">{role.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {(formData.role === "employer" || formData.role === "agency") && (
        <div className="space-y-4">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Название компании
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="Название компании"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
              Должность
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="position"
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                placeholder="Ваша должность"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="flex-1"
          disabled={isLoading}
        >
          Назад
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={!formData.role || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Регистрация...
            </>
          ) : (
            "Зарегистрироваться"
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Создать аккаунт</h2>
        <p className="mt-2 text-sm text-gray-600">
          Зарегистрируйтесь для доступа к вакансиям
        </p>
        
        {/* Индикатор прогресса */}
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={cn(
                  "w-3 h-3 rounded-full",
                  step <= currentStep ? "bg-blue-500" : "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleEmailSignUp} className="space-y-4">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </form>

      {currentStep === 3 && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">или</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignUp}
            disabled={isLoading || !formData.role}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Регистрация...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Зарегистрироваться через Google
              </>
            )}
          </Button>
        </>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Уже есть аккаунт?{" "}
          <a href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
            Войти
          </a>
        </p>
      </div>
    </div>
  );
} 