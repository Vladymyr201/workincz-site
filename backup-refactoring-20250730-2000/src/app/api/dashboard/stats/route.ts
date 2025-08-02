import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApplicationsService } from "@/lib/services/applications";
import { JobsService } from "@/lib/services/jobs";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    // Получаем заявки пользователя
    const userApplications = await ApplicationsService.getUserApplications(session.user.id);
    
    // Получаем вакансии, созданные пользователем (если он работодатель)
    const userJobs = await JobsService.getJobsByEmployer(session.user.id);

    // Подсчитываем статистику
    const totalApplications = userApplications.length;
    const pendingApplications = userApplications.filter(app => app.status === "pending").length;
    const acceptedApplications = userApplications.filter(app => app.status === "accepted").length;
    const rejectedApplications = userApplications.filter(app => app.status === "rejected").length;

    const totalJobsPosted = userJobs.length;
    const activeJobsPosted = userJobs.filter(job => job.status === "active").length;

    // В реальном приложении эти данные будут храниться в базе
    // Пока используем заглушки
    const profileViews = Math.floor(Math.random() * 50) + 10;
    const savedJobs = Math.floor(Math.random() * 20) + 5;

    const stats = {
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      totalJobsPosted,
      activeJobsPosted,
      profileViews,
      savedJobs,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
} 