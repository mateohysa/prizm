import { NextRequest, NextResponse } from 'next/server'
import { recoverProject } from '@/actions/project'
import { getClerkUserIdFromHeaders } from '@/lib/api-context'
import { getCachedUserByClerkId } from '@/actions/user'

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Get Clerk user ID from headers (set by middleware)
    const clerkUserId = getClerkUserIdFromHeaders(request)
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Get user from database using cached function
    const authenticatedUser = await getCachedUserByClerkId(clerkUserId)
    
    if (authenticatedUser.status !== 200 || !authenticatedUser.user) {
      return NextResponse.json(
        { error: authenticatedUser.error || 'User not found' },
        { status: authenticatedUser.status }
      )
    }

    const result = await recoverProject(projectId, authenticatedUser)

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
