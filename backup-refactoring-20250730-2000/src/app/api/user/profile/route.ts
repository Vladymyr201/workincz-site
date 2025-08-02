import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const user = await UsersService.getUserById(session.user.id);

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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Валидируем данные
    const validatedData = updateProfileSchema.parse(body);

    // Обновляем профиль
    await UsersService.updateProfile(session.user.id, validatedData);

    // Получаем обновленный профиль
    const updatedUser = await UsersService.getUserById(session.user.id);

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