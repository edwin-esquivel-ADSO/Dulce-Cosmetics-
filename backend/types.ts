import { z } from "zod";
import { productStandardSchema, type ProductStandardInput } from "./validations";

/**
 * Respuesta estándar unificada para Server Actions
 */
export type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
};

/**
 * Tipo para producto validado
 */
export type { ProductStandardInput };

/**
 * Tipo para listado de usuarios administrativos
 */
export interface AdminUserListItem {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  barrio: string | null;
  direccionDefault: string | null;
  activo: boolean;
  createdAt: Date;
}

/**
 * Esquema y tipo para creación de administradores
 */
export const createAdminSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.enum(["ADMIN", "SUB_ADMIN"]).default("ADMIN"),
  barrio: z.string().optional().default("Las Granjas"),
  direccionDefault: z.string().optional().default("Sede Neiva"),
});

export type CreateAdminInput = z.input<typeof createAdminSchema>;

/**
 * Configuración de la tienda
 */
export interface StoreSettingsData {
  id: number;
  brandName: string;
  logoUrl: string;
  faviconUrl: string;
  announcementText: string;
  contactPhone: string;
  contactEmail: string;
}
