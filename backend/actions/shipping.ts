"use server";

import { db, shippingZones } from "@/database/db";
import { eq, ilike } from "drizzle-orm";

export async function getShippingZones() {
  try {
    const zones = await db
      .select()
      .from(shippingZones)
      .where(eq(shippingZones.activo, true));
    return zones;
  } catch (error) {
    console.error("Error al obtener zonas de envío:", error);
    return [];
  }
}

export async function calculateShippingCost(barrioName: string, subtotal: number): Promise<{
  costo: number;
  esGratis: boolean;
  compraMinima: number;
  nombreZona: string;
}> {
  try {
    if (!barrioName || barrioName.trim() === "") {
      return { costo: 6000, esGratis: false, compraMinima: 25000, nombreZona: "Resto de Neiva" };
    }

    const cleanBarrio = barrioName.trim().toLowerCase();

    // Consultar zonas en base de datos
    const allZones = await db
      .select()
      .from(shippingZones)
      .where(eq(shippingZones.activo, true));

    // Buscar coincidencia exacta o parcial
    const match = allZones.find((z) =>
      cleanBarrio.includes(z.nombreBarrio.toLowerCase()) ||
      z.nombreBarrio.toLowerCase().includes(cleanBarrio)
    );

    if (match) {
      if (subtotal >= match.compraMinima && match.costo === 0) {
        return {
          costo: 0,
          esGratis: true,
          compraMinima: match.compraMinima,
          nombreZona: match.nombreBarrio,
        };
      }
      return {
        costo: match.costo,
        esGratis: match.costo === 0 && subtotal >= match.compraMinima,
        compraMinima: match.compraMinima,
        nombreZona: match.nombreBarrio,
      };
    }

    // Si es "Las Granjas"
    if (cleanBarrio.includes("granjas")) {
      const gratis = subtotal >= 15000;
      return {
        costo: gratis ? 0 : 3000,
        esGratis: gratis,
        compraMinima: 15000,
        nombreZona: "Las Granjas",
      };
    }

    // Tarifa general para otros sectores de Neiva
    return {
      costo: 6000,
      esGratis: false,
      compraMinima: 25000,
      nombreZona: "Resto de Neiva",
    };
  } catch (error) {
    console.error("Error al calcular costo de envío:", error);
    return { costo: 6000, esGratis: false, compraMinima: 25000, nombreZona: "Resto de Neiva" };
  }
}
