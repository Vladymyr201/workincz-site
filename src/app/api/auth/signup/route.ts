import { NextRequest, NextResponse } from 'next/server';
import { auth, createUserWithEmailAndPassword, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { z } from 'zod';

// Схема валидации для регистрации
const signUpSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  displayName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  role: z.enum(['candidate', 'employer', 'agency']).default('candidate'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация входных данных
    const validatedData = signUpSchema.parse(body);
    
    // Создание пользователя в Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      validatedData.email,
      validatedData.password
    );
    
    const user = userCredential.user;
    
    // Создание профиля пользователя в Firestore
    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName: validatedData.displayName,
      role: validatedData.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      profile: {
        firstName: validatedData.displayName.split(' ')[0] || '',
        lastName: validatedData.displayName.split(' ').slice(1).join(' ') || '',
        phone: '',
        location: '',
        bio: '',
      },
      settings: {
        notifications: true,
        emailNotifications: true,
        language: 'ru',
        timezone: 'Europe/Moscow',
      },
      stats: {
        jobsPosted: 0,
        jobsApplied: 0,
        profileViews: 0,
        lastActive: new Date().toISOString(),
      }
    };
    
    // Сохранение профиля в Firestore
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    // Получаем токен
    const token = await user.getIdToken();
    
    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: validatedData.displayName,
        role: validatedData.role,
      },
      token,
    });
    
  } catch (error: any) {
    console.error('Ошибка регистрации:', error);
    
    // Обработка специфических ошибок Firebase
    let errorMessage = 'Ошибка регистрации';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Пользователь с таким email уже существует';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Неверный формат email';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Пароль слишком слабый';
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
} 