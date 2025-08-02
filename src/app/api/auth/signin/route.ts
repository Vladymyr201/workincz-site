import { NextRequest, NextResponse } from 'next/server';
import { auth, signInWithEmailAndPassword } from '@/lib/firebase';
import { z } from 'zod';

// Схема валидации для входа
const signInSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация входных данных
    const validatedData = signInSchema.parse(body);
    
    // Попытка входа через Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      validatedData.email,
      validatedData.password
    );
    
    const user = userCredential.user;
    
    // Получаем токен
    const token = await user.getIdToken();
    
    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      token,
    });
    
  } catch (error: any) {
    console.error('Ошибка входа:', error);
    
    // Обработка специфических ошибок Firebase
    let errorMessage = 'Ошибка входа';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Пользователь не найден';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Неверный пароль';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Неверный формат email';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Слишком много попыток входа. Попробуйте позже';
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
} 