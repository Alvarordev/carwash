import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login"];
const SUPER_ADMIN_EMAIL = "alvaro@gmail.com";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

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

    const isAdminRoute = pathname.startsWith("/admin");

    if (user && isPublic) {
        const dest = user.email === SUPER_ADMIN_EMAIL ? "/admin" : "/dashboard";
        return NextResponse.redirect(new URL(dest, request.url));
    }

    if (!user && !isPublic) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Block non-super-admin users from /admin
    if (user && isAdminRoute && user.email !== SUPER_ADMIN_EMAIL) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
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
