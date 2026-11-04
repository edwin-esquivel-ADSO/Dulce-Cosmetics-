"use server";

import { db, categories, hasDatabaseConfigured } from "@/database/db";
import { eq, asc } from "drizzle-orm";
import { requireAdminSession } from "@/backend/services/auth";

const FALLBACK_CATEGORIES = [
  { id: 1, nombre: "Labiales & Brillos", slug: "labiales", descripcion: "Labiales mate, brillos y tintas de alta duración.", estado: true },
  { id: 2, nombre: "Polvos & Rostro", slug: "polvos", descripcion: "Polvos de arroz, traslúcidos, polvos de hadas y bases.", estado: true },
  { id: 3, nombre: "Pestañinas & Ojos", slug: "pestaninas", descripcion: "Pestañinas 4D a prueba de agua, delineadores y sombras.", estado: true },
  { id: 4, nombre: "Cuidado Facial (Skincare)", slug: "skincare", descripcion: "Kits de ácido hialurónico, arroz, rosas y protectores.", estado: true },
  { id: 5, nombre: "Fijadores & Primer", slug: "fijadores", descripcion: "Primer en gel y fijadores resistentes al clima de Neiva.", estado: true },
  { id: 6, nombre: "Herramientas & Accesorios", slug: "accesorios", descripcion: "Beauty blenders, encrespadores, perfiladores y cepillos.", estado: true },
];

export async function getCategories() {
  if (!hasDatabaseConfigured()) {
    return FALLBACK_CATEGORIES;
  }

  try {
    const list = await db
      .select()
      .from(categories)
      .where(eq(categories.estado, true))
      .orderBy(asc(categories.nombre));
    return list.length > 0 ? list : FALLBACK_CATEGORIES;
  } catch (error) {
    console.warn("[getCategories] Retornando categorías de respaldo:", error);
    return FALLBACK_CATEGORIES;
  }
}

export async function getAllCategoriesAdmin() {
  try {
    await requireAdminSession("view_products");
    if (!hasDatabaseConfigured()) {
      return FALLBACK_CATEGORIES;
    }
    const list = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.nombre));
    return list.length > 0 ? list : FALLBACK_CATEGORIES;
  } catch (error) {
    console.error("Error al obtener categorías de admin:", error);
    return FALLBACK_CATEGORIES;
  }
}
