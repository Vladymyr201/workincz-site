import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'

// GET - получение performance данных
export async function GET() {
  try {
    const performanceRef = collection(db, 'performance_metrics')
    const q = query(performanceRef, orderBy('timestamp', 'desc'), limit(100))
    const snapshot = await getDocs(q)
    
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching performance data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}

// POST - сохранение performance данных
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metrics, timestamp, url, userAgent } = body
    
    // Валидация данных
    if (!metrics || !timestamp || !url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Сохранение в Firestore
    const performanceRef = collection(db, 'performance_metrics')
    const docRef = await addDoc(performanceRef, {
      metrics,
      timestamp,
      url,
      userAgent,
      createdAt: new Date().toISOString()
    })
    
    return NextResponse.json({ 
      success: true, 
      id: docRef.id 
    })
  } catch (error) {
    console.error('Error saving performance data:', error)
    return NextResponse.json(
      { error: 'Failed to save performance data' },
      { status: 500 }
    )
  }
} 