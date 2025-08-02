import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// Обработчик POST запроса для получения рекомендаций вакансий
export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Получаем параметры из запроса
    const data = await request.json();
    const { userId, preferences, viewHistory, favoriteJobs } = data;
    const limitParam = request.nextUrl.searchParams.get('limit');
    const jobLimit = limitParam ? parseInt(limitParam, 10) : 10;
    
    // Проверяем, что пользователь запрашивает рекомендации для себя
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Получаем вакансии из Firestore
    const jobsRef = collection(db, 'jobs');
    const jobsQuery = query(
      jobsRef,
      where('active', '==', true),
      orderBy('postedAt', 'desc'),
      limit(50) // Получаем больше вакансий, чтобы затем отфильтровать
    );
    
    const jobsSnapshot = await getDocs(jobsQuery);
    let jobs = jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Используем МПС sequentialthinking для анализа и ранжирования вакансий
    const rankedJobs = await rankJobsWithSequentialThinking(
      jobs,
      preferences,
      viewHistory,
      favoriteJobs
    );
    
    // Ограничиваем количество возвращаемых вакансий
    const recommendedJobs = rankedJobs.slice(0, jobLimit);
    
    return NextResponse.json({ jobs: recommendedJobs });
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Функция для ранжирования вакансий с использованием МПС sequentialthinking
 */
async function rankJobsWithSequentialThinking(
  jobs: any[],
  preferences: any,
  viewHistory: any[],
  favoriteJobs: string[]
) {
  try {
    // Подготавливаем данные для МПС sequentialthinking
    const jobData = jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      categories: job.categories || [],
      skills: job.skills || [],
      type: job.type,
      remote: job.remote || false
    }));
    
    // Вызываем МПС sequentialthinking для анализа и ранжирования
    const response = await fetch('http://localhost:3002/api/sequentialthinking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'analyze',
        data: {
          jobs: jobData,
          userPreferences: {
            locations: preferences.jobSearch?.locations || [],
            categories: preferences.jobSearch?.categories || [],
            jobTypes: preferences.jobSearch?.jobTypes || [],
            salaryRange: preferences.jobSearch?.salaryRange || { min: 0, max: 1000000 },
            remoteOnly: preferences.jobSearch?.remoteOnly || false,
            skills: preferences.skills || []
          },
          viewHistory: viewHistory || [],
          favoriteJobs: favoriteJobs || []
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze jobs with sequentialthinking');
    }
    
    const result = await response.json();
    
    // Получаем ранжированные ID вакансий
    const rankedJobIds = result.rankedJobs.map((item: any) => item.id);
    
    // Сортируем исходные вакансии в соответствии с ранжированием
    const rankedJobs = [];
    for (const jobId of rankedJobIds) {
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        // Добавляем оценку релевантности из результата анализа
        const scoreInfo = result.rankedJobs.find((item: any) => item.id === jobId);
        rankedJobs.push({
          ...job,
          score: scoreInfo?.score || 0
        });
      }
    }
    
    return rankedJobs;
  } catch (error) {
    console.error('Error ranking jobs with sequentialthinking:', error);
    
    // В случае ошибки возвращаем вакансии без ранжирования
    return jobs.slice(0, 10);
  }
}