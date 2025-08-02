import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Инициализация Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    );
    
    try {
      initializeApp({
        credential: cert(serviceAccount)
      });
    } catch (error) {
      console.error('Ошибка инициализации Firebase Admin:', error);
    }
  }
};

/**
 * Middleware для проверки аутентификации и прав доступа
 */
export async function middleware(req: NextRequest) {
  // Пропускаем статические страницы и API routes
  if (req.nextUrl.pathname.startsWith('/public/') || 
      req.nextUrl.pathname.includes('.html') ||
      req.nextUrl.pathname.startsWith('/api/') ||
      req.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  // Проверяем токен из заголовка Authorization или из cookie
  const authHeader = req.headers.get('authorization');
  const authCookie = req.cookies.get('auth_token');
  
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.split('Bearer ')[1] 
    : authCookie?.value;
  
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
  
  // Страницы, требующие авторизации
  const protectedPages = {
    general: [
      "/dashboard", 
      "/profile"
    ],
    candidate: [
      "/applications"
    ],
    employer: [
      "/jobs/create",
      "/jobs/manage"
    ],
    agency: [
      "/agency/dashboard",
      "/candidates/manage"
    ],
    admin: [
      "/admin"
    ]
  };
  
  // Проверяем, является ли страница защищенной
  const isProtectedPage = Object.values(protectedPages)
    .flat()
    .some(page => req.nextUrl.pathname.startsWith(page));
  
  // Если токен отсутствует и страница защищена - перенаправляем на страницу входа
  if (!token && isProtectedPage) {
    const redirectUrl = new URL("/auth/signin", req.url);
    redirectUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Если токен присутствует, проверяем его валидность
  if (token) {
    try {
      // Инициализируем Firebase Admin
      initializeFirebaseAdmin();
      
      // Проверяем токен
      const decodedToken = await getAuth().verifyIdToken(token);
      
      // Если пользователь авторизован и пытается зайти на страницу авторизации
      if (isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      
      // Проверяем доступ к страницам с ограничениями по ролям
      const userRole = decodedToken.role || 'candidate';
      
      // Проверяем страницы работодателя
      if (req.nextUrl.pathname.startsWith("/jobs/create") || 
          req.nextUrl.pathname.startsWith("/jobs/manage")) {
        if (userRole !== 'employer' && userRole !== 'admin') {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
      
      // Проверяем страницы агентства
      if (req.nextUrl.pathname.startsWith("/agency/")) {
        if (userRole !== 'agency' && userRole !== 'admin') {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
      
      // Проверяем страницы администратора
      if (req.nextUrl.pathname.startsWith("/admin")) {
        if (userRole !== 'admin') {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
      
      // Добавляем информацию о пользователе в заголовки запроса
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', decodedToken.uid);
      requestHeaders.set('x-user-role', userRole);
      
      // Продолжаем выполнение запроса с добавленными заголовками
      return NextResponse.next({
        headers: requestHeaders
      });
      
    } catch (error) {
      // Если токен недействителен, удаляем cookie и перенаправляем на страницу входа
      if (isProtectedPage) {
        const response = NextResponse.redirect(new URL("/auth/signin", req.url));
        response.cookies.delete('auth_token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

// Конфигурация middleware - указываем пути, для которых он будет запускаться
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/jobs/create/:path*",
    "/jobs/manage/:path*",
    "/applications/:path*",
    "/agency/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
};