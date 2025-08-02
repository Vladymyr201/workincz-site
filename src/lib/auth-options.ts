import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { auth as firebaseAuth } from './firebase-admin';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          // Используем Firebase Admin для авторизации
          const userRecord = await firebaseAuth.getUserByEmail(credentials.email);
          
          // Обратите внимание: здесь мы должны использовать метод Firebase для проверки пароля
          // В реальном приложении нужно интегрировать с Firebase Auth REST API
          // или использовать Firebase SDK напрямую для авторизации
          
          return {
            id: userRecord.uid,
            email: userRecord.email,
            name: userRecord.displayName || userRecord.email,
            role: userRecord.customClaims?.role || 'user',
            image: userRecord.photoURL
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error'
  }
};

export default authOptions;