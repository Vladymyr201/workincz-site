// Пользовательские типы
export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isEmailVerified: boolean;
  isActive: boolean;
}

export type UserRole = "candidate" | "client" | "agency" | "admin";

// Типы вакансий
export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  benefits: string[];
  type: JobType;
  experience: ExperienceLevel;
  category: JobCategory;
  isRemote: boolean;
  isUrgent: boolean;
  clientId: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export type JobType = "full-time" | "part-time" | "contract" | "freelance";
export type ExperienceLevel = "junior" | "middle" | "senior" | "lead";
export type JobCategory = "it" | "marketing" | "sales" | "design" | "other";
export type JobStatus = "active" | "paused" | "closed" | "draft" | "urgent";

// Типы заявок
export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  clientNotes?: string;
  candidateNotes?: string;
}

export type ApplicationStatus = "pending" | "reviewed" | "interview" | "accepted" | "rejected";

// Типы чата
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  isRead: boolean;
  createdAt: Date;
  attachments?: Attachment[];
}

export type MessageType = "text" | "image" | "file" | "system";

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

// Типы уведомлений
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
}

export type NotificationType = "job" | "application" | "message" | "system" | "payment";

// Типы платежей
export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: PaymentType;
  description: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type PaymentType = "subscription" | "one-time" | "commission";

// Типы подписок
export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionPlan = "free" | "basic" | "premium" | "enterprise";
export type SubscriptionStatus = "active" | "canceled" | "expired" | "past_due";

// API типы
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Формы
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  agreeToTerms: boolean;
  agreeToMarketing?: boolean;
}

export interface JobForm {
  title: string;
  description: string;
  company: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  requirements: string[];
  benefits: string[];
  type: JobType;
  experience: ExperienceLevel;
  category: JobCategory;
  isRemote: boolean;
  isUrgent: boolean;
  expiresAt: Date;
} 