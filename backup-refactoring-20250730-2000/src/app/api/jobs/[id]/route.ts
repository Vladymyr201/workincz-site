import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { JobsService } from "@/lib/services/jobs";
import { jobSchema } from "@/lib/validations";
import { z } from "zod";

// GET /api/jobs/[id] - получить конкретную вакансию
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Получаем вакансию
    const job = await JobsService.getJobById(id);
    
    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: "Вакансия не найдена",
        },
        { status: 404 }
      );
    }
    
    // Увеличиваем счетчик просмотров
    await JobsService.incrementViews(id);
    
    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Error in GET /api/jobs/[id]:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Не удалось загрузить вакансию",
      },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[id] - обновить вакансию
export async function PUT(
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

    const { id } = params;
    const body = await request.json();
    
    // Получаем текущую вакансию
    const currentJob = await JobsService.getJobById(id);
    
    if (!currentJob) {
      return NextResponse.json(
        {
          success: false,
          error: "Вакансия не найдена",
        },
        { status: 404 }
      );
    }
    
    // Проверяем права доступа (только владелец может редактировать)
    if (currentJob.employerId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Нет прав для редактирования этой вакансии",
        },
        { status: 403 }
      );
    }
    
    // Валидируем данные
    const validatedData = jobSchema.partial().parse(body);
    
    // Обновляем вакансию
    await JobsService.updateJob(id, validatedData);
    
    // Получаем обновленную вакансию
    const updatedJob = await JobsService.getJobById(id);
    
    return NextResponse.json({
      success: true,
      data: updatedJob,
    });
  } catch (error) {
    console.error("Error in PUT /api/jobs/[id]:", error);
    
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
        error: error instanceof Error ? error.message : "Не удалось обновить вакансию",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - удалить вакансию
export async function DELETE(
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

    const { id } = params;
    
    // Получаем текущую вакансию
    const currentJob = await JobsService.getJobById(id);
    
    if (!currentJob) {
      return NextResponse.json(
        {
          success: false,
          error: "Вакансия не найдена",
        },
        { status: 404 }
      );
    }
    
    // Проверяем права доступа (только владелец может удалять)
    if (currentJob.employerId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Нет прав для удаления этой вакансии",
        },
        { status: 403 }
      );
    }
    
    // Удаляем вакансию
    await JobsService.deleteJob(id);
    
    return NextResponse.json({
      success: true,
      message: "Вакансия успешно удалена",
    });
  } catch (error) {
    console.error("Error in DELETE /api/jobs/[id]:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Не удалось удалить вакансию",
      },
      { status: 500 }
    );
  }
} 