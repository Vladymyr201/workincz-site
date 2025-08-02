'use client'

import { Suspense, lazy, ComponentType } from 'react'
import { useState, useEffect } from 'react'

interface LazyLoadProps {
  component: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  props?: Record<string, any>
}

const defaultFallback = (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <span className="ml-3 text-gray-600">Загрузка...</span>
  </div>
)

export function LazyLoad({ component, fallback = defaultFallback, props = {} }: LazyLoadProps) {
  const LazyComponent = lazy(component)

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

// Предустановленные ленивые компоненты для часто используемых модулей
export const LazyDashboard = lazy(() => import('@/components/dashboard/dashboard'))
export const LazyJobList = lazy(() => import('@/components/jobs/job-list'))
export const LazyJobForm = lazy(() => import('@/components/jobs/job-form'))
export const LazyProfile = lazy(() => import('@/components/profile/profile'))
export const LazyNotifications = lazy(() => import('@/components/notifications/notifications'))

// Компонент для условной загрузки
interface ConditionalLoadProps {
  condition: boolean
  component: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  props?: Record<string, any>
}

export function ConditionalLoad({ condition, component, fallback, props }: ConditionalLoadProps) {
  if (!condition) {
    return fallback || null
  }

  return <LazyLoad component={component} fallback={fallback} props={props} />
}

// Компонент для загрузки с задержкой
interface DelayedLoadProps {
  delay: number
  component: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  props?: Record<string, any>
}

export function DelayedLoad({ delay, component, fallback, props }: DelayedLoadProps) {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoad(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!shouldLoad) {
    return fallback || null
  }

  return <LazyLoad component={component} fallback={fallback} props={props} />
}

// Хук для предзагрузки компонентов
export function usePreloadComponent(component: () => Promise<{ default: ComponentType<any> }>) {
  useEffect(() => {
    // Предзагружаем компонент в фоне
    component().catch(console.error)
  }, [component])
}

// Компонент для загрузки с приоритетом
interface PriorityLoadProps {
  priority: 'high' | 'medium' | 'low'
  component: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  props?: Record<string, any>
}

export function PriorityLoad({ priority, component, fallback, props }: PriorityLoadProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadComponent = async () => {
      try {
        await component()
        if (mounted) {
          setIsLoaded(true)
        }
      } catch (error) {
        console.error('Failed to preload component:', error)
      }
    }

    // Загружаем высокоприоритетные компоненты сразу
    if (priority === 'high') {
      loadComponent()
    } else {
      // Загружаем остальные с задержкой
      const delay = priority === 'medium' ? 1000 : 3000
      setTimeout(loadComponent, delay)
    }

    return () => {
      mounted = false
    }
  }, [component, priority])

  if (!isLoaded) {
    return fallback || null
  }

  return <LazyLoad component={component} fallback={fallback} props={props} />
} 