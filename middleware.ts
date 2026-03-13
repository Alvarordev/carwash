import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login"];
const SUPER_ADMIN_EMAIL = "alvaro@gmail.com";

function getUserRole(user: { app_metadata?: unknown } | null) {
    if (!user?.app_metadata || typeof user.app_metadata !== "object") {
        return "";
    }

    const role = (user.app_metadata as { role?: unknown }).role;
    return typeof role === "string" ? role.toLowerCase() : "";
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const errorParam = request.nextUrl.searchParams.get("error");

    const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
    const isAdminRoute = pathname.startsWith("/admin");
    const isDashboardRoute = !isPublic && !isAdminRoute;
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL ?? SUPER_ADMIN_EMAIL;

    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const role = getUserRole(user);
    const isSuperAdmin = user?.email === superAdminEmail;
    const canAccessDashboard = isSuperAdmin || role === "admin";

    if (user && isPublic && !errorParam) {
        if (isSuperAdmin) {
            return NextResponse.redirect(new URL("/admin", request.url));
        }

        if (canAccessDashboard) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    if (!user && !isPublic) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Block non-super-admin users from /admin
    if (user && isAdminRoute && !isSuperAdmin) {
        await supabase.auth.signOut();
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "forbidden");
        return NextResponse.redirect(loginUrl);
    }

    if (user && isDashboardRoute && !canAccessDashboard) {
        await supabase.auth.signOut();
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "forbidden");
        return NextResponse.redirect(loginUrl);
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - _next/data (RSC data fetching — avoids parallel token refresh races)
         * - favicon.ico, fonts, and common static extensions
         */
        "/((?!_next/static|_next/image|_next/data|favicon.ico|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
};
