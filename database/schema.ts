import { pgTable, serial, varchar, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Configuración Dinámica de la Tienda (Branding - Punto 14)
export const storeSettings = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  brandName: varchar("brand_name", { length: 255 }).default("Dulce Cosmetics").notNull(),
  logoUrl: text("logo_url").notNull(),
  faviconUrl: text("favicon_url").default("/favicon.ico").notNull(),
  announcementText: text("announcement_text"),
  contactPhone: varchar("contact_phone", { length: 50 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Usuarios (Administradores y Sub-Admins con roles estrictos - Puntos 8, 15)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  rol: varchar("rol", { length: 50 }).default("ADMIN").notNull(), // 'ADMIN' | 'SUB_ADMIN'
  barrio: varchar("barrio", { length: 150 }),
  direccionDefault: varchar("direccion_default", { length: 255 }),
  activo: boolean("activo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. Categorías de Belleza
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 150 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  estado: boolean("estado").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Catálogo de Productos (Campos estandarizados obligatorios - Puntos 9, 10)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .references(() => categories.id, { onDelete: "cascade" })
    .notNull(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  descripcion: text("descripcion").notNull(),
  precio: integer("precio").notNull(), // Almacenado en COP (ej. 28000)
  imagenUrl: text("imagen_url").notNull(),
  stock: integer("stock").default(10).notNull(),
  destacado: boolean("destacado").default(false).notNull(),
  estado: boolean("estado").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 5. Variantes de Producto (Tonalidades, Tamaños, Acabados)
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  nombre: varchar("nombre", { length: 150 }).notNull(),
  stockEstimado: integer("stock_estimado").default(10).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Órdenes / Pedidos (Puntos 2, 8, 12)
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  nombreCliente: varchar("nombre_cliente", { length: 255 }).notNull(),
  telefono: varchar("telefono", { length: 50 }).notNull(),
  direccion: varchar("direccion", { length: 255 }).notNull(),
  barrio: varchar("barrio", { length: 150 }).notNull(),
  ciudad: varchar("ciudad", { length: 100 }).default("Neiva").notNull(),
  metodoPago: varchar("metodo_pago", { length: 50 }).notNull(), // 'efectivo' | 'nequi' | 'daviplata'
  total: integer("total").notNull(),
  costoDomicilio: integer("costo_domicilio").default(0).notNull(),
  estado: varchar("estado", { length: 50 }).default("Pendiente").notNull(), // 'Pendiente' | 'Confirmado' | 'Enviado' | 'Entregado' | 'Cancelado'
  notas: text("notas"),
  requiereAsesoria: boolean("requiere_asesoria").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 7. Ítems de Órdenes
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id, { onDelete: "restrict" })
    .notNull(),
  variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  cantidad: integer("cantidad").notNull(),
  precioUnitario: integer("precio_unitario").notNull(),
});

// Relaciones Drizzle ORM
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  orderItems: many(orderItems),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

// Tipos inferidos
export type StoreSetting = typeof storeSettings.$inferSelect;
export type NewStoreSetting = typeof storeSettings.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

// 8. Zonas de Envío (Específico para Neiva)
export const shippingZones = pgTable("shipping_zones", {
  id: serial("id").primaryKey(),
  nombreBarrio: varchar("nombre_barrio", { length: 150 }).notNull(),
  costo: integer("costo").default(0).notNull(),
  compraMinima: integer("compra_minima").default(15000).notNull(),
  activo: boolean("activo").default(true).notNull(),
});

export type ShippingZone = typeof shippingZones.$inferSelect;
export type NewShippingZone = typeof shippingZones.$inferInsert;

