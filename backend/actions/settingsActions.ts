"use server";

import { db, storeSettings } from "@/database/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionResponse } from "@/backend/types";
import { requireAdminSession } from "@/backend/services/auth";

const settingsSchema = z.object({
  brandName: z.string().trim().min(2, "El nombre de la marca debe tener al menos 2 caracteres").max(100),
  logoUrl: z
    .string()
    .trim()
    .refine((val) => val.startsWith("/") || val.startsWith("https://") || val.startsWith("http://"), {
      message: "URL de logotipo inválida (debe ser https:// o una ruta relativa)",
    }),
  faviconUrl: z
    .string()
    .trim()
    .min(1, "URL de favicon requerida")
    .refine((val) => val.startsWith("/") || val.startsWith("https://") || val.startsWith("http://"), {
      message: "URL de favicon inválida",
    }),
  announcementText: z.string().trim().max(300).optional().default(""),
  contactPhone: z.string().trim().max(30).optional().default(""),
  contactEmail: z.string().trim().email("Correo de contacto inválido").max(150).optional().or(z.literal("")),
});

type StoreSettingsInput = z.infer<typeof settingsSchema>;

const DEFAULT_SETTINGS = {
  id: 1,
  brandName: "Dulce Cosmetics",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  announcementText: "Envíos a todo Neiva • Domicilio GRATIS en Las Granjas por compras desde $15.000",
  contactPhone: "+57 317 778 0413",
  contactEmail: "contacto@dulcecosmetics.com",
};

let cachedSettingsData: typeof DEFAULT_SETTINGS | null = null;
let lastCacheTime = 0;
const CACHE_LIFETIME = 5 * 60 * 1000; // 5 minutos

/**
 * Recupera la configuración actual de branding de la tienda
 */
export async function getStoreSettings(): Promise<ActionResponse<typeof DEFAULT_SETTINGS>> {
  if (cachedSettingsData && Date.now() - lastCacheTime < CACHE_LIFETIME) {
    return {
      success: true,
      message: "Configuración cargada de caché.",
      data: cachedSettingsData,
    };
  }

  try {
    const list = await db.select().from(storeSettings).where(eq(storeSettings.id, 1)).limit(1);

    if (list.length === 0) {
      // Si no existe, creamos el registro inicial con valores por defecto
      const [inserted] = await db
        .insert(storeSettings)
        .values(DEFAULT_SETTINGS)
        .returning();

      cachedSettingsData = inserted as any;
      lastCacheTime = Date.now();

      return {
        success: true,
        message: "Configuración inicial creada exitosamente.",
        data: inserted as any,
      };
    }

    cachedSettingsData = list[0] as any;
    lastCacheTime = Date.now();

    return {
      success: true,
      message: "Configuración cargada correctamente.",
      data: list[0] as any,
    };
  } catch (error: any) {
    console.error("[getStoreSettings] Error:", error);
    return {
      success: false,
      message: error?.message || "Error al recuperar configuración.",
      data: DEFAULT_SETTINGS,
    };
  }
}

/**
 * Actualiza la configuración de marca y branding dinámico (ADMIN)
 */
export async function updateStoreSettingsAction(
  formData: StoreSettingsInput
): Promise<ActionResponse<any>> {
  try {
    await requireAdminSession("manage_settings");

    const validated = settingsSchema.parse(formData);

    const [updated] = await db
      .insert(storeSettings)
      .values({
        id: 1,
        brandName: validated.brandName,
        logoUrl: validated.logoUrl,
        faviconUrl: validated.faviconUrl,
        announcementText: validated.announcementText,
        contactPhone: validated.contactPhone,
        contactEmail: validated.contactEmail,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: storeSettings.id,
        set: {
          brandName: validated.brandName,
          logoUrl: validated.logoUrl,
          faviconUrl: validated.faviconUrl,
          announcementText: validated.announcementText,
          contactPhone: validated.contactPhone,
          contactEmail: validated.contactEmail,
          updatedAt: new Date(),
        },
      })
      .returning();

    cachedSettingsData = updated as any;
    lastCacheTime = Date.now();

    revalidatePath("/", "layout");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Branding y configuración de la tienda actualizados con éxito.",
      data: updated,
    };
  } catch (error: any) {
    console.error("[updateStoreSettingsAction] Error:", error);
    return {
      success: false,
      message: error?.message || "Error al actualizar configuración.",
    };
  }
}
