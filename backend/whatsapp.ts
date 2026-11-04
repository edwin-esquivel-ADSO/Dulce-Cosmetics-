export interface WhatsAppOrderItem {
  productName: string;
  variantName?: string | null;
  cantidad: number;
  precioUnitario: number;
}

export interface WhatsAppOrderData {
  orderId?: number | string;
  nombreCliente: string;
  telefono: string;
  ciudad?: string;
  direccion: string;
  barrio: string;
  metodoPago: string;
  costoDomicilio: number;
  total: number;
  requiereAsesoria?: boolean;
  notas?: string | null;
  items: WhatsAppOrderItem[];
}

/**
 * Formatea un pedido completo para la API de WhatsApp de Dulce Cosmetics en Neiva.
 * Genera el enlace https://wa.me/<numero>?text=<mensaje_codificado>
 */
export function generateWhatsAppOrderUrl(order: WhatsAppOrderData): string {
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573177780413";
  const whatsappNumber = rawNumber.replace(/\D/g, "") || "573177780413";

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  const subtotal = order.items.reduce((acc, item) => acc + item.precioUnitario * item.cantidad, 0);

  const isNeiva = !order.ciudad || order.ciudad.trim().toLowerCase() === "neiva";

  const paymentMethodLabels: Record<string, string> = {
    efectivo: isNeiva ? "Efectivo contraentrega en Neiva" : "Efectivo",
    nequi: "Transferencia Nequi",
    daviplata: "Transferencia Daviplata",
  };

  const paymentLabel = paymentMethodLabels[order.metodoPago.toLowerCase()] || order.metodoPago;

  const domicilioText =
    order.costoDomicilio === 0
      ? isNeiva
        ? "GRATIS (Zona especial / Las Granjas)"
        : "Flete a convenir / Contraentrega transportadora"
      : formatCurrency(order.costoDomicilio);

  let message = `*🌸 ¡NUEVO PEDIDO - DULCE COSMETICS! 🌸*\n`;
  if (order.orderId) {
    message += `*Pedido #:* ${order.orderId}\n`;
  }
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `*👤 DATOS DE ENTREGA:*\n`;
  message += `• *Cliente:* ${order.nombreCliente}\n`;
  message += `• *Teléfono:* ${order.telefono}\n`;
  if (order.ciudad) {
    message += `• *Ciudad:* ${order.ciudad} ${isNeiva ? "(Entrega Local)" : "(Envío Nacional)"}\n`;
  }
  message += `• *Dirección:* ${order.direccion}\n`;
  message += `• *Barrio/Sector:* ${order.barrio}\n\n`;

  message += `*💄 PRODUCTOS SOLICITADOS:*\n`;
  order.items.forEach((item, index) => {
    const itemSubtotal = item.precioUnitario * item.cantidad;
    const toneText = item.variantName ? ` (Tono: ${item.variantName})` : "";
    message += `${index + 1}. *${item.productName}*${toneText}\n`;
    message += `   Cantidad: ${item.cantidad}  |  Subtotal: ${formatCurrency(itemSubtotal)}\n`;
  });

  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*Subtotal:* ${formatCurrency(subtotal)}\n`;
  message += `*Domicilio/Envío:* ${domicilioText}\n`;
  message += `*TOTAL PRODUCTOS:* *${formatCurrency(order.total)}*\n`;
  message += `*Método de Pago:* ${paymentLabel}\n`;

  if (!isNeiva) {
    message += `\n*📌 CONDICIÓN DE DESPACHO NACIONAL:* Al ser un envío fuera de Neiva, se requiere *PAGO COMPLETO ANTICIPADO (100%)* de los productos antes de ser enviados. El flete se paga a la transportadora.\n`;
  } else {
    message += `\n*🛵 CONDICIÓN DE ENTREGA LOCAL:* Despacho directo en Neiva (Pago contraentrega o transferencia al recibir).\n`;
  }

  if (order.requiereAsesoria) {
    message += `\n*✨ ATENCIÓN:* La cliente seleccionó que *REQUIERE ASESORÍA PERSONALIZADA* sobre tonos/aplicación antes del despacho.\n`;
  }

  if (order.notas && order.notas.trim().length > 0) {
    message += `\n*📝 Notas del cliente:* ${order.notas.trim()}\n`;
  }

  message += `\nMuchas gracias por elegir la belleza de Dulce Cosmetics. ¡Quedo atento a la confirmación de despacho! ✨`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}

/**
 * Enlace directo para consulta o asesoría rápida de un producto específico
 */
export function generateProductInquiryUrl(productName: string, selectedVariant?: string | null): string {
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573177780413";
  const whatsappNumber = rawNumber.replace(/\D/g, "") || "573177780413";
  let text = `¡Hola Dulce Cosmetics! 🌸 Estoy viendo el producto *"${productName}"* en su tienda web`;
  if (selectedVariant) {
    text += ` en el tono *"${selectedVariant}"*`;
  }
  text += ` y me gustaría recibir asesoría personalizada para saber si es el ideal para mi tipo de piel. ¿Me podrían brindar más información?`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}
