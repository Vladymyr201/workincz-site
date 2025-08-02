import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Пропускаем статические страницы - они используют Firebase Auth
    if (req.nextUrl.pathname.startsWith('/public/') || 
        req.nextUrl.pathname.includes('.html') ||
        req.nextUrl.pathname === '/') {
      return NextResponse.next();
    }

    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
    const isProtectedPage = req.nextUrl.pathname.startsWith("/dashboard") || 
                           req.nextUrl.pathname.startsWith("/profile") ||
                           req.nextUrl.pathname.startsWith("/jobs/create");

    // Если пользователь не авторизован и пытается зайти на защищенную страницу
    if (!isAuth && isProtectedPage) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // Если пользователь авторизован и пытается зайти на страницу авторизации
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/jobs/create/:path*",
    "/auth/:path*",
  ],
}; 