"use server";

import { db, products, productVariants, categories } from "@/database/db";
import { eq, desc, and, ilike, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/backend/types";
import { productStandardSchema, type ProductStandardInput } from "@/backend/validations";
import { requireAdminSession } from "@/backend/services/auth";

export async function getProducts(options?: {
  categorySlug?: string;
  search?: string;
  featured?: boolean;
}) {
  try {
    const conditions = [eq(products.estado, true)];

    if (options?.featured !== undefined) {
      conditions.push(eq(products.destacado, options.featured));
    }

    if (options?.search && options.search.trim() !== "") {
      conditions.push(ilike(products.nombre, `%${options.search.trim()}%`));
    }

    if (options?.categorySlug && options.categorySlug !== "todas") {
      conditions.push(eq(categories.slug, options.categorySlug));
    }

    const query = db
      .select({
        id: products.id,
        nombre: products.nombre,
        slug: products.slug,
        descripcion: products.descripcion,
        precio: products.precio,
        imagenUrl: products.imagenUrl,
        stock: products.stock,
        destacado: products.destacado,
        estado: products.estado,
        createdAt: products.createdAt,
        category: {
          id: categories.id,
          nombre: categories.nombre,
          slug: categories.slug,
        },
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(products.destacado), desc(products.createdAt));

    const result = await query;

    if (result.length === 0) {
      return [];
    }

    // Cargar únicamente las variantes de los productos encontrados
    const productIds = result.map((p) => p.id);
    const variants = await db
      .select()
      .from(productVariants)
      .where(inArray(productVariants.productId, productIds));

    const variantsByProduct = new Map<number, typeof variants>();
    for (const v of variants) {
      const list = variantsByProduct.get(v.productId) || [];
      list.push(v);
      variantsByProduct.set(v.productId, list);
    }

    const productsWithVariants = result.map((p) => ({
      ...p,
      variants: variantsByProduct.get(p.id) || [],
    }));

    return productsWithVariants;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const result = await db
      .select({
        id: products.id,
        nombre: products.nombre,
        slug: products.slug,
        descripcion: products.descripcion,
        precio: products.precio,
        imagenUrl: products.imagenUrl,
        stock: products.stock,
        destacado: products.destacado,
        estado: products.estado,
        createdAt: products.createdAt,
        category: {
          id: categories.id,
          nombre: categories.nombre,
          slug: categories.slug,
        },
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.slug, slug))
      .limit(1);

    if (result.length === 0) return null;

    const product = result[0];
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, product.id));

    return {
      ...product,
      variants,
    };
  } catch (error) {
    console.error("Error al buscar producto por slug:", error);
    return null;
  }
}

export async function getAllProductsAdmin() {
  try {
    await requireAdminSession("view_products");

    const [result, allVariants] = await Promise.all([
      db
        .select({
          id: products.id,
          nombre: products.nombre,
          slug: products.slug,
          descripcion: products.descripcion,
          precio: products.precio,
          imagenUrl: products.imagenUrl,
          stock: products.stock,
          destacado: products.destacado,
          estado: products.estado,
          createdAt: products.createdAt,
          categoryId: products.categoryId,
          category: {
            id: categories.id,
            nombre: categories.nombre,
          },
        })
        .from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .orderBy(desc(products.createdAt)),
      db.select().from(productVariants),
    ]);

    const variantsByProduct = new Map<number, typeof allVariants>();
    for (const v of allVariants) {
      const list = variantsByProduct.get(v.productId) || [];
      list.push(v);
      variantsByProduct.set(v.productId, list);
    }

    const productsWithVariants = result.map((p) => ({
      ...p,
      variants: variantsByProduct.get(p.id) || [],
    }));

    return productsWithVariants;
  } catch (error) {
    console.error("Error al obtener productos para admin:", error);
    return [];
  }
}

export async function createProductAction(formData: ProductStandardInput): Promise<ActionResponse<any>> {
  try {
    await requireAdminSession("create_product");

    const validated = productStandardSchema.parse(formData);

    const baseSlug = validated.nombre
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const [newProduct] = await db
      .insert(products)
      .values({
        categoryId: validated.categoryId,
        nombre: validated.nombre,
        slug,
        descripcion: validated.descripcion,
        precio: validated.precio,
        imagenUrl: validated.imagenUrl,
        stock: validated.stock,
        destacado: validated.destacado,
        estado: validated.estado,
      })
      .returning();

    if (validated.variantes && validated.variantes.length > 0) {
      for (const variant of validated.variantes) {
        if (variant.nombre.trim()) {
          await db.insert(productVariants).values({
            productId: newProduct.id,
            nombre: variant.nombre.trim(),
            stockEstimado: variant.stockEstimado || 10,
          });
        }
      }
    }

    revalidatePath("/tienda");
    revalidatePath("/admin/productos");
    revalidatePath("/");

    return {
      success: true,
      message: `Producto "${newProduct.nombre}" creado exitosamente.`,
      data: newProduct,
    };
  } catch (error: any) {
    console.error("Error al crear producto:", error);
    return {
      success: false,
      message: error?.message || "Error al crear producto.",
    };
  }
}

export async function updateProductAction(
  id: number,
  formData: ProductStandardInput
): Promise<ActionResponse<any>> {
  try {
    await requireAdminSession("edit_product");

    const validated = productStandardSchema.parse(formData);

    const [updatedProduct] = await db
      .update(products)
      .set({
        categoryId: validated.categoryId,
        nombre: validated.nombre,
        descripcion: validated.descripcion,
        precio: validated.precio,
        imagenUrl: validated.imagenUrl,
        stock: validated.stock,
        destacado: validated.destacado,
        estado: validated.estado,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    if (!updatedProduct) {
      return {
        success: false,
        message: `No se encontró el producto #${id} para actualizar.`,
      };
    }

    // Actualizar variantes si se proporcionan
    if (validated.variantes) {
      await db.delete(productVariants).where(eq(productVariants.productId, id));
      for (const variant of validated.variantes) {
        if (variant.nombre.trim()) {
          await db.insert(productVariants).values({
            productId: id,
            nombre: variant.nombre.trim(),
            stockEstimado: variant.stockEstimado || 10,
          });
        }
      }
    }

    revalidatePath("/tienda");
    revalidatePath("/admin/productos");
    revalidatePath(`/producto/${updatedProduct.slug}`);
    revalidatePath("/");

    return {
      success: true,
      message: `Producto "${updatedProduct.nombre}" actualizado correctamente.`,
      data: updatedProduct,
    };
  } catch (error: any) {
    console.error("Error al actualizar producto:", error);
    return {
      success: false,
      message: error?.message || "Error al actualizar producto.",
    };
  }
}

export async function toggleProductStatus(
  id: number,
  currentStatus: boolean
): Promise<ActionResponse<any>> {
  try {
    await requireAdminSession("edit_product");

    const [updated] = await db
      .update(products)
      .set({ estado: !currentStatus, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();

    revalidatePath("/admin/productos");
    revalidatePath("/tienda");
    revalidatePath("/");

    return {
      success: true,
      message: `Estado del producto actualizado a ${!currentStatus ? "Activo" : "Inactivo"}.`,
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Error al alternar estado.",
    };
  }
}

export async function deleteProductAction(id: number): Promise<ActionResponse<any>> {
  try {
    await requireAdminSession("delete_product");

    if (!id || typeof id !== "number" || id <= 0) {
      return {
        success: false,
        message: "ID de producto inválido.",
      };
    }

    await db.delete(products).where(eq(products.id, id));
    revalidatePath("/admin/productos");
    revalidatePath("/tienda");
    revalidatePath("/");

    return {
      success: true,
      message: `Producto #${id} eliminado satisfactoriamente.`,
    };
  } catch (error: any) {
    console.error("[deleteProductAction] Error:", error);

    // Detección segura de restricción de clave foránea en PostgreSQL (pedidos vinculados)
    if (error?.code === "23503" || String(error?.message).includes("foreign key")) {
      return {
        success: false,
        message:
          "No se puede eliminar este producto de la base de datos porque está vinculado a pedidos existentes. Puedes cambiar su estado a 'Inactivo' para retirarlo de la tienda.",
      };
    }

    return {
      success: false,
      message: "No se pudo eliminar el producto debido a un error interno del servidor.",
    };
  }
}
