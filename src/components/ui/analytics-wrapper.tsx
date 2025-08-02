'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import analytics components with no SSR
const AnalyticsProvider = dynamic(
  () => import('./analytics').then(mod => ({ default: mod.AnalyticsProvider })),
  { 
    ssr: false,
    loading: () => null
  }
)

const ServiceWorkerRegister = dynamic(
  () => import('./service-worker-register').then(mod => ({ default: mod.ServiceWorkerRegister })),
  { 
    ssr: false,
    loading: () => null
  }
)

// Safe analytics wrapper component
export function SafeAnalyticsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AnalyticsProvider>
        {children}
        <ServiceWorkerRegister />
      </AnalyticsProvider>
    </Suspense>
  )
}

// Individual components for selective use
export function SafeAnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AnalyticsProvider>
        {children}
      </AnalyticsProvider>
    </Suspense>
  )
}

export function SafeServiceWorkerRegister() {
  return (
    <Suspense fallback={null}>
      <ServiceWorkerRegister />
    </Suspense>
  )
} 