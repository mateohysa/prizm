import { NextRequest, NextResponse } from 'next/server'
import { updateSlides } from '@/actions/project'

// Configure larger body size for this API route
export const runtime = 'nodejs'
export const maxDuration = 30 // 30 seconds timeout for large saves

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, slides } = body

    if (!projectId || !slides) {
      return NextResponse.json({ error: 'Missing projectId or slides' }, { status: 400 })
    }

    // Use the same server action but through API route to avoid body size limits
    await updateSlides(projectId, slides)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API route save failed:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Save failed' 
    }, { status: 500 })
  }
}
