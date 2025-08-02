'use client';

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthContext } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Схема валидации для формы сброса пароля
const resetPasswordSchema = z.object({
  email: z.string()
    .email("Введите корректный email")
    .min(1, "Email обязателен")
});

// Тип данных формы на основе схемы
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export function ResetPasswordForm({ onSuccess, onSwitchToSignIn }: ResetPasswordFormProps) {
  const { resetPassword, authState, clearError } = useAuthContext();
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  // Инициализация React Hook Form с валидацией Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  // Обработчик отправки формы
  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    clearError();
    
    try {
      const result = await resetPassword(data.email);
      
      if (result.success) {
        setIsEmailSent(true);
        reset();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Ошибка сброса пароля:", error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {isEmailSent ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Инструкции отправлены
          </h2>
          <p className="text-gray-600">
            Мы отправили инструкции по сбросу пароля на указанный email. 
            Пожалуйста, проверьте вашу почту и следуйте инструкциям.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={onSwitchToSignIn}
          >
            Вернуться к входу
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Сброс пароля
            </h2>
            <p className="text-gray-600 mt-2">
              Введите email, связанный с вашим аккаунтом, и мы отправим инструкции по сбросу пароля.
            </p>
          </div>
          
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

          {/* Ошибка */}
          {authState.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{authState.error}</span>
            </div>
          )}

          {/* Кнопка отправки */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || authState.loading}
          >
            {(isSubmitting || authState.loading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Отправить инструкции
          </Button>
          
          {/* Вернуться к входу */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Вернуться к входу
            </button>
          </div>
        </form>
      )}
    </div>
  );
}