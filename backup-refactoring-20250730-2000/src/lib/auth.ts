import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  User as FirebaseUser,
  UserCredential,
  AuthError
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import { 
  UserProfile, 
  UserRole, 
  RegistrationData, 
  LoginData, 
  AuthResult,
  GoogleAuthConfig 
} from "@/types/auth";

/**
 * Класс для управления аутентификацией Firebase
 */
class AuthService {
  /**
   * Регистрация пользователя с email и паролем
   */
  async registerWithEmail(data: RegistrationData): Promise<AuthResult> {
    try {
      if (!auth) throw new Error("Firebase Auth не инициализирован");

      // Создаем пользователя в Firebase Auth
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const firebaseUser = userCredential.user;

      // Обновляем профиль пользователя
      await updateProfile(firebaseUser, {
        displayName: `${data.firstName} ${data.lastName}`,
        photoURL: null
      });

      // Отправляем email для верификации
      await sendEmailVerification(firebaseUser);

      // Создаем профиль пользователя в Firestore
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
        role: data.role,
        currentRole: data.role, // Устанавливаем текущую роль равной основной
        createdAt: new Date(),
        updatedAt: new Date(),
        isEmailVerified: firebaseUser.emailVerified,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        position: data.position,
        phone: data.phone
      };

      await this.saveUserProfile(userProfile);

      return {
        success: true,
        user: userProfile
      };
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      return {
        success: false,
        error: this.getErrorMessage(error as AuthError)
      };
    }
  }

  /**
   * Вход с email и паролем
   */
  async loginWithEmail(data: LoginData): Promise<AuthResult> {
    try {
      if (!auth) throw new Error("Firebase Auth не инициализирован");

      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const firebaseUser = userCredential.user;
      const userProfile = await this.getUserProfile(firebaseUser.uid);

      return {
        success: true,
        user: userProfile
      };
    } catch (error) {
      console.error("Ошибка входа:", error);
      return {
        success: false,
        error: this.getErrorMessage(error as AuthError)
      };
    }
  }

  /**
   * Вход через Google OAuth
   */
  async loginWithGoogle(config?: GoogleAuthConfig): Promise<AuthResult> {
    try {
      if (!auth || !googleProvider) throw new Error("Firebase Auth не инициализирован");

      // Настраиваем Google провайдер
      if (config?.prompt) {
        googleProvider.setCustomParameters({ prompt: config.prompt });
      }

      const userCredential: UserCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;

      // Проверяем, существует ли профиль пользователя
      const existingProfile = await this.getUserProfile(firebaseUser.uid);

      if (existingProfile) {
        // Пользователь уже зарегистрирован - обновляем данные
        await this.updateUserProfile(firebaseUser.uid, {
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          email: firebaseUser.email,
          isEmailVerified: firebaseUser.emailVerified,
          updatedAt: new Date()
        });

        return {
          success: true,
          user: { ...existingProfile, ...firebaseUser }
        };
      } else {
        // Новый пользователь - создаем профиль с ролью по умолчанию
        const userProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          phoneNumber: firebaseUser.phoneNumber,
          role: 'candidate', // Роль по умолчанию
          currentRole: 'candidate', // Устанавливаем текущую роль равной основной
          createdAt: new Date(),
          updatedAt: new Date(),
          isEmailVerified: firebaseUser.emailVerified,
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || ''
        };

        await this.saveUserProfile(userProfile);

        return {
          success: true,
          user: userProfile
        };
      }
    } catch (error) {
      console.error("Ошибка входа через Google:", error);
      return {
        success: false,
        error: this.getErrorMessage(error as AuthError)
      };
    }
  }

  /**
   * Регистрация через Google OAuth (с выбором роли)
   */
  async registerWithGoogle(role: UserRole, config?: GoogleAuthConfig): Promise<AuthResult> {
    try {
      if (!auth || !googleProvider) throw new Error("Firebase Auth не инициализирован");

      // Настраиваем Google провайдер для регистрации
      googleProvider.setCustomParameters({ 
        prompt: 'select_account',
        ...config
      });

      const userCredential: UserCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;

      // Проверяем, не зарегистрирован ли уже пользователь
      const existingProfile = await this.getUserProfile(firebaseUser.uid);

      if (existingProfile) {
        return {
          success: false,
          error: "Пользователь с этим email уже зарегистрирован"
        };
      }

      // Создаем новый профиль с выбранной ролью
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
        role: role,
        currentRole: role, // Устанавливаем текущую роль равной основной
        createdAt: new Date(),
        updatedAt: new Date(),
        isEmailVerified: firebaseUser.emailVerified,
        firstName: firebaseUser.displayName?.split(' ')[0] || '',
        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || ''
      };

      await this.saveUserProfile(userProfile);

      return {
        success: true,
        user: userProfile
      };
    } catch (error) {
      console.error("Ошибка регистрации через Google:", error);
      return {
        success: false,
        error: this.getErrorMessage(error as AuthError)
      };
    }
  }

  /**
   * Выход из системы
   */
  async logout(): Promise<AuthResult> {
    try {
      if (!auth) throw new Error("Firebase Auth не инициализирован");

      await signOut(auth);

      return {
        success: true
      };
    } catch (error) {
      console.error("Ошибка выхода:", error);
      return {
        success: false,
        error: this.getErrorMessage(error as AuthError)
      };
    }
  }

  /**
   * Сброс пароля
   */
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      if (!auth) throw new Error("Firebase Auth не инициализирован");

      await sendPasswordResetEmail(auth, email);

      return {
        success: true
      };
    } catch (error) {
      console.error("Ошибка сброса пароля:", error);
      return {
        success: false,
        error: this.getErrorMessage(error as AuthError)
      };
    }
  }

  /**
   * Получение профиля пользователя из Firestore
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      if (!db) throw new Error("Firestore не инициализирован");

      const userDoc = await getDoc(doc(db, "users", uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error("Ошибка получения профиля:", error);
      return null;
    }
  }

  /**
   * Сохранение профиля пользователя в Firestore
   */
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      if (!db) throw new Error("Firestore не инициализирован");

      await setDoc(doc(db, "users", profile.uid), {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Ошибка сохранения профиля:", error);
      throw error;
    }
  }

  /**
   * Обновление профиля пользователя в Firestore
   */
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      if (!db) throw new Error("Firestore не инициализирован");

      await updateDoc(doc(db, "users", uid), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Ошибка обновления профиля:", error);
      throw error;
    }
  }

  /**
   * Получение текущего пользователя Firebase
   */
  getCurrentUser(): FirebaseUser | null {
    return auth?.currentUser || null;
  }

  /**
   * Подписка на изменения состояния аутентификации
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    if (!auth) {
      console.error("Firebase Auth не инициализирован");
      return () => {};
    }

    return onAuthStateChanged(auth, callback);
  }

  /**
   * Преобразование ошибок Firebase в понятные сообщения
   */
  private getErrorMessage(error: AuthError): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'Пользователь с таким email не найден';
      case 'auth/wrong-password':
        return 'Неверный пароль';
      case 'auth/email-already-in-use':
        return 'Пользователь с таким email уже существует';
      case 'auth/weak-password':
        return 'Пароль должен содержать минимум 6 символов';
      case 'auth/invalid-email':
        return 'Неверный формат email';
      case 'auth/popup-closed-by-user':
        return 'Окно входа было закрыто';
      case 'auth/popup-blocked':
        return 'Всплывающее окно было заблокировано браузером';
      case 'auth/cancelled-popup-request':
        return 'Запрос на вход был отменен';
      case 'auth/network-request-failed':
        return 'Ошибка сети. Проверьте подключение к интернету';
      case 'auth/too-many-requests':
        return 'Слишком много попыток входа. Попробуйте позже';
      case 'auth/user-disabled':
        return 'Аккаунт заблокирован';
      case 'auth/operation-not-allowed':
        return 'Данный метод входа не разрешен';
      default:
        return error.message || 'Произошла неизвестная ошибка';
    }
  }
}

// Экспортируем экземпляр сервиса
export const authService = new AuthService();
export default authService; 