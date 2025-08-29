import { NextRequest, NextResponse } from 'next/server'
import { recoverProject } from '@/actions/project'

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const result = await recoverProject(projectId)

    if (result.status === 200) {
      return NextResponse.json({ message: result.message })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
  } catch (error) {
    console.error('Error in recover project API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
