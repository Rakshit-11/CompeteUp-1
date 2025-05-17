import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define the session claims interface
interface CustomPublicMetadata {
  hasCompletedProfile?: boolean;
}

interface CustomSessionClaims {
  metadata?: {
    hasCompletedProfile?: boolean;
  };
}

export default authMiddleware({
  publicRoutes: [
    '/',
    '/events/:id',
    '/api/webhook/clerk',
    '/api/webhook/stripe',
    '/api/uploadthing',
    '/onboarding'
  ],
  ignoredRoutes: [
    '/api/webhook/clerk',
    '/api/webhook/stripe',
    '/api/uploadthing'
  ],
  async afterAuth(auth, req) {
    // If the user is logged in and trying to access a protected route
    if (auth.userId && !auth.isPublicRoute) {
      const sessionClaims = auth.sessionClaims as CustomSessionClaims;
      const hasCompletedProfile = sessionClaims?.metadata?.hasCompletedProfile;
      
      // If user hasn't completed their profile and isn't already on the onboarding page
      if (!hasCompletedProfile && !req.nextUrl.pathname.startsWith('/onboarding')) {
        const onboarding = new URL('/onboarding', req.url);
        return NextResponse.redirect(onboarding);
      }
    }

    // If user is not logged in and trying to access onboarding, redirect to sign-in
    if (!auth.userId && req.nextUrl.pathname === '/onboarding') {
      const signIn = new URL('/sign-in', req.url);
      return NextResponse.redirect(signIn);
    }
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};

export function middleware(request: NextRequest) {
  return NextResponse.next()
}
 