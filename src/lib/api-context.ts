import { NextRequest } from 'next/server'

/**
 * Get Clerk user ID from headers (set by middleware)
 * This avoids redundant auth calls
 */
export function getClerkUserIdFromHeaders(request: NextRequest): string | null {
  return request.headers.get('x-clerk-user-id')
}
