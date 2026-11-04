"use server";

import { db, orders, orderItems, products, productVariants } from "@/database/db";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { createOrderSchema, CreateOrderInput, orderStatusSchema } from "@/backend/validations";
import { generateWhatsAppOrderUrl } from "@/backend/whatsapp";
import { calculateShippingCost } from "@/backend/actions/shipping";
import { requireAdminSession } from "@/backend/services/auth";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
import { ActionResponse } from "@/backend/types";

// Rate limiting para mitigar ataques de denegación de inventario y pedidos falsos
const orderRateLimitMap = new Map<string, { count: number; firstAttempt: number }>();
const MAX_ORDERS_PER_WINDOW = 5;
const ORDER_WINDOW_MS = 10 * 60 * 1000; // Ventana de 10 minutos

function checkOrderRateLimit(identifier: string): boolean {
  const now = Date.now();
  const cleanId = identifier.trim().toLowerCase();
  const record = orderRateLimitMap.get(cleanId);

  if (!record || now - record.firstAttempt > ORDER_WINDOW_MS) {
    orderRateLimitMap.set(cleanId, { count: 1, firstAttempt: now });
    return true;
  }

  if (record.count >= MAX_ORDERS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  orderRateLimitMap.set(cleanId, record);
  return true;
}

// Función de sanitización contra Inyección HTML y XSS en correos salientes
function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Configuración de transporte de correo (Puntos 8, 18)
async function sendAdminOrderEmail(orderData: {
  orderId: number;
  nombreCliente: string;
  telefono: string;
  direccion: string;
  barrio: string;
  metodoPago: string;
  total: number;
  costoDomicilio: number;
  requiereAsesoria: boolean;
  items: Array<{
    productName: string;
    variantName?: string | null;
    cantidad: number;
    precioUnitario: number;
  }>;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@dulcecosmetics.com";
  const emailFrom = process.env.EMAIL_FROM || "Dulce Cosmetics <pedidos@dulcecosmetics.com>";
  const emailServer = process.env.EMAIL_SERVER;

  // Si no está configurado el servidor de correo, registramos en log y continuamos de forma segura
  if (!emailServer) {
    console.warn("[Email Notification] EMAIL_SERVER no configurado. Notificación omitida.");
    return;
  }

  try {
    const transporter = nodemailer.createTransport(emailServer);

    const safeNombreCliente = escapeHtml(orderData.nombreCliente);
    const safeTelefono = escapeHtml(orderData.telefono);
    const safeDireccion = escapeHtml(orderData.direccion);
    const safeBarrio = escapeHtml(orderData.barrio);
    const safeMetodoPago = escapeHtml(orderData.metodoPago.toUpperCase());

    const itemsHtml = orderData.items
      .map(
        (i) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(i.productName)} ${
            i.variantName ? `(${escapeHtml(i.variantName)})` : ""
          }</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${
              Number(i.cantidad)
            }</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(
              Number(i.precioUnitario) * Number(i.cantidad)
            ).toLocaleString("es-CO")} COP</td>
          </tr>`
      )
      .join("");

    const mailOptions = {
      from: emailFrom,
      to: adminEmail,
      subject: `🛍️ Nuevo Pedido #${orderData.orderId} - Dulce Cosmetics Neiva`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #7b5455; border-bottom: 2px solid #7b5455; padding-bottom: 8px;">
            ¡Nuevo Pedido Registrado en Neiva!
          </h2>
          <p><strong>Pedido ID:</strong> #${orderData.orderId}</p>
          <p><strong>Cliente:</strong> ${safeNombreCliente}</p>
          <p><strong>Teléfono:</strong> ${safeTelefono}</p>
          <p><strong>Dirección:</strong> ${safeDireccion} (Barrio: <strong>${safeBarrio}</strong>)</p>
          <p><strong>Método de Pago:</strong> ${safeMetodoPago}</p>
          <p><strong>Asesoría Solicitada:</strong> ${orderData.requiereAsesoria ? "SÍ (Contactar antes)" : "No"}</p>
          
          <h3 style="color: #7b5455; margin-top: 20px;">Detalle de Productos</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background-color: #f8f4f4; color: #7b5455;">
                <th style="padding: 8px; text-align: left;">Producto</th>
                <th style="padding: 8px; text-align: center;">Cantidad</th>
                <th style="padding: 8px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Domicilio:</td>
                <td style="padding: 8px; text-align: right;">$${orderData.costoDomicilio.toLocaleString("es-CO")} COP</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold; font-size: 16px; color: #7b5455;">Total a Cobrar:</td>
                <td style="padding: 8px; text-align: right; font-weight: bold; font-size: 16px; color: #7b5455;">$${orderData.total.toLocaleString("es-CO")} COP</td>
              </tr>
            </tfoot>
          </table>
          <p style="margin-top: 24px; font-size: 12px; color: #888;">
            Dulce Cosmetics Neiva • Notificación generada automáticamente de forma segura.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.info(`[Email Notification] Correo de pedido #${orderData.orderId} enviado a ${adminEmail}`);
  } catch (emailError: any) {
    console.error("[Email Notification] Error enviando correo al admin:", emailError.message);
  }
}

/**
 * Server Action para finalizar y registrar pedidos con validación estricta de inventario y precios reales en Neon PostgreSQL
 */
export async function createOrderAction(
  formData: CreateOrderInput
): Promise<ActionResponse<{ orderId: number; whatsappUrl: string; total: number; subtotal: number; costoDomicilio: number }>> {
  try {
    const validated = createOrderSchema.parse(formData);

    // Protección anti-abuso / rate limiting por cliente y teléfono
    const clientKey = `${validated.telefono.replace(/\D/g, "")}_${validated.nombreCliente.toLowerCase().slice(0, 15)}`;
    if (!checkOrderRateLimit(clientKey)) {
      return {
        success: false,
        message: "Has alcanzado el límite de pedidos permitidos por seguridad. Por favor comunícate directamente por WhatsApp para asistencia.",
      };
    }

    // 1. Verificación e inspección estricta de cada producto contra la Base de Datos
    // Evita Price Tampering (DEF-02) y asegura inventario disponible (DEF-04)
    const verifiedItems: Array<{
      productId: number;
      productName: string;
      variantId: number | null;
      variantName: string | null;
      cantidad: number;
      precioUnitario: number;
      currentStock: number;
    }> = [];

    let verifiedSubtotal = 0;

    for (const item of validated.items) {
      const [productRecord] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (!productRecord) {
        return {
          success: false,
          message: `El producto ID #${item.productId} no existe en nuestro catálogo.`,
        };
      }

      if (!productRecord.estado) {
        return {
          success: false,
          message: `El producto "${productRecord.nombre}" no se encuentra disponible actualmente.`,
        };
      }

      // Validar stock disponible
      if (productRecord.stock < item.cantidad) {
        return {
          success: false,
          message: `Stock insuficiente para "${productRecord.nombre}". Solo quedan ${productRecord.stock} unidades disponibles.`,
        };
      }

      let variantName: string | null = null;
      if (item.variantId) {
        const [variantRecord] = await db
          .select()
          .from(productVariants)
          .where(eq(productVariants.id, item.variantId))
          .limit(1);

        if (variantRecord && variantRecord.productId === productRecord.id) {
          variantName = variantRecord.nombre;
        }
      }

      // El precio SIEMPRE se toma de la base de datos (inmune a manipulación del cliente)
      const realUnitPrice = productRecord.precio;
      verifiedSubtotal += realUnitPrice * item.cantidad;

      verifiedItems.push({
        productId: productRecord.id,
        productName: productRecord.nombre,
        variantId: item.variantId || null,
        variantName: variantName || item.variantName || null,
        cantidad: item.cantidad,
        precioUnitario: realUnitPrice,
        currentStock: productRecord.stock,
      });
    }

    // 2. Cálculo autoritativo de domicilio según zona de Neiva desde la BD (DEF-05)
    const shippingCalc = await calculateShippingCost(validated.barrio, verifiedSubtotal);
    const verifiedShippingCost = shippingCalc.costo;
    const verifiedTotal = verifiedSubtotal + verifiedShippingCost;

    // 3. Transacción atómica integral en PostgreSQL Neon:
    // Garantiza que la orden, ítems y reducción estricta de inventario ocurran como una única unidad atómica.
    // Si falla cualquier producto o no hay suficiente stock en tiempo real, se revierte todo (Rollback).
    const newOrder = await db.transaction(async (tx) => {
      const [orderRecord] = await tx
        .insert(orders)
        .values({
          nombreCliente: validated.nombreCliente.trim(),
          telefono: validated.telefono.trim(),
          direccion: validated.direccion.trim(),
          barrio: validated.barrio.trim(),
          ciudad: "Neiva",
          metodoPago: validated.metodoPago,
          total: verifiedTotal,
          costoDomicilio: verifiedShippingCost,
          estado: "Pendiente",
          notas: validated.notas ? validated.notas.trim() : "",
          requiereAsesoria: validated.requiereAsesoria,
        })
        .returning();

      if (!orderRecord || !orderRecord.id) {
        throw new Error("No se pudo generar el número de orden en la base de datos.");
      }

      for (const item of verifiedItems) {
        await tx.insert(orderItems).values({
          orderId: orderRecord.id,
          productId: item.productId,
          variantId: item.variantId,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
        });

        // Decremento atómico y condicional de inventario en la base de datos (DEF-04)
        // Evita condiciones de carrera y sobreventa (TOCTOU): solo actualiza si stock >= cantidad
        const [updatedProduct] = await tx
          .update(products)
          .set({
            stock: sql`${products.stock} - ${item.cantidad}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(products.id, item.productId),
              gte(products.stock, item.cantidad)
            )
          )
          .returning({ id: products.id, stock: products.stock });

        if (!updatedProduct) {
          throw new Error(
            `Stock insuficiente para "${item.productName}". El inventario cambió mientras completabas tu compra.`
          );
        }

        // Si tiene variante, decrementar stock estimado de forma segura
        if (item.variantId) {
          await tx
            .update(productVariants)
            .set({
              stockEstimado: sql`GREATEST(0, ${productVariants.stockEstimado} - ${item.cantidad})`,
            })
            .where(eq(productVariants.id, item.variantId));
        }
      }

      return orderRecord;
    });

    // 5. Generación de enlace de WhatsApp con montos verificados
    const whatsappUrl = generateWhatsAppOrderUrl({
      orderId: newOrder.id,
      nombreCliente: validated.nombreCliente.trim(),
      telefono: validated.telefono.trim(),
      direccion: validated.direccion.trim(),
      barrio: validated.barrio.trim(),
      metodoPago: validated.metodoPago,
      costoDomicilio: verifiedShippingCost,
      total: verifiedTotal,
      requiereAsesoria: validated.requiereAsesoria,
      notas: validated.notas,
      items: verifiedItems.map((i) => ({
        productName: i.productName,
        variantName: i.variantName,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
      })),
    });

    // 6. Envío de notificación por correo en segundo plano (sanitizada)
    sendAdminOrderEmail({
      orderId: newOrder.id,
      nombreCliente: validated.nombreCliente,
      telefono: validated.telefono,
      direccion: validated.direccion,
      barrio: validated.barrio,
      metodoPago: validated.metodoPago,
      total: verifiedTotal,
      costoDomicilio: verifiedShippingCost,
      requiereAsesoria: validated.requiereAsesoria,
      items: verifiedItems,
    }).catch((err) => console.error("[Background Email Error]", err));

    // 7. Revalidación de rutas
    revalidatePath("/admin");
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/productos");
    revalidatePath("/tienda");
    revalidatePath("/");

    return {
      success: true,
      message: "Pedido registrado exitosamente.",
      data: {
        orderId: newOrder.id,
        whatsappUrl,
        total: verifiedTotal,
        subtotal: verifiedSubtotal,
        costoDomicilio: verifiedShippingCost,
      },
    };
  } catch (error: any) {
    console.error("[createOrderAction] Error capturado:", error);
    return {
      success: false,
      message: error?.message || "Ocurrió un error inesperado al procesar el pedido.",
      data: undefined,
    };
  }
}

/**
 * Server Action para actualizar el estado del pedido (ADMIN / SUB_ADMIN)
 */
export async function updateOrderStatusAction(
  orderId: number,
  status: string
): Promise<ActionResponse<{ orderId: number; estado: string }>> {
  try {
    await requireAdminSession("update_order_status");

    if (!orderId || !status) {
      return {
        success: false,
        message: "ID de pedido y estado son obligatorios.",
      };
    }

    // Validación estricta del estado con esquema Zod (prevención de estados corruptos o stored XSS)
    const validatedStatus = orderStatusSchema.parse(status.trim());

    const [updated] = await db
      .update(orders)
      .set({
        estado: validatedStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updated) {
      return {
        success: false,
        message: `El pedido #${orderId} no fue encontrado.`,
      };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/pedidos");

    return {
      success: true,
      message: `Pedido #${orderId} actualizado a ${status}.`,
      data: { orderId: updated.id, estado: updated.estado },
    };
  } catch (error: any) {
    console.error("[updateOrderStatusAction] Error:", error);
    return {
      success: false,
      message: error?.message || "Error al actualizar estado del pedido.",
    };
  }
}

/**
 * Server Action para consultar pedidos con sus ítems (Panel Admin)
 */
export async function getOrdersAction(): Promise<ActionResponse<any[]>> {
  try {
    await requireAdminSession("view_orders");

    const [allOrders, allItems] = await Promise.all([
      db.select().from(orders).orderBy(desc(orders.createdAt)),
      db
        .select({
          orderId: orderItems.orderId,
          id: orderItems.id,
          cantidad: orderItems.cantidad,
          precioUnitario: orderItems.precioUnitario,
          productName: products.nombre,
          variantName: productVariants.nombre,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .leftJoin(productVariants, eq(orderItems.variantId, productVariants.id)),
    ]);

    const itemsByOrder = new Map<number, any[]>();
    for (const item of allItems) {
      const list = itemsByOrder.get(item.orderId) || [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    const ordersWithItems = allOrders.map((o) => ({
      ...o,
      items: itemsByOrder.get(o.id) || [],
    }));

    return {
      success: true,
      message: "Pedidos recuperados correctamente.",
      data: ordersWithItems,
    };
  } catch (error: any) {
    console.error("[getOrdersAction] Error:", error);
    return {
      success: false,
      message: error?.message || "Error al consultar pedidos.",
      data: [],
    };
  }
}

/**
 * Función helper directa para obtener pedidos de administración
 */
export async function getOrdersAdmin() {
  const res = await getOrdersAction();
  return res.data || [];
}

/**
 * Función para calcular KPIs del Dashboard administrativo en Neiva
 */
export async function getAdminKPIs() {
  try {
    await requireAdminSession("view_dashboard");

    const allOrders = await db.select().from(orders);

    const totalVentas = allOrders
      .filter((o) => o.estado !== "Cancelado")
      .reduce((acc, o) => acc + o.total, 0);

    const pedidosPendientes = allOrders.filter(
      (o) => o.estado === "Pendiente"
    ).length;

    const pedidosCompletados = allOrders.filter(
      (o) => o.estado === "Entregado"
    ).length;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const ventasHoy = allOrders
      .filter(
        (o) =>
          new Date(o.createdAt) >= startOfToday && o.estado !== "Cancelado"
      )
      .reduce((acc, o) => acc + o.total, 0);

    const allProducts = await db.select().from(products);

    return {
      totalVentas,
      ventasHoy,
      pedidosPendientes,
      pedidosCompletados,
      totalPedidos: allOrders.length,
      totalProductos: allProducts.length,
    };
  } catch (error) {
    console.error("Error al calcular KPIs:", error);
    return {
      totalVentas: 0,
      ventasHoy: 0,
      pedidosPendientes: 0,
      pedidosCompletados: 0,
      totalPedidos: 0,
      totalProductos: 0,
    };
  }
}


