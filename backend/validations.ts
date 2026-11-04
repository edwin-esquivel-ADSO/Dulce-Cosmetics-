import { z } from "zod";

// Validación estandarizada para productos (Puntos 9, 10)
export const productStandardSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(150, "El nombre no puede exceder 150 caracteres"),
  categoryId: z.coerce.number().int().positive("Debes seleccionar una categoría válida"),
  descripcion: z.string().trim().min(5, "La descripción es requerida").max(3000, "La descripción no puede exceder 3000 caracteres"),
  precio: z.coerce.number().positive("El precio debe ser mayor a 0").max(100000000, "Precio excede el valor máximo permitido"),
  imagenUrl: z
    .string()
    .trim()
    .url("Debe ser una URL válida")
    .refine((val) => val.startsWith("https://") || val.startsWith("http://") || val.startsWith("/"), {
      message: "La URL de imagen debe comenzar con https:// o ruta relativa válida",
    }),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo").max(100000, "Stock inválido").default(10),
  destacado: z.boolean().default(false),
  estado: z.boolean().default(true),
  variantes: z
    .array(
      z.object({
        nombre: z.string().trim().min(1, "Nombre de variante requerido").max(100, "Nombre de variante muy largo"),
        stockEstimado: z.coerce.number().int().min(0).max(100000).default(10),
      })
    )
    .max(20, "Máximo 20 variantes por producto")
    .optional(),
});

export const createProductSchema = productStandardSchema;

// Validación para ítems de la orden
export const orderItemSchema = z.object({
  productId: z.number().int().positive("ID de producto inválido"),
  productName: z.string().trim().min(1).max(150),
  variantId: z.number().int().positive().nullable().optional(),
  variantName: z.string().trim().max(100).nullable().optional(),
  cantidad: z.number().int().min(1, "La cantidad mínima es 1").max(999, "Cantidad máxima excedida"),
  precioUnitario: z.number().optional().default(0),
});

// Validación para creación de pedidos (Checkout de Dulce Cosmetics en Neiva)
export const createOrderSchema = z.object({
  nombreCliente: z.string().trim().min(2, "El nombre completo es obligatorio").max(100, "El nombre no puede exceder 100 caracteres"),
  telefono: z
    .string()
    .trim()
    .min(7, "Número de teléfono no válido")
    .max(20, "Número de teléfono demasiado largo")
    .regex(/^[0-9+\s-]+$/, "Solo números, espacios y signos '+' o '-' permitidos en teléfono"),
  direccion: z.string().trim().min(4, "Dirección completa requerida (calle, carrera, número, apto)").max(200, "Dirección excede 200 caracteres"),
  barrio: z.string().trim().min(2, "Por favor indica tu barrio en Neiva").max(100, "Barrio excede 100 caracteres"),
  metodoPago: z.enum(["efectivo", "nequi", "daviplata"], {
    errorMap: () => ({ message: "Selecciona un método de pago válido (efectivo, nequi o daviplata)" }),
  }),
  notas: z.string().trim().max(500, "Las notas no pueden exceder 500 caracteres").optional().default(""),
  requiereAsesoria: z.boolean().default(false),
  items: z.array(orderItemSchema).min(1, "El carrito no puede estar vacío").max(50, "Máximo 50 ítems por orden"),
  costoDomicilio: z.number().min(0).max(1000000).default(0),
});

// Validación estricta para estados de pedido
export const orderStatusSchema = z.enum(
  ["Pendiente", "En Preparación", "Enviado", "Entregado", "Cancelado"],
  {
    errorMap: () => ({
      message: "Estado de pedido inválido. Valores permitidos: Pendiente, En Preparación, Enviado, Entregado, Cancelado.",
    }),
  }
);

export type ProductStandardInput = z.infer<typeof productStandardSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
