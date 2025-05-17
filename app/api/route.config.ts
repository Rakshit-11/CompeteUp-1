import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  return Response.json({ runtime: 'nodejs' })
} 