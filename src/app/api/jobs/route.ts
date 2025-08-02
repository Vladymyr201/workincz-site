import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { JobsService } from "@/lib/services/jobs";
import { jobSchema } from "@/lib/validations";
import { z } from "zod";

// GET /api/jobs - получить список вакансий
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Парсим параметры запроса
    const params = {
      status: searchParams.get("status") || undefined,
      type: searchParams.get("type") || undefined,
      location: searchParams.get("location") || undefined,
      category: searchParams.get("category") || undefined,
      salaryMin: searchParams.get("salaryMin") ? parseInt(searchParams.get("salaryMin")!) : undefined,
      salaryMax: searchParams.get("salaryMax") ? parseInt(searchParams.get("salaryMax")!) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
    };

    // Получаем вакансии
    const result = await JobsService.getJobs(params);
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in GET /api/jobs:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Не удалось загрузить вакансии",
      },
      { status: 500 }
    );
  }
}

// POST /api/jobs - создать новую вакансию
export async function POST(request: NextRequest) {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: "Необходима авторизация",
        },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Проверяем токен
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    
    // Валидируем данные
    const validatedData = jobSchema.parse(body);
    
    // Создаем вакансию
    const job = await JobsService.createJob({
      ...validatedData,
      employerId: userId,
    });
    
    return NextResponse.json({
      success: true,
      data: job,
    }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/jobs:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Неверные данные",
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Не удалось создать вакансию",
      },
      { status: 500 }
    );
  }
} 