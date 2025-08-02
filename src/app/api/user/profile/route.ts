import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { UsersService } from "@/lib/services/users";
import { z } from "zod";

// Схема для обновления профиля
const updateProfileSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа").optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, "Биография не должна превышать 500 символов").optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  website: z.string().url("Неверный формат URL").optional(),
  linkedin: z.string().url("Неверный формат URL").optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Проверяем токен
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const user = await UsersService.getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Проверяем токен
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    
    // Валидируем данные
    const validatedData = updateProfileSchema.parse(body);

    // Обновляем профиль
    await UsersService.updateProfile(userId, validatedData);

    // Получаем обновленный профиль
    const updatedUser = await UsersService.getUserById(userId);

    return NextResponse.json({ 
      message: "Профиль обновлен",
      user: updatedUser 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Неверные данные", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
} 