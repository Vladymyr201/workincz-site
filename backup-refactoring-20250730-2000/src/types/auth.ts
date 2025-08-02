import { User as FirebaseUser } from "firebase/auth";

// Типы для пользователя
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  role: UserRole;
  currentRole: UserRole; // Текущая активная роль для переключения
  createdAt: Date;
  updatedAt: Date;
  isEmailVerified: boolean;
  // Дополнительные поля для профиля
  firstName?: string;
  lastName?: string;
  company?: string;
  position?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: number;
  education?: string;
  languages?: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  preferences?: {
    remoteWork: boolean;
    relocation: boolean;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  // VIP и премиум статусы
  vipStatus?: {
    isActive: boolean;
    expiresAt: Date;
    features: string[];
  };
  premiumStatus?: {
    isActive: boolean;
    expiresAt: Date;
    features: string[];
  };
}

// Роли пользователей (расширенные)
export type UserRole = 'candidate' | 'employer' | 'agency' | 'admin' | 'vip' | 'premium';

// Состояние аутентификации
export interface AuthState {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Данные для регистрации
export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  company?: string;
  position?: string;
}

// Данные для входа
export interface LoginData {
  email: string;
  password: string;
}

// Результат аутентификации
export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

// Настройки Google OAuth
export interface GoogleAuthConfig {
  prompt?: 'select_account' | 'consent';
  accessType?: 'offline' | 'online';
  includeGrantedScopes?: boolean;
}

// Интерфейс для переключения ролей
export interface RoleSwitchData {
  userId: string;
  newRole: UserRole;
} 