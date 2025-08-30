import { NextRequest, NextResponse } from 'next/server'
import { deleteAllProjects } from '@/actions/project'

export async function POST(request: NextRequest) {
  try {
    const { projectIds } = await request.json()

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json(
        { error: 'Project IDs array is required' },
        { status: 400 }
      )
    }

    const result = await deleteAllProjects(projectIds)

    if (result.status === 200) {
      return NextResponse.json({ message: result.message })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
  } catch (error) {
    console.error('Error in delete all projects API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
