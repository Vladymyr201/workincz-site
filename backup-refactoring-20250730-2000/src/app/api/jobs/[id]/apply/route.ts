import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    const session = await getServerSession(authOptions);
    
    // Проверяем авторизацию
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Необходима авторизация",
        },
        { status: 401 }
      );
    }

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
    const hasApplied = await ApplicationsService.hasUserApplied(jobId, session.user.id);
    
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
      userId: session.user.id,
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