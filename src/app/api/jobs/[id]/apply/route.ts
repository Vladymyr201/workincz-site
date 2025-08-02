import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { JobsService } from "@/lib/services/jobs";
import { ApplicationsService } from "@/lib/services/applications";
import { applicationSchema } from "@/lib/validations";
import { z } from "zod";

// POST /api/jobs/[id]/apply - подать заявку на вакансию
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id: jobId } = params;
    const body = await request.json();
    
    // Проверяем, что вакансия существует
    const job = await JobsService.getJobById(jobId);
    
    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: "Вакансия не найдена",
        },
        { status: 404 }
      );
    }
    
    // Проверяем, что вакансия активна
    if (job.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: "Вакансия неактивна",
        },
        { status: 400 }
      );
    }
    
    // Проверяем, что пользователь не подавал заявку ранее
    const hasApplied = await ApplicationsService.hasUserApplied(jobId, userId);
    
    if (hasApplied) {
      return NextResponse.json(
        {
          success: false,
          error: "Вы уже подавали заявку на эту вакансию",
        },
        { status: 400 }
      );
    }
    
    // Валидируем данные заявки
    const validatedData = applicationSchema.parse(body);
    
    // Создаем заявку
    const application = await ApplicationsService.createApplication({
      ...validatedData,
      jobId,
      userId: userId,
      jobTitle: job.title,
      companyName: job.companyName,
    });
    
    return NextResponse.json({
      success: true,
      data: application,
      message: "Заявка успешно подана",
    }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/jobs/[id]/apply:", error);
    
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
        error: error instanceof Error ? error.message : "Не удалось подать заявку",
      },
      { status: 500 }
    );
  }
} 