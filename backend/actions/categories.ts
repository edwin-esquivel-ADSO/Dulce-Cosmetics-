"use server";

import { db, categories } from "@/database/db";
import { eq, asc } from "drizzle-orm";
import { requireAdminSession } from "@/backend/services/auth";

export async function getCategories() {
  try {
    const list = await db
      .select()
      .from(categories)
      .where(eq(categories.estado, true))
      .orderBy(asc(categories.nombre));
    return list;
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return [];
  }
}

export async function getAllCategoriesAdmin() {
  try {
    await requireAdminSession("view_products");
    const list = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.nombre));
    return list;
  } catch (error) {
    console.error("Error al obtener categorías de admin:", error);
    return [];
  }
}
