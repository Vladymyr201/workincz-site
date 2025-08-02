import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Утилита для форматирования дат
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Утилита для форматирования времени
export function formatTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Утилита для обрезки текста
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Утилита для генерации ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Утилита для проверки мобильного устройства
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

// Утилита для debounce
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Утилита для throttle
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Утилита для копирования в буфер обмена
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

// Утилита для валидации email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Утилита для валидации телефона
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Утилита для форматирования валюты
export function formatCurrency(amount: number, currency: string = 'CZK'): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

// Утилита для форматирования размера файла
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Утилита для получения параметров URL
export function getUrlParam(name: string): string | null {
  if (typeof window === 'undefined') return null
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

// Утилита для установки параметров URL
export function setUrlParam(name: string, value: string): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set(name, value)
  window.history.replaceState({}, '', url.toString())
}

// Утилита для удаления параметров URL
export function removeUrlParam(name: string): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.delete(name)
  window.history.replaceState({}, '', url.toString())
} 