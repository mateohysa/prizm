import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
    // Handle public routes
    if(isPublicRoute(req)) {
        return NextResponse.next();
    }
    
    const session = await auth();
    if (!session.userId) {
        // For API routes, return 401
        if (req.nextUrl.pathname.startsWith('/api/')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        // For other routes, redirect to sign-in
        return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    
    // For API routes under /api/projects, add auth info to headers
    // This avoids redundant auth calls in each API route
    if (req.nextUrl.pathname.startsWith('/api/projects/')) {
        // Clone the request and add user info to headers
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-clerk-user-id', session.userId);
        
        // Return the request with modified headers
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            }
        });
    }
    
    return NextResponse.next();
});

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};