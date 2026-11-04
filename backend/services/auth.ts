import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db, users } from "@/database/db";
import { eq, or, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "./emailService";

// Matriz de permisos RBAC para ADMIN y SUB_ADMIN (Puntos 8, 15)
export type Role = "ADMIN" | "SUB_ADMIN";

export type AdminAction =
  | "view_dashboard"
  | "view_orders"
  | "update_order_status"
  | "view_products"
  | "create_product"
  | "edit_product"
  | "delete_product"
  | "manage_settings"
  | "manage_users";

const ROLE_PERMISSIONS: Record<Role, AdminAction[]> = {
  ADMIN: [
    "view_dashboard",
    "view_orders",
    "update_order_status",
    "view_products",
    "create_product",
    "edit_product",
    "delete_product",
    "manage_settings",
    "manage_users",
  ],
  SUB_ADMIN: [
    "view_dashboard",
    "view_orders",
    "update_order_status",
    "view_products",
    "create_product",
    "edit_product",
    // SUB_ADMIN no tiene permisos para eliminar productos ni modificar configuración de marca
  ],
};

export function hasPermission(role: string | undefined | null, action: AdminAction): boolean {
  if (!role) return false;
  const normalizedRole = role.toUpperCase() as Role;
  const permissions = ROLE_PERMISSIONS[normalizedRole];
  return permissions ? permissions.includes(action) : false;
}

// Protección contra ataques de fuerza bruta (Rate Limiting de inicio de sesión)
interface FailedAttemptInfo {
  count: number;
  lastAttempt: number;
  lockUntil?: number;
}

const failedAttemptsMap = new Map<string, FailedAttemptInfo>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos de bloqueo tras 5 intentos fallidos

function checkRateLimit(key: string) {
  const now = Date.now();
  const record = failedAttemptsMap.get(key);
  if (!record) return;

  if (record.lockUntil && now < record.lockUntil) {
    const minutesLeft = Math.ceil((record.lockUntil - now) / 60000);
    throw new Error(
      `Acceso bloqueado por seguridad: Demasiados intentos fallidos. Intenta nuevamente en ${minutesLeft} minuto(s).`
    );
  }

  // Si ya transcurrió el tiempo de penalización o ventana de 30 mins, resetear
  if ((record.lockUntil && now >= record.lockUntil) || now - record.lastAttempt > 30 * 60 * 1000) {
    failedAttemptsMap.delete(key);
  }
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const record = failedAttemptsMap.get(key) || { count: 0, lastAttempt: now };
  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockUntil = now + LOCKOUT_DURATION_MS;
  }
  failedAttemptsMap.set(key, record);
}

function clearFailedAttempts(key: string) {
  failedAttemptsMap.delete(key);
}

function getJwtSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    // Durante la fase de build estático de Next.js, permitir fallback seguro sin bloquear la generación de páginas
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
      throw new Error(
        "CRITICAL SECURITY ERROR: NEXTAUTH_SECRET is not configured in production. Configure it in Vercel environment variables."
      );
    }
    return "dulce-cosmetics-dev-fallback-secret-key-32chars";
  }
  if (secret.length < 32 && process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
    throw new Error(
      "CRITICAL SECURITY ERROR: NEXTAUTH_SECRET must be at least 32 characters long for cryptographic security."
    );
  }
  return secret;
}

export const authOptions: NextAuthOptions = {
  secret: getJwtSecret(),
  useSecureCookies: process.env.NODE_ENV === "production",
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 días (reducido desde 30 días para limitar ventana de exposición de sesión)
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Administración Dulce Cosmetics",
      credentials: {
        identifier: { label: "Nombre o Correo", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const rawIdentifier = (credentials?.identifier || "").trim();
        const rawPassword = credentials?.password || "";

        if (!rawIdentifier || !rawPassword) {
          throw new Error("Debes ingresar tu usuario/correo y contraseña.");
        }

        const normalizedKey = rawIdentifier.toLowerCase();

        // 1. Validar límite de intentos y mitigar fuerza bruta
        checkRateLimit(normalizedKey);

        try {
          // 2. Buscar usuario existente en la base de datos por email o nombre
          const userList = await db
            .select()
            .from(users)
            .where(
              or(
                eq(sql`LOWER(${users.email})`, normalizedKey),
                eq(sql`LOWER(${users.nombre})`, normalizedKey)
              )
            )
            .limit(1);

          if (userList.length === 0) {
            recordFailedAttempt(normalizedKey);
            throw new Error("Credenciales inválidas. Verifica tu usuario o contraseña.");
          }

          const user = userList[0];

          // 3. Validar estado de la cuenta
          if (!user.activo) {
            throw new Error("Esta cuenta administrativa está suspendida o inactiva.");
          }

          // 4. Comparación criptográfica segura de la contraseña con bcrypt
          let isValidPassword = false;
          try {
            isValidPassword = await bcrypt.compare(rawPassword, user.passwordHash);
          } catch {
            isValidPassword = false;
          }

          // Respaldo de migración en caso de contraseñas de inicialización en texto plano
          if (!isValidPassword && user.passwordHash === rawPassword) {
            const upgradedHash = await bcrypt.hash(rawPassword, 10);
            await db.update(users).set({ passwordHash: upgradedHash }).where(eq(users.id, user.id));
            isValidPassword = true;
          }

          if (!isValidPassword) {
            recordFailedAttempt(normalizedKey);
            throw new Error("Contraseña incorrecta. Intenta nuevamente.");
          }

          // Acceso exitoso: reiniciar contador de fallos
          clearFailedAttempts(normalizedKey);

          return {
            id: String(user.id),
            name: user.nombre,
            email: user.email,
            role: user.rol.toUpperCase() as Role,
          };
        } catch (error: any) {
          console.error("[Auth] Error de autorización:", error?.message);
          throw new Error(error.message || "Error al autenticar usuario.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token.role as Role) || "SUB_ADMIN";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Si es una ruta relativa, mantenerla relativa para no forzar dominios obsoletos de preview
      if (url.startsWith("/")) return url;
      try {
        const parsed = new URL(url);
        if (parsed.origin === baseUrl || parsed.hostname.endsWith(".vercel.app")) {
          return url;
        }
      } catch {}
      return "/admin/login";
    },
  },
};

export async function getAdminSession() {
  return await getServerSession(authOptions);
}

export async function requireAdminSession(actionOrRole: AdminAction | Role = "view_dashboard") {
  const session = await getAdminSession();
  if (!session || !session.user) {
    throw new Error("Acceso denegado: Sesión no válida o expirada.");
  }

  const rawRole = (session.user as any).role || "";
  const userRole = (rawRole.toUpperCase() as Role) || "SUB_ADMIN";

  if (actionOrRole === "ADMIN") {
    if (userRole !== "ADMIN") {
      throw new Error("Acceso denegado: Se requiere rol de Administrador Principal.");
    }
    return session;
  }

  if (actionOrRole === "SUB_ADMIN") {
    if (userRole !== "ADMIN" && userRole !== "SUB_ADMIN") {
      throw new Error("Acceso denegado: Se requiere una cuenta administrativa activa.");
    }
    return session;
  }

  // Comprobación de permiso RBAC granular
  const hasAccess = hasPermission(userRole, actionOrRole as AdminAction);
  if (!hasAccess) {
    throw new Error(
      `Acceso denegado: Tu rol (${userRole}) no cuenta con autorización para ejecutar "${actionOrRole}".`
    );
  }

  return session;
}
