'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthContext } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, User, Building, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/auth";
import { SocialAuthButtons } from "./social-auth-buttons";

// Схема валидации для формы регистрации
const signupSchema = z.object({
  email: z.string()
    .email("Введите корректный email")
    .min(1, "Email обязателен"),
  password: z.string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .max(100, "Пароль слишком длинный"),
  confirmPassword: z.string()
    .min(1, "Подтверждение пароля обязательно"),
  firstName: z.string()
    .min(1, "Имя обязательно")
    .max(50, "Имя слишком длинное"),
  lastName: z.string()
    .min(1, "Фамилия обязательна")
    .max(50, "Фамилия слишком длинная"),
  role: z.enum(["candidate", "employer", "agency"] as const),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "Необходимо согласиться с условиями" })
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"]
});

// Тип данных формы на основе схемы
type SignupFormData = z.infer<typeof signupSchema>;

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const { register: registerUser, authState, clearError } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  
  // Инициализация React Hook Form с валидацией Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: 'candidate' as UserRole,
      phone: '',
      company: '',
      position: '',
      agreeToTerms: false
    }
  });

  // Отслеживание выбранной роли для условного отображения полей
  const selectedRole = watch('role');

  // Обработчик отправки формы
  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    clearError();
    
    try {
      const result = await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone,
        company: data.company,
        position: data.position
      });
      
      if (result.success) {
        reset();
        onSuccess?.() || router.push("/dashboard");
      }
    } catch (error) {
      console.error("Ошибка регистрации:", error);
    }
  };

  // Обработчик успешной авторизации через социальные сети
  const handleSocialAuthSuccess = () => {
    onSuccess?.() || router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email поле */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              type="email"
              className={cn(
                "pl-10",
                errors.email && "border-red-500 focus:ring-red-500 focus:border-red-500"
              )}
              placeholder="your@email.com"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600 flex items-center mt-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Имя и фамилия в одной строке */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Имя */}
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              Имя
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="firstName"
                type="text"
                className={cn(
                  "pl-10",
                  errors.firstName && "border-red-500 focus:ring-red-500 focus:border-red-500"
                )}
                placeholder="Иван"
                {...register("firstName")}
                aria-invalid={errors.firstName ? "true" : "false"}
              />
            </div>
            {errors.firstName && (
              <p className="text-sm text-red-600 flex items-center mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Фамилия */}
          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Фамилия
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="lastName"
                type="text"
                className={cn(
                  "pl-10",
                  errors.lastName && "border-red-500 focus:ring-red-500 focus:border-red-500"
                )}
                placeholder="Иванов"
                {...register("lastName")}
                aria-invalid={errors.lastName ? "true" : "false"}
              />
            </div>
            {errors.lastName && (
              <p className="text-sm text-red-600 flex items-center mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Пароль */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Пароль
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              className={cn(
                "pl-10 pr-10",
                errors.password && "border-red-500 focus:ring-red-500 focus:border-red-500"
              )}
              placeholder="••••••••"
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 flex items-center mt-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Подтверждение пароля */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Подтверждение пароля
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              className={cn(
                "pl-10 pr-10",
                errors.confirmPassword && "border-red-500 focus:ring-red-500 focus:border-red-500"
              )}
              placeholder="••••••••"
              {...register("confirmPassword")}
              aria-invalid={errors.confirmPassword ? "true" : "false"}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 flex items-center mt-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Выбор роли */}
        <div className="space-y-2">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Я регистрируюсь как
          </label>
          <select
            id="role"
            className={cn(
              "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md",
              errors.role && "border-red-500 focus:ring-red-500 focus:border-red-500"
            )}
            {...register("role")}
          >
            <option value="candidate">Соискатель</option>
            <option value="employer">Работодатель</option>
            <option value="agency">Агентство по трудоустройству</option>
          </select>
          {errors.role && (
            <p className="text-sm text-red-600 flex items-center mt-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.role.message}
            </p>
          )}
        </div>

        {/* Телефон (для всех) */}
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Телефон (опционально)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="phone"
              type="tel"
              className="pl-10"
              placeholder="+420 123 456 789"
              {...register("phone")}
            />
          </div>
        </div>

        {/* Дополнительные поля для работодателей и агентств */}
        {(selectedRole === 'employer' || selectedRole === 'agency') && (
          <>
            {/* Компания */}
            <div className="space-y-2">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                {selectedRole === 'employer' ? 'Название компании' : 'Название агентства'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="company"
                  type="text"
                  className="pl-10"
                  placeholder={selectedRole === 'employer' ? 'ООО "Компания"' : 'Агентство "Работа"'}
                  {...register("company")}
                />
              </div>
            </div>

            {/* Должность */}
            <div className="space-y-2">
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Должность
              </label>
              <Input
                id="position"
                type="text"
                placeholder="HR-менеджер"
                {...register("position")}
              />
            </div>
          </>
        )}

        {/* Согласие с условиями */}
        <div className="flex items-center">
          <input
            id="agreeToTerms"
            type="checkbox"
            className={cn(
              "h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded",
              errors.agreeToTerms && "border-red-500"
            )}
            {...register("agreeToTerms")}
          />
          <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
            Я согласен с <a href="/terms" className="text-primary-600 hover:text-primary-500">условиями использования</a> и <a href="/privacy" className="text-primary-600 hover:text-primary-500">политикой конфиденциальности</a>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-sm text-red-600 flex items-center mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.agreeToTerms.message}
          </p>
        )}

        {/* Ошибка аутентификации */}
        {authState.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{authState.error}</span>
          </div>
        )}

        {/* Кнопка регистрации */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || authState.loading}
        >
          {(isSubmitting || authState.loading) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Зарегистрироваться
        </Button>
      </form>

      {/* Разделитель */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Или</span>
        </div>
      </div>

      {/* Кнопки входа через социальные сети */}
      <SocialAuthButtons 
        onSuccess={handleSocialAuthSuccess} 
        vertical={true}
      />

      {/* Переключение на вход */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Уже есть аккаунт?{" "}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Войти
          </button>
        </p>
      </div>
    </div>
  );
}