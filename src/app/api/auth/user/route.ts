import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }
    
    // Получаем профиль пользователя из Firestore
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Профиль пользователя не найден' },
        { status: 404 }
      );
    }
    
    const userData = userDoc.data();
    
    return NextResponse.json({
      success: true,
      user: {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        ...userData,
      },
    });
    
  } catch (error: any) {
    console.error('Ошибка получения данных пользователя:', error);
    
    return NextResponse.json(
      { success: false, error: 'Ошибка получения данных пользователя' },
      { status: 500 }
    );
  }
} 