import type { NextRequest } from 'next/server'

// This file sets the runtime for API routes
export const runtime = 'nodejs'

// This ensures all API routes use Node.js runtime by default
export const dynamic = 'force-dynamic'

export async function middleware(request: NextRequest) {
  return Response.json({ runtime: 'nodejs' })
} 