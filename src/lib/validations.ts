import { z } from 'zod';

// Схема для заявки на вакансию
export const applicationSchema = z.object({
  coverLetter: z.string().min(10, 'Сопроводительное письмо должно содержать минимум 10 символов'),
  resume: z.string().optional(),
  expectedSalary: z.number().min(0, 'Ожидаемая зарплата не может быть отрицательной').optional(),
  availability: z.enum(['immediate', '2_weeks', '1_month', '3_months']).default('immediate'),
  additionalInfo: z.string().optional(),
});

// Схема для вакансии
export const jobSchema = z.object({
  title: z.string().min(3, 'Название вакансии должно содержать минимум 3 символа'),
  description: z.string().min(20, 'Описание должно содержать минимум 20 символов'),
  requirements: z.array(z.string()).min(1, 'Должны быть указаны требования'),
  salary: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.enum(['CZK', 'EUR', 'USD']).default('CZK'),
  }).optional(),
  location: z.object({
    city: z.string().min(1, 'Город обязателен'),
    country: z.string().min(1, 'Страна обязательна'),
    remote: z.boolean().default(false),
  }),
  type: z.enum(['full_time', 'part_time', 'contract', 'internship']).default('full_time'),
  experience: z.enum(['entry', 'junior', 'middle', 'senior', 'lead']).default('middle'),
  category: z.string().min(1, 'Категория обязательна'),
  tags: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  status: z.enum(['draft', 'active', 'paused', 'closed']).default('draft'),
});

// Схема для пользователя
export const userSchema = z.object({
  displayName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Неверный формат email'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Биография не должна превышать 500 символов').optional(),
  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  avatar: z.string().url().optional(),
});

// Схема для входа
export const signInSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

// Схема для регистрации
export const signUpSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  displayName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  role: z.enum(['jobseeker', 'employer']).default('jobseeker'),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type JobFormData = z.infer<typeof jobSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>; 