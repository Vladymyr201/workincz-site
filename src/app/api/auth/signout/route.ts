import { NextRequest, NextResponse } from 'next/server';
import { auth, signOut } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    // Выход из Firebase Auth
    await signOut(auth);
    
    return NextResponse.json({
      success: true,
      message: 'Выход выполнен успешно',
    });
    
  } catch (error: any) {
    console.error('Ошибка выхода:', error);
    
    return NextResponse.json(
      { success: false, error: 'Ошибка при выходе' },
      { status: 500 }
    );
  }
} 