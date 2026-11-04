import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./db";
import * as schema from "./schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import catalogProducts from "../data/catalogo-dulce-cosmetics.json";

async function seed() {
  console.log("🌸 Iniciando Seed para Dulce Cosmetics (Neiva, Huila)...");

  // 1. Zonas de Envío en Neiva
  console.log("📍 Creando zonas de envío locales...");
  const shippingZonesData: schema.NewShippingZone[] = [
    { nombreBarrio: "Las Granjas", costo: 0, compraMinima: 15000, activo: true },
    { nombreBarrio: "Centro", costo: 5000, compraMinima: 20000, activo: true },
    { nombreBarrio: "Cándido Leguízamo", costo: 4000, compraMinima: 20000, activo: true },
    { nombreBarrio: "Santa Inés", costo: 4000, compraMinima: 20000, activo: true },
    { nombreBarrio: "Quirinal", costo: 4000, compraMinima: 20000, activo: true },
    { nombreBarrio: "Ipanema", costo: 6000, compraMinima: 25000, activo: true },
    { nombreBarrio: "Altico", costo: 5000, compraMinima: 20000, activo: true },
    { nombreBarrio: "Prado Alto", costo: 5000, compraMinima: 20000, activo: true },
    { nombreBarrio: "Canaima", costo: 6000, compraMinima: 25000, activo: true },
    { nombreBarrio: "Los Andes", costo: 5000, compraMinima: 20000, activo: true },
    { nombreBarrio: "Resto de Neiva", costo: 6000, compraMinima: 25000, activo: true },
  ];

  for (const zone of shippingZonesData) {
    await db.insert(schema.shippingZones).values(zone).onConflictDoNothing();
  }

  // 2. Categorías Oficiales del Catálogo
  console.log("💄 Sincronizando categorías del catálogo real...");
  const categoriesData: schema.NewCategory[] = [
    { nombre: "Labiales & Brillos", slug: "labiales", estado: true },
    { nombre: "Pestañinas", slug: "pestaninas", estado: true },
    { nombre: "Ojos & Cejas", slug: "ojos-cejas", estado: true },
    { nombre: "Polvos & Iluminadores", slug: "polvos", estado: true },
    { nombre: "Bases y Correctores", slug: "bases-correctores", estado: true },
    { nombre: "Rubores & Rostro", slug: "rubores", estado: true },
    { nombre: "Rostro & Fijadores", slug: "rostro-fijadores", estado: true },
    { nombre: "Sombras & Paletas", slug: "sombras-paletas", estado: true },
    { nombre: "Skincare & Cuidado Facial", slug: "skincare", estado: true },
    { nombre: "Accesorios & Belleza", slug: "accesorios", estado: true },
    { nombre: "Cabello & Accesorios", slug: "cabello-accesorios", estado: true },
    { nombre: "Cuidado Personal & Manicura", slug: "cuidado-personal", estado: true },
  ];

  for (const cat of categoriesData) {
    await db.insert(schema.categories).values(cat).onConflictDoNothing();
  }

  const allCategories = await db.select().from(schema.categories);
  const catMap = new Map(allCategories.map((c) => [c.slug, c.id]));

  // 3. Inserción de Productos Oficiales del Catálogo de Dulce Cosmetics
  console.log(`✨ Insertando ${catalogProducts.length} productos reales del catálogo...`);

  for (const prod of catalogProducts) {
    const categoryId = catMap.get(prod.categoriaSlug) || catMap.get("labiales")!;

    // Verificar si ya existe para actualizar o insertar
    const existing = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(eq(schema.products.slug, prod.slug))
      .limit(1);

    let productId: number;

    if (existing.length > 0) {
      productId = existing[0].id;
      await db
        .update(schema.products)
        .set({
          categoryId,
          nombre: prod.nombre,
          descripcion: prod.descripcion,
          precio: prod.precio,
          imagenUrl: prod.imagenUrl,
          stock: prod.stock,
          destacado: prod.destacado,
          estado: true,
          updatedAt: new Date(),
        })
        .where(eq(schema.products.id, productId));
      console.log(`  ↻ Actualizado: ${prod.nombre} ($${prod.precio.toLocaleString("es-CO")} COP)`);
    } else {
      const [inserted] = await db
        .insert(schema.products)
        .values({
          categoryId,
          nombre: prod.nombre,
          slug: prod.slug,
          descripcion: prod.descripcion,
          precio: prod.precio,
          imagenUrl: prod.imagenUrl,
          stock: prod.stock,
          destacado: prod.destacado,
          estado: true,
        })
        .returning({ id: schema.products.id });
      productId = inserted.id;
      console.log(`  + Insertado: ${prod.nombre} ($${prod.precio.toLocaleString("es-CO")} COP)`);
    }

    // Variantes
    if (prod.variantes && prod.variantes.length > 0) {
      for (const varName of prod.variantes) {
        const existingVar = await db
          .select({ id: schema.productVariants.id })
          .from(schema.productVariants)
          .where(
            and(
              eq(schema.productVariants.productId, productId),
              eq(schema.productVariants.nombre, varName)
            )
          )
          .limit(1);

        if (existingVar.length === 0) {
          await db.insert(schema.productVariants).values({
            productId,
            nombre: varName,
            stockEstimado: Math.ceil(prod.stock / prod.variantes.length),
          });
        }
      }
    }
  }

  // 4. Usuario Administrador Inicial
  console.log("👤 Verificando usuario administrador por defecto...");
  const initialPasswordHash = bcrypt.hashSync("admin123", 12);
  await db
    .insert(schema.users)
    .values({
      nombre: "Administrador Dulce Cosmetics",
      email: "admin@dulcecosmetics.com",
      passwordHash: initialPasswordHash,
      rol: "ADMIN",
      barrio: "Las Granjas",
      direccionDefault: "Carrera 7 #38-16 B/ Las Granjas, Neiva",
    })
    .onConflictDoNothing();

  console.log("✅ Seed completado exitosamente para Dulce Cosmetics!");
}

seed()
  .catch((err) => {
    console.error("❌ Error en el seed:", err);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
