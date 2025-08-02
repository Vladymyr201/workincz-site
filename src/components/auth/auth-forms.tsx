'use client';

import { useState } from 'react';
import { SignInForm } from './signin-form-rhf';
import { SignUpForm } from './signup-form-rhf';
import { ResetPasswordForm } from './reset-password-form-rhf';

type AuthFormType = 'signin' | 'signup' | 'reset-password';

interface AuthFormsProps {
  initialForm?: AuthFormType;
  onSuccess?: () => void;
}

export function AuthForms({ initialForm = 'signin', onSuccess }: AuthFormsProps) {
  const [currentForm, setCurrentForm] = useState<AuthFormType>(initialForm);

  const handleSwitchToSignIn = () => {
    setCurrentForm('signin');
  };

  const handleSwitchToSignUp = () => {
    setCurrentForm('signup');
  };

  const handleSwitchToResetPassword = () => {
    setCurrentForm('reset-password');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {currentForm === 'signin' && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Вход в аккаунт</h1>
            <p className="mt-2 text-sm text-gray-600">
              Войдите, чтобы получить доступ к своему аккаунту
            </p>
          </div>
          <SignInForm 
            onSuccess={onSuccess}
            onSwitchToSignUp={handleSwitchToSignUp}
          />
        </div>
      )}

      {currentForm === 'signup' && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Регистрация</h1>
            <p className="mt-2 text-sm text-gray-600">
              Создайте аккаунт для доступа к платформе
            </p>
          </div>
          <SignUpForm 
            onSuccess={onSuccess}
            onSwitchToSignIn={handleSwitchToSignIn}
          />
        </div>
      )}

      {currentForm === 'reset-password' && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Сброс пароля</h1>
            <p className="mt-2 text-sm text-gray-600">
              Мы отправим вам инструкции по сбросу пароля
            </p>
          </div>
          <ResetPasswordForm 
            onSuccess={onSuccess}
            onSwitchToSignIn={handleSwitchToSignIn}
          />
        </div>
      )}
    </div>
  );
}