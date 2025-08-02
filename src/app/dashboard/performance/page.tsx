'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePerformanceTracking } from '@/components/ui/analytics'

interface PerformanceMetrics {
  fcp?: number
  lcp?: number
  fid?: number
  cls?: number
  ttfb?: number
  domLoad?: number
  windowLoad?: number
}

interface PerformanceData {
  timestamp: number
  url: string
  metrics: PerformanceMetrics
  userAgent: string
}

export default function PerformanceDashboard() {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentMetrics = usePerformanceTracking()

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/analytics/performance')
      if (response.ok) {
        const data = await response.json()
        setPerformanceData(data)
      } else {
        setError('Failed to fetch performance data')
      }
    } catch (err) {
      setError('Error loading performance data')
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Отлично</Badge>
    if (score >= 50) return <Badge className="bg-yellow-100 text-yellow-800">Хорошо</Badge>
    return <Badge className="bg-red-100 text-red-800">Требует внимания</Badge>
  }

  const calculateScore = (metrics: PerformanceMetrics) => {
    let score = 100
    
    // FCP scoring
    if (metrics.fcp) {
      if (metrics.fcp > 3000) score -= 30
      else if (metrics.fcp > 2000) score -= 15
      else if (metrics.fcp > 1000) score -= 5
    }
    
    // LCP scoring
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 30
      else if (metrics.lcp > 2500) score -= 15
      else if (metrics.lcp > 1500) score -= 5
    }
    
    // FID scoring
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 20
      else if (metrics.fid > 100) score -= 10
    }
    
    // CLS scoring
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 20
      else if (metrics.cls > 0.1) score -= 10
    }
    
    return Math.max(0, score)
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatCLS = (cls: number) => {
    return cls.toFixed(3)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <button 
                onClick={fetchPerformanceData}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Попробовать снова
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        <button 
          onClick={fetchPerformanceData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Обновить
        </button>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Текущие метрики</TabsTrigger>
          <TabsTrigger value="history">История</TabsTrigger>
          <TabsTrigger value="trends">Тренды</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {currentMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">FCP</CardTitle>
                  <CardDescription>First Contentful Paint</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentMetrics.fcp ? formatTime(currentMetrics.fcp) : 'N/A'}
                  </div>
                  <Progress 
                    value={currentMetrics.fcp ? Math.min((currentMetrics.fcp / 3000) * 100, 100) : 0} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">LCP</CardTitle>
                  <CardDescription>Largest Contentful Paint</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentMetrics.lcp ? formatTime(currentMetrics.lcp) : 'N/A'}
                  </div>
                  <Progress 
                    value={currentMetrics.lcp ? Math.min((currentMetrics.lcp / 4000) * 100, 100) : 0} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">FID</CardTitle>
                  <CardDescription>First Input Delay</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentMetrics.fid ? formatTime(currentMetrics.fid) : 'N/A'}
                  </div>
                  <Progress 
                    value={currentMetrics.fid ? Math.min((currentMetrics.fid / 300) * 100, 100) : 0} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">CLS</CardTitle>
                  <CardDescription>Cumulative Layout Shift</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentMetrics.cls ? formatCLS(currentMetrics.cls) : 'N/A'}
                  </div>
                  <Progress 
                    value={currentMetrics.cls ? Math.min((currentMetrics.cls / 0.25) * 100, 100) : 0} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {currentMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>Общий Score</CardTitle>
                <CardDescription>Оценка производительности на основе Core Web Vitals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold">
                    {calculateScore(currentMetrics)}
                  </div>
                  <div className="flex-1">
                    <Progress value={calculateScore(currentMetrics)} className="h-4" />
                  </div>
                  {getScoreBadge(calculateScore(currentMetrics))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>История производительности</CardTitle>
              <CardDescription>Последние измерения</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.slice(0, 10).map((data, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{new Date(data.timestamp).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{data.url}</p>
                      </div>
                      {getScoreBadge(calculateScore(data.metrics))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>FCP: {data.metrics.fcp ? formatTime(data.metrics.fcp) : 'N/A'}</div>
                      <div>LCP: {data.metrics.lcp ? formatTime(data.metrics.lcp) : 'N/A'}</div>
                      <div>FID: {data.metrics.fid ? formatTime(data.metrics.fid) : 'N/A'}</div>
                      <div>CLS: {data.metrics.cls ? formatCLS(data.metrics.cls) : 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Тренды производительности</CardTitle>
              <CardDescription>Анализ изменений во времени</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Графики трендов будут добавлены в следующем обновлении.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 