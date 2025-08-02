'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') return

    // Check if Service Worker is supported
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported')
      return
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('SW registered: ', registration)
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found')
        })
      } catch (registrationError) {
        console.error('SW registration failed: ', registrationError)
      }
    }

    registerSW()

    // Handle Service Worker updates
    const handleUpdate = () => {
      if (confirm('Доступна новая версия приложения. Обновить сейчас?')) {
        // Send message to service worker to skip waiting
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
        }
        window.location.reload()
      }
    }

    // Listen for controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('New Service Worker controlling the page.')
    })

    // Listen for waiting event
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_WAITING') {
        handleUpdate()
      }
    })

    // Cleanup function
    return () => {
      // Remove event listeners if needed
      navigator.serviceWorker.removeEventListener('controllerchange', () => {})
      navigator.serviceWorker.removeEventListener('message', () => {})
    }
  }, [])

  return null
} 