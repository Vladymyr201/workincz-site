'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  quality?: number
  fill?: boolean
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  fill = false,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  // Генерация placeholder для blur эффекта
  const generateBlurDataURL = () => {
    if (blurDataURL) return blurDataURL
    
    // Простой SVG placeholder
    const svg = `
      <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f0f0f0"/>
            <stop offset="50%" stop-color="#e0e0e0"/>
            <stop offset="100%" stop-color="#f0f0f0"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
      </svg>
    `
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  // Обработка загрузки изображения
  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  // Обработка ошибки загрузки
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Fallback изображение при ошибке
  useEffect(() => {
    if (hasError) {
      setImageSrc('/placeholder-image.svg')
    }
  }, [hasError])

  // Оптимизация src для WebP
  const getOptimizedSrc = (originalSrc: string) => {
    // Если это внешнее изображение, возвращаем как есть
    if (originalSrc.startsWith('http')) {
      return originalSrc
    }
    
    // Для локальных изображений добавляем параметры оптимизации
    const url = new URL(originalSrc, window.location.origin)
    url.searchParams.set('format', 'webp')
    url.searchParams.set('quality', quality.toString())
    
    if (width) url.searchParams.set('w', width.toString())
    if (height) url.searchParams.set('h', height.toString())
    
    return url.toString()
  }

  // Если изображение загружается, показываем placeholder
  if (isLoading && placeholder === 'blur') {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <Image
          src={generateBlurDataURL()}
          alt={alt}
          width={width}
          height={height}
          className="blur-sm scale-110"
          fill={fill}
          sizes={sizes}
          priority={priority}
        />
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      </div>
    )
  }

  // Если произошла ошибка, показываем fallback
  if (hasError) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-gray-100 text-gray-400',
        className
      )}>
        <svg
          className="w-12 h-12"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <Image
        src={getOptimizedSrc(imageSrc)}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        fill={fill}
        sizes={sizes}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? generateBlurDataURL() : undefined}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

// Компонент для фоновых изображений
interface BackgroundImageProps {
  src: string
  alt?: string
  className?: string
  children?: React.ReactNode
}

export function BackgroundImage({ src, alt, className, children }: BackgroundImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <OptimizedImage
        src={src}
        alt={alt || 'Background image'}
        fill
        className="object-cover"
        onLoad={() => setIsLoading(false)}
      />
      
      {children && (
        <div className={cn(
          'relative z-10',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}>
          {children}
        </div>
      )}
    </div>
  )
}

// Компонент для аватаров
interface AvatarProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, alt = 'Avatar', size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }

  if (!src) {
    return (
      <div className={cn(
        'bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold',
        sizeClasses[size],
        className
      )}>
        {alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={parseInt(sizeClasses[size].split(' ')[0].slice(2))}
      height={parseInt(sizeClasses[size].split(' ')[0].slice(2))}
      className={cn('rounded-full object-cover', sizeClasses[size], className)}
      placeholder="blur"
    />
  )
} 