import { NextRequest, NextResponse } from 'next/server'
import { getProjectById } from '@/actions/project'
import { getClerkUserIdFromHeaders } from '@/lib/api-context'
import { getCachedUserByClerkId } from '@/actions/user'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    
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

    // Get project by ID (this will verify the user owns the project)
    const result = await getProjectById(projectId)

    if (result.status === 200) {
      // Verify the project belongs to the authenticated user
      if (result.data?.userId !== authenticatedUser.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
      
      // Return project data without sensitive information
      const { userId, ...projectData } = result.data
      return NextResponse.json(projectData)
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
  } catch (error) {
    console.error('Error in get project API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
