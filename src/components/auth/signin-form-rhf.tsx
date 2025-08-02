'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthContext } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SocialAuthButtons } from "./social-auth-buttons";
import { AuthErrorHandler } from "./auth-error-handler";
import { useErrorContext } from "@/contexts/ErrorContext";
import { ErrorType } from "@/lib/errorHandler";

// Схема валидации для формы входа
const loginSchema = z.object({
  email: z.string()
    .email("Введите корректный email")
    .min(1, "Email обязателен"),
  password: z.string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .max(100, "Пароль слишком длинный"),
  rememberMe: z.boolean().optional().default(false)
});

// Тип данных формы на основе схемы
type LoginFormData = z.infer<typeof loginSchema>;

interface SignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

export function SignInForm({ onSuccess, onSwitchToSignUp }: SignInFormProps) {
  const { login, authState, clearError } = useAuthContext();
  const { handleError } = useErrorContext();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  // Инициализация React Hook Form с валидацией Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  // Обработчик отправки формы
  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    clearError();
    
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        reset();
        onSuccess?.() || router.push("/dashboard");
      } else if (result.error) {
        handleError({ message: result.error }, ErrorType.AUTH);
      }
    } catch (error) {
      handleError(error, ErrorType.AUTH);
      console.error("Ошибка входа:", error);
    }
  };

  // Обработчик успешного входа через социальные сети
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
            <AuthErrorHandler error={errors.email.message} />
          )}
        </div>

        {/* Пароль поле */}
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
            <AuthErrorHandler error={errors.password.message} />
          )}
        </div>

        {/* Запомнить меня и Забыли пароль */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              {...register("rememberMe")}
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Запомнить меня
            </label>
          </div>
          <div className="text-sm">
            <a href="/auth/reset-password" className="font-medium text-primary-600 hover:text-primary-500">
              Забыли пароль?
            </a>
          </div>
        </div>

        {/* Ошибка аутентификации */}
        <AuthErrorHandler error={authState.error} onClearError={clearError} />

        {/* Кнопка входа */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || authState.loading}
        >
          {(isSubmitting || authState.loading) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Войти
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

      {/* Переключение на регистрацию */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Нет аккаунта?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Зарегистрироваться
          </button>
        </p>
      </div>
    </div>
  );
}