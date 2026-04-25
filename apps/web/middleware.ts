import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define the routes that are protected
const PROTECTED_ROUTES = ['/api/atm', '/api/predict', '/api/optimize', '/api/analytics', '/api/alerts', '/api/logs'];

// Define roles required for specific paths
// Using a map to easily configure path prefixes to required minimum roles or exact matching logic
const ROLE_REQUIREMENTS: { pathPrefix: string; allowedRoles: string[] }[] = [
  // Analytics and predictions are for ADMIN and SUPERADMIN only
  { pathPrefix: '/api/analytics', allowedRoles: ['SUPERADMIN', 'ADMIN'] },
  { pathPrefix: '/api/predict', allowedRoles: ['SUPERADMIN', 'ADMIN'] },
  { pathPrefix: '/api/optimize', allowedRoles: ['SUPERADMIN', 'ADMIN'] },
  { pathPrefix: '/api/alerts', allowedRoles: ['SUPERADMIN', 'ADMIN'] },
  { pathPrefix: '/api/logs', allowedRoles: ['SUPERADMIN'] },
  // SUPERADMIN only paths
  { pathPrefix: '/api/atm/import', allowedRoles: ['SUPERADMIN'] },
  { pathPrefix: '/api/atm/sync', allowedRoles: ['SUPERADMIN'] },
  // USER can access general ATM listings and specific ID lookups but NO stats
  { pathPrefix: '/api/atm', allowedRoles: ['SUPERADMIN', 'ADMIN', 'USER'] },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // 1. Extract Token
  // Try Bearer token first
  const authHeader = request.headers.get('authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Fallback to cookie if exists
    token = request.cookies.get('token')?.value;
  }

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: Missing Authentication Token' }, { status: 401 });
  }

  // 2. Verify Token Setup
  const sec = process.env.JWT_SECRET;
  if (!sec) {
    console.error("JWT_SECRET is missing from environment variables.");
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  // 3. Verify Token and Check Roles
  try {
    const secret = new TextEncoder().encode(sec);
    const { payload } = await jwtVerify(token, secret);
    
    // Add user info to headers for downstream consumption by Next.js API Routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-role', payload.role as string);
    
    const userRole = payload.role as string;
    
    // 4. Role Authorization Logic
    // Find the most specific requirement that matches the current pathname
    const matchedRequirement = ROLE_REQUIREMENTS.find(req => pathname.startsWith(req.pathPrefix));
    
    if (matchedRequirement) {
        if (!matchedRequirement.allowedRoles.includes(userRole)) {
            return NextResponse.json({ 
                error: 'Forbidden: Insufficient Permissions',
                message: `This action requires one of the following roles: ${matchedRequirement.allowedRoles.join(', ')}` 
            }, { status: 403 });
        }
    }

    // Pass through if authorized
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    // Log minimal info in production
    console.error('JWT Verification failed:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid or Expired Token' }, { status: 401 });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (auth routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
