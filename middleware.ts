// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/jwt";

const PUBLIC_PATHS = [
    "/api/auth/login",
    "/api/auth/ldap/login", 
    "/api/auth/logout",
    "/api/health"
];

const AUTH_PATH = "/auth";
const ADMIN_PREFIX = "/admin";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Handle /auth path - redirect to home if already authenticated
    if (pathname === AUTH_PATH) {
        const token = req.cookies.get("token")?.value;
        
        if (token) {
            try {
                const decoded = await verifyToken(token);
                if (decoded) {
                    // User is already authenticated, redirect to home
                    return NextResponse.redirect(new URL("/", req.url));
                }
            } catch (error) {
                // Token is invalid, allow access to auth page
                console.error("Token verification error:", error);
            }
        }
        return NextResponse.next();
    }

    // Skip auth for public paths
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Check authentication for all other routes
    const token = req.cookies.get("token")?.value;
    console.log(`Middleware: Checking auth for ${pathname}, token present: ${!!token}`);
    
    // If no token and trying to access protected route, redirect to auth
    if (!token) {
        return NextResponse.redirect(new URL("/auth", req.url));
    }

    try {
        const decoded = await verifyToken(token);

        if (!decoded) {
            // Invalid token, redirect to auth
            const response = NextResponse.redirect(new URL("/auth", req.url));
            // Clear invalid token
            response.cookies.delete("token");
            return response;
        }

        // Check admin routes access
        if (pathname.startsWith(ADMIN_PREFIX)) {
            if (decoded.role !== "Admin") {
                console.log("User is not admin, redirecting to home");
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        // Add user info to request headers for backend use
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-user-id', decoded.id);
        requestHeaders.set('x-user-role', decoded.role);

        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
        
        return response;
        
    } catch (error) {
        console.error("Token verification error:", error);
        const response = NextResponse.redirect(new URL("/auth", req.url));
        // Clear invalid token
        response.cookies.delete("token");
        return response;
    }
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};