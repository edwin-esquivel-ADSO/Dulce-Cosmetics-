import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalizedPath = pathname.toLowerCase();

  // Redirección canónica de rutas duplicadas /web hacia las rutas principales
  if (normalizedPath === "/web") {
    return NextResponse.redirect(new URL("/", request.url), 301);
  }
  if (normalizedPath === "/web/checkout") {
    return NextResponse.redirect(new URL("/checkout", request.url), 301);
  }

  const secret =
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === "production"
      ? ""
      : "dulce-cosmetics-dev-fallback-secret-key-32chars");

  if (process.env.NODE_ENV === "production" && !secret) {
    console.error("[Middleware Security] ALERTA CRÍTICA: NEXTAUTH_SECRET no está configurado en producción.");
  }

  // Si ya tiene sesión activa con rol administrativo y visita /admin/login, redirigir al panel /admin
  if (normalizedPath === "/admin/login") {
    try {
      if (secret) {
        const token = await getToken({ req: request, secret });
        if (token) {
          const role = String(token.role || "").toUpperCase();
          if (role === "ADMIN" || role === "SUB_ADMIN") {
            return NextResponse.redirect(new URL("/admin", request.url));
          }
        }
      }
    } catch {
      // Si hay error en verificación de cookie, continúa al login normalmente
    }
    return NextResponse.next();
  }

  // Rutas administrativas que requieren autenticación estricta (protección case-insensitive y fail-closed)
  if (normalizedPath === "/admin" || normalizedPath.startsWith("/admin/")) {
    let token = null;
    try {
      if (secret) {
        token = await getToken({
          req: request,
          secret,
        });
      }
    } catch (err: any) {
      console.error("[Middleware Security] Error al verificar token administrativo:", err?.message);
      token = null;
    }

    const role = String(token?.role || "").toUpperCase();
    const isAuthorized = Boolean(token && (role === "ADMIN" || role === "SUB_ADMIN"));

    if (!isAuthorized) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/web", "/web/:path*"],
};

