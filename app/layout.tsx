import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getStoreSettings } from "@/backend/actions/settingsActions";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

// Recuperación dinámica de metadatos y favicon desde Neon DB (Punto 14)
export async function generateMetadata(): Promise<Metadata> {
  const settingsRes = await getStoreSettings();
  const settings = settingsRes.data || {
    brandName: "Dulce Cosmetics",
    faviconUrl: "/favicon.ico",
  };

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://dulcecosmetics.com"),
    title: `${settings.brandName} | Belleza & Maquillaje en Neiva`,
    description:
      "Tienda online de cosméticos en Neiva, Huila. Descubre pestañinas a prueba de agua, labiales de larga duración y polvos traslúcidos con envíos locales y asesoría personalizada.",
    keywords: [
      settings.brandName,
      "Maquillaje Neiva",
      "Cosméticos Neiva",
      "Pestañinas Neiva",
      "Labiales",
      "Las Granjas Neiva",
      "Belleza Huila",
    ],
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/logo.png", sizes: "192x192", type: "image/png" },
        { url: "/favicon.ico" },
      ],
      shortcut: "/logo.png",
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      title: `${settings.brandName} | Belleza & Maquillaje en Neiva`,
      description: "Tienda de cosméticos con envíos a domicilio en Neiva y pagos contraentrega.",
      type: "website",
      images: [
        {
          url: "/logo.png",
          width: 800,
          height: 800,
          alt: `${settings.brandName} - Catálogo Oficial Neiva`,
        },
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settingsRes = await getStoreSettings();
  const settings = settingsRes.data;

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: settings?.brandName || "Dulce Cosmetics",
    image: "https://dulcecosmetics.com/logo.png",
    description:
      "Tienda de cosméticos, maquillaje y cuidado personal en Neiva, Huila. Domicilios en toda la ciudad y envíos nacionales.",
    telephone: "+573177780413",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Carrera 7 #38-16",
      addressLocality: "Neiva",
      addressRegion: "Huila",
      addressCountry: "CO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 2.9468,
      longitude: -75.2929,
    },
    founder: {
      "@type": "Person",
      name: "Natalia Narváez",
    },
    priceRange: "$$",
    currenciesAccepted: "COP",
    paymentAccepted: "Cash, Nequi, Daviplata",
    areaServed: {
      "@type": "City",
      name: "Neiva",
    },
  };

  return (
    <html
      lang="es"
      className={`${playfair.variable} ${dmSans.variable} scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body className="font-sans bg-[#f9f9f9] text-[#1a1c1c] min-h-screen flex flex-col selection:bg-[#f4c2c2] selection:text-[#734e4e]">
        <Providers>
          {/* Navbar Global */}
          <Navbar
            brandName={settings?.brandName || "Dulce Cosmetics"}
            announcementText={settings?.announcementText || undefined}
          />

          {/* Drawer del Carrito */}
          <CartDrawer />

          {/* Contenido Principal */}
          <main className="flex-1">{children}</main>

          {/* Footer Global (se oculta automáticamente en rutas /admin) */}
          <Footer />
        </Providers>

        {/* Vercel Analytics y Speed Insights (Punto 11) */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
