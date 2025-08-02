'use client'

import { useEffect, useRef, useState } from 'react'

// Interface for performance metrics
interface PerformanceMetrics {
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
  domLoad?: number // DOM Content Loaded
  windowLoad?: number // Window Load
}

// Interface for analytics events
interface AnalyticsEvent {
  name: string
  category: string
  action: string
  label?: string
  value?: number
  custom?: Record<string, any>
}

// Hook for performance tracking with SSR safety
export function usePerformanceTracking() {
  const metricsRef = useRef<PerformanceMetrics | null>(null)

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') return

    // Check if PerformanceObserver is available
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported')
      return
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'first-contentful-paint':
            metricsRef.current = {
              ...metricsRef.current,
              fcp: entry.startTime
            }
            break
          case 'largest-contentful-paint':
            metricsRef.current = {
              ...metricsRef.current,
              lcp: entry.startTime
            }
            break
          case 'first-input':
            metricsRef.current = {
              ...metricsRef.current,
              fid: entry.processingStart - entry.startTime
            }
            break
          case 'layout-shift':
            if (entry.hadRecentInput) return
            metricsRef.current = {
              ...metricsRef.current,
              cls: (metricsRef.current?.cls || 0) + (entry as any).value
            }
            break
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['first-contentful-paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (error) {
      console.warn('Failed to observe performance entries:', error)
    }

    // Use modern Navigation Timing API with safety checks
    try {
      const navigationEntries = performance.getEntriesByType('navigation')
      if (navigationEntries.length > 0) {
        const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming
        const domLoadTime = navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart
        const windowLoadTime = navigationEntry.loadEventEnd - navigationEntry.fetchStart
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart

        metricsRef.current = {
          ...metricsRef.current,
          domLoad: domLoadTime,
          windowLoad: windowLoadTime,
          ttfb
        }
      }
    } catch (error) {
      console.warn('Failed to get navigation timing:', error)
    }

    return () => {
      try {
        observer.disconnect()
      } catch (error) {
        console.warn('Failed to disconnect observer:', error)
      }
    }
  }, [])

  return metricsRef.current
}

// Hook for Google Analytics 4 with SSR safety
export function useGoogleAnalytics(measurementId?: string) {
  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined' || !measurementId) return

    // Check if gtag is already loaded
    if ((window as any).gtag) {
      console.log('Google Analytics already loaded')
      return
    }

    // Load Google Analytics
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    
    script.onerror = () => {
      console.error('Failed to load Google Analytics script')
    }

    document.head.appendChild(script)

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []
    
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }

    // Make gtag available globally
    (window as any).gtag = gtag

    gtag('js', new Date())
    gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      custom_map: {
        'custom_parameter_1': 'user_type',
        'custom_parameter_2': 'page_category'
      }
    })

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
      // Note: Don't remove gtag as it might be used by other components
    }
  }, [measurementId])
}

// Hook for error tracking with SSR safety
export function useErrorTracking() {
  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') return

    const handleError = (event: ErrorEvent) => {
      console.error('Error tracked:', event.error)
      
      // Send to Google Analytics if available
      if ((window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: event.error?.message || 'Unknown error',
          fatal: false
        })
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled rejection tracked:', event.reason)
      
      // Send to Google Analytics if available
      if ((window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: event.reason?.message || 'Unhandled promise rejection',
          fatal: false
        })
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])
}

// Component for performance reporting with SSR safety
export function PerformanceReporter() {
  const metrics = usePerformanceTracking()
  const [isReporting, setIsReporting] = useState(false)

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') return

    if (metrics && !isReporting) {
      setIsReporting(true)
      
      // Send metrics to API
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(error => {
        console.warn('Failed to send performance metrics:', error)
      }).finally(() => {
        setIsReporting(false)
      })
    }
  }, [metrics, isReporting])

  return null // This component doesn't render anything
}

// Component for tracking events with SSR safety
export function EventTracker({ 
  children, 
  eventName, 
  eventCategory, 
  eventAction, 
  eventLabel 
}: { 
  children: React.ReactNode
  eventName: string
  eventCategory: string
  eventAction: string
  eventLabel?: string
}) {
  const handleClick = () => {
    // SSR safety check
    if (typeof window === 'undefined') return

    // Send to Google Analytics if available
    if ((window as any).gtag) {
      (window as any).gtag('event', eventName, {
        event_category: eventCategory,
        event_action: eventAction,
        event_label: eventLabel
      })
    }
  }

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  )
}

// Hook for page visibility tracking
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') return

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return isVisible
}

// Hook for time on page tracking
export function useTimeOnPage() {
  const [timeOnPage, setTimeOnPage] = useState(0)

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') return

    const startTime = Date.now()
    const interval = setInterval(() => {
      setTimeOnPage(Date.now() - startTime)
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return timeOnPage
}

// Safe analytics provider component
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // SSR safety check
  if (typeof window === 'undefined') {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <PerformanceReporter />
    </>
  )
} 