import { NextRequest, NextResponse } from 'next/server'
import { getDeletedProjectsPaginated } from '@/actions/project'
import { getCachedAuthenticatedUser } from '@/actions/user'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '8')

    // Get authenticated user using cached authentication
    const authenticatedUser = await getCachedAuthenticatedUser()
    
    if (authenticatedUser.status !== 200 || !authenticatedUser.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Get paginated deleted projects
    const result = await getDeletedProjectsPaginated(page, limit, authenticatedUser)

    if (result.status === 200) {
      return NextResponse.json(result.data)
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
  } catch (error) {
    console.error('Error in paginated deleted projects API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
