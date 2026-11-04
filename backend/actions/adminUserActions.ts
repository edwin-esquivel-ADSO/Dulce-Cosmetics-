"use server";

import { db, users } from "@/database/db";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendWelcomeEmail } from "@/backend/services/emailService";
import { requireAdminSession } from "@/backend/services/auth";
import { AdminUserListItem, createAdminSchema, CreateAdminInput } from "@/backend/types";

/**
 * Obtiene la lista de todos los administradores registrados
 */
export async function getAdminUsersAction(): Promise<AdminUserListItem[]> {
  try {
    await requireAdminSession("manage_users");

    const list = await db
      .select({
        id: users.id,
        nombre: users.nombre,
        email: users.email,
        rol: users.rol,
        barrio: users.barrio,
        direccionDefault: users.direccionDefault,
        activo: users.activo,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return list;
  } catch (error) {
    console.error("[getAdminUsersAction] Error al obtener usuarios:", error);
    return [];
  }
}

/**
 * Crea un nuevo administrador o sub-administrador con contraseña encriptada y email de bienvenida
 */
export async function createAdminUserAction(data: CreateAdminInput) {
  try {
    await requireAdminSession("manage_users");

    const validated = createAdminSchema.parse(data);
    const normalizedEmail = validated.email.toLowerCase().trim();

    // Validar que el email no esté ya registrado
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        message: `El correo "${normalizedEmail}" ya está registrado en el sistema.`,
      };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        nombre: validated.nombre.trim(),
        email: normalizedEmail,
        passwordHash: hashedPassword,
        rol: validated.rol,
        barrio: validated.barrio || "Las Granjas",
        direccionDefault: validated.direccionDefault || "Sede Neiva",
        activo: true,
      })
      .returning();

    // Despachar correo de bienvenida automático
    sendWelcomeEmail({
      toEmail: newUser.email,
      userName: newUser.nombre,
      role: newUser.rol,
    }).catch((err) => console.error("[createAdminUserAction] Error en envío de correo:", err));

    revalidatePath("/admin/administradores");
    return {
      success: true,
      message: `¡Administrador ${newUser.nombre} creado con éxito! Se despachó correo de bienvenida.`,
      data: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
      },
    };
  } catch (error: any) {
    console.error("[createAdminUserAction] Error:", error);
    return {
      success: false,
      message: error?.message || "No se pudo crear el administrador.",
    };
  }
}

/**
 * Activa o suspende el estado de un administrador
 */
export async function toggleAdminUserStatusAction(userId: number, currentStatus: boolean) {
  try {
    const session = await requireAdminSession("manage_users");
    const currentUserId = Number((session.user as any).id);

    // Prevenir auto-suspensión de la cuenta en sesión
    if (currentUserId === userId && currentStatus === true) {
      return {
        success: false,
        message: "Por seguridad, no puedes suspender tu propia cuenta de administrador en sesión.",
      };
    }

    await db
      .update(users)
      .set({
        activo: !currentStatus,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/admin/administradores");
    return {
      success: true,
      message: `Estado actualizado a: ${!currentStatus ? "Activo" : "Inactivo"}.`,
    };
  } catch (error: any) {
    console.error("[toggleAdminUserStatusAction] Error:", error);
    return {
      success: false,
      message: error?.message || "Error al actualizar estado.",
    };
  }
}

/**
 * Elimina un administrador
 */
export async function deleteAdminUserAction(userId: number) {
  try {
    const session = await requireAdminSession("manage_users");
    const currentUserId = Number((session.user as any).id);

    // 1. Prevenir auto-eliminación
    if (currentUserId === userId) {
      return {
        success: false,
        message: "No puedes eliminar tu propia cuenta mientras estés en sesión.",
      };
    }

    // 2. Validar existencia del usuario objetivo
    const target = await db
      .select({ id: users.id, nombre: users.nombre, rol: users.rol })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (target.length === 0) {
      return {
        success: false,
        message: "El usuario a eliminar no fue encontrado.",
      };
    }

    if (target[0]?.nombre.toLowerCase() === "natalia") {
      return {
        success: false,
        message: "Por seguridad, el usuario principal 'Natalia' no puede ser eliminado.",
      };
    }

    // 3. Prevenir eliminar el último Administrador Principal activo
    if (target[0]?.rol === "ADMIN") {
      const activeAdmins = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.rol, "ADMIN"));

      if (activeAdmins.length <= 1) {
        return {
          success: false,
          message: "Operación denegada: Debe existir al menos un Administrador Principal en la plataforma.",
        };
      }
    }

    await db.delete(users).where(eq(users.id, userId));

    revalidatePath("/admin/administradores");
    return {
      success: true,
      message: "Administrador eliminado correctamente.",
    };
  } catch (error: any) {
    console.error("[deleteAdminUserAction] Error:", error);
    return {
      success: false,
      message: error?.message || "Error al eliminar usuario.",
    };
  }
}

const updatePasswordSchema = z.object({
  userId: z.number().int().positive(),
  newPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

/**
 * Actualiza la contraseña de un administrador (ADMIN)
 */
export async function updateAdminPasswordAction(data: { userId: number; newPassword: string }) {
  try {
    await requireAdminSession("manage_users");
    const validated = updatePasswordSchema.parse(data);

    const hashedPassword = await bcrypt.hash(validated.newPassword, 10);
    await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, validated.userId));

    return {
      success: true,
      message: "Contraseña actualizada exitosamente.",
    };
  } catch (error: any) {
    console.error("[updateAdminPasswordAction] Error:", error);
    return {
      success: false,
      message: error?.message || "No se pudo actualizar la contraseña.",
    };
  }
}
