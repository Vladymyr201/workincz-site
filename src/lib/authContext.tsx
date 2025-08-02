'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, onAuthStateChanged, db } from './firebase';
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { UserProfile, UserRole, AuthState } from '@/types/auth';

// Создаем контекст аутентификации
interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithFacebook: () => Promise<{ success: boolean; error?: string }>;
  loginWithApple: () => Promise<{ success: boolean; error?: string }>;
  loginWithGithub: () => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    company?: string;
    position?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  switchRole: (role: UserRole) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

// Создаем контекст с начальным значением
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Хук для использования контекста аутентификации
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext должен использоваться внутри AuthProvider');
  }
  return context;
};

// Провайдер контекста аутентификации
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Состояние аутентификации
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null,
    isAuthenticated: false
  });

  // Получение профиля пользователя из Firestore
  const fetchUserProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data() as any;
        return {
          ...data,
          uid: firebaseUser.uid,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          vipStatus: data.vipStatus ? {
            ...data.vipStatus,
            expiresAt: data.vipStatus.expiresAt?.toDate() || new Date()
          } : undefined,
          premiumStatus: data.premiumStatus ? {
            ...data.premiumStatus,
            expiresAt: data.premiumStatus.expiresAt?.toDate() || new Date()
          } : undefined
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Ошибка получения профиля пользователя:', error);
      return null;
    }
  };

  // Обработка ошибок Firebase
  const handleAuthError = (error: any): string => {
    const errorCode = error.code || '';
    const errorMap: Record<string, string> = {
      'auth/user-not-found': 'Пользователь с таким email не найден',
      'auth/wrong-password': 'Неверный пароль',
      'auth/email-already-in-use': 'Пользователь с таким email уже существует',
      'auth/weak-password': 'Пароль должен содержать минимум 6 символов',
      'auth/invalid-email': 'Неверный формат email',
      'auth/popup-closed-by-user': 'Окно входа было закрыто',
      'auth/popup-blocked': 'Всплывающее окно было заблокировано браузером',
      'auth/cancelled-popup-request': 'Запрос на вход был отменен',
      'auth/network-request-failed': 'Ошибка сети. Проверьте подключение к интернету',
      'auth/too-many-requests': 'Слишком много попыток входа. Попробуйте позже',
      'auth/user-disabled': 'Аккаунт заблокирован',
      'auth/operation-not-allowed': 'Данный метод входа не разрешен',
      'auth/account-exists-with-different-credential': 'Аккаунт с этим email уже существует с другим методом входа',
      'auth/auth-domain-config-required': 'Требуется настройка домена аутентификации',
      'auth/credential-already-in-use': 'Эти учетные данные уже используются другим аккаунтом',
      'auth/provider-already-linked': 'Аккаунт уже связан с этим провайдером',
      'auth/redirect-cancelled-by-user': 'Перенаправление было отменено пользователем',
      'auth/unauthorized-domain': 'Домен не авторизован для операций OAuth',
      'auth/invalid-credential': 'Предоставленные учетные данные недействительны'
    };
    
    return errorMap[errorCode] || error.message || 'Произошла неизвестная ошибка';
  };

  // Авторизация с email и паролем
  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Профиль будет загружен автоматически через onAuthStateChanged
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  // Авторизация через Google
  const loginWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      await signInWithPopup(auth, provider);
      
      // Профиль будет загружен автоматически через onAuthStateChanged
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  // Авторизация через Facebook
  const loginWithFacebook = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { FacebookAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new FacebookAuthProvider();
      provider.setCustomParameters({ display: 'popup' });
      provider.addScope('email');
      provider.addScope('public_profile');
      
      await signInWithPopup(auth, provider);
      
      // Профиль будет загружен автоматически через onAuthStateChanged
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  // Авторизация через Apple
  const loginWithApple = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { OAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      
      await signInWithPopup(auth, provider);
      
      // Профиль будет загружен автоматически через onAuthStateChanged
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  // Авторизация через GitHub
  const loginWithGithub = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { GithubAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GithubAuthProvider();
      provider.addScope('read:user');
      provider.addScope('user:email');
      
      await signInWithPopup(auth, provider);
      
      // Профиль будет загружен автоматически через onAuthStateChanged
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  // Регистрация пользователя
  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    company?: string;
    position?: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      const firebaseUser = userCredential.user;
      
      // Обновляем профиль в Firebase Auth
      await updateProfile(firebaseUser, {
        displayName: `${data.firstName} ${data.lastName}`
      });
      
      // Создаем профиль в Firestore
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: `${data.firstName} ${data.lastName}`,
        photoURL: null,
        phoneNumber: data.phone || null,
        role: data.role,
        currentRole: data.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        isEmailVerified: firebaseUser.emailVerified,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        position: data.position
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  // Выход из системы
  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      
      setAuthState({
        user: null,
        firebaseUser: null,
        loading: false,
        error: null,
        isAuthenticated: false
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  // Сброс пароля
  const resetPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
      
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  // Обновление профиля пользователя
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!authState.user) {
        return { success: false, error: 'Пользователь не авторизован' };
      }
      
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Обновляем профиль в Firestore
      await updateDoc(doc(db, 'users', authState.user.uid), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Обновляем локальное состояние
      setAuthState(prev => ({
        ...prev,
        loading: false,
        user: prev.user ? { ...prev.user, ...updates } : null
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  // Переключение роли пользователя
  const switchRole = async (role: UserRole) => {
    try {
      if (!authState.user) {
        return { success: false, error: 'Пользователь не авторизован' };
      }
      
      // Проверяем, доступна ли роль для пользователя
      const availableRoles = [authState.user.role];
      
      // Добавляем VIP и Premium роли, если они активны
      if (authState.user.vipStatus?.isActive) {
        availableRoles.push('vip');
      }
      
      if (authState.user.premiumStatus?.isActive) {
        availableRoles.push('premium');
      }
      
      // Проверяем, может ли пользователь переключиться на запрошенную роль
      if (!availableRoles.includes(role)) {
        return { success: false, error: 'Роль недоступна для этого пользователя' };
      }
      
      // Обновляем текущую роль
      await updateDoc(doc(db, 'users', authState.user.uid), {
        currentRole: role,
        updatedAt: serverTimestamp()
      });
      
      // Обновляем локальное состояние
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, currentRole: role } : null
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = handleAuthError(error);
      return { success: false, error: errorMessage };
    }
  };

  // Очистка ошибки
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Инициализация слушателя состояния аутентификации
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Получаем профиль пользователя из Firestore
          const userProfile = await fetchUserProfile(firebaseUser);
          
          if (userProfile) {
            // Если профиль существует, обновляем состояние
            setAuthState({
              user: userProfile,
              firebaseUser,
              loading: false,
              error: null,
              isAuthenticated: true
            });
          } else {
            // Если профиля нет, создаем базовый профиль
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              phoneNumber: firebaseUser.phoneNumber,
              role: 'candidate', // Роль по умолчанию
              currentRole: 'candidate',
              createdAt: new Date(),
              updatedAt: new Date(),
              isEmailVerified: firebaseUser.emailVerified,
              firstName: firebaseUser.displayName?.split(' ')[0] || '',
              lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || ''
            };
            
            // Сохраняем новый профиль в Firestore
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              ...newProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            
            setAuthState({
              user: newProfile,
              firebaseUser,
              loading: false,
              error: null,
              isAuthenticated: true
            });
          }
        } catch (error) {
          console.error('Ошибка при получении профиля пользователя:', error);
          setAuthState({
            user: null,
            firebaseUser: null,
            loading: false,
            error: 'Ошибка при получении профиля пользователя',
            isAuthenticated: false
          });
        }
      } else {
        // Пользователь не авторизован
        setAuthState({
          user: null,
          firebaseUser: null,
          loading: false,
          error: null,
          isAuthenticated: false
        });
      }
    });
    
    // Отписываемся от слушателя при размонтировании компонента
    return () => unsubscribe();
  }, []);

  // Предоставляем контекст
  const contextValue: AuthContextType = {
    authState,
    login,
    loginWithGoogle,
    loginWithFacebook,
    loginWithApple,
    loginWithGithub,
    register,
    logout,
    resetPassword,
    updateProfile,
    switchRole,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;