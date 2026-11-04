<!-- CONFIG FULL_NAME: Edwin Alejandro Esquivel Bahamón -->
# Dulce Cosmetics — Plataforma de Comercio Electrónico & Belleza

[![Next.js](https://img.shields.io/badge/Next.js-15.5.25-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-c5f74f?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team/)
[![Neon Database](https://img.shields.io/badge/Neon-Serverless_PostgreSQL-00e599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

Plataforma de comercio electrónico de alta fidelidad estética (*Luxe Editorial*) desarrollada a la medida para **Dulce Cosmetics**, emprendimiento comercial independiente y unipersonal enfocado en el sector de la belleza, cosméticos y cuidado personal en **Neiva, Huila (Colombia)**.

---

## 👩‍💼 Contexto Institucional & Académico

- **Desarrollador Principal:** Edwin Alejandro Esquivel Bahamón
- **GitHub:** [@edwin-esquivel-ADSO](https://github.com/edwin-esquivel-ADSO)
- **Programa de Formación:** Tecnólogo en Análisis y Desarrollo de Software (ADSO)
- **Ficha SENA:** 3413974
- **Instructor Principal:** Jesús Ariel
- **Ubicación del Negocio:** Neiva, Huila — Sede Física: Carrera 7 #38-16 B/ Las Granjas
- **Líneas de Atención / Domicilios:** +57 317 778 0413 | +57 320 436 0859

---

## ⚠️ AVISO LEGAL ESTRICTO: PROPIEDAD INTELECTUAL Y PROTECCIÓN DE DATOS

> [!CAUTION]
> **NEGOCIO UNIPERSONAL E INFORMACIÓN CONFIDENCIAL PROTEGIDA**
>
> 1. **Emprendimiento Unipersonal:** Este software, su catálogo comercial, nombres de producto, esquemas de precios, activos fotográficos y registros de clientela pertenecen en su totalidad y de forma exclusiva al emprendimiento unipersonal **Dulce Cosmetics** y a su titular.
> 2. **Prohibición Expresa de Extracción (Scraping) y Copia:** Queda terminantemente prohibida la copia parcial o total, extracción automatizada, clonación de diseño, ingeniería inversa, sublicencia, comercialización o distribución de la información contenida en esta plataforma sin consentimiento previo y por escrito de su propietaria.
> 3. **Protección de Datos Personales (Ley 1581 de 2012 - Habeas Data):** Todos los datos de compradores recopilados en los módulos de checkout, WhatsApp y panel administrativo son estrictamente confidenciales. Ninguna persona ajena al negocio tiene autorización legal para extraer, sustraer o procesar información de clientes o pedidos con fines externos.
> 4. **Reserva de Derechos de Marca:** La identidad visual, el logotipo oficial y la selección editorial de catálogo se encuentran amparados bajo el marco normativo de derechos de autor y propiedad industrial de la República de Colombia.

---

## ✨ Características Principales y Experiencia de Usuario

- **Diseño Luxe Editorial & Micro-Animaciones Ultrarrápidas:**
  - Paleta curada: Rosewood (`#7b5455`), Blush Rose (`#f4c2c2`), Gold Warm (`#735c00`) y Soft Almond (`#F5F5DC`).
  - Animaciones micro-fluidas CSS (`fadeIn`, `slideUp`, `shimmer-badge`) a 60 FPS sin sobrecargar la CPU.
  - Logotipo oficial optimizado con `next/image` (`priority`), eliminando saltos de diseño (CLS = 0).
- **Catálogo Oficial Extraído e Indexado (37 Productos Reales):**
  - Fotografías reales procesadas y optimizadas en WebP/JPEG de alta definición.
  - Variantes por tonalidad, fórmulas resistentes al calor y humedad de Neiva.
  - Filtros dinámicos por categorías (Pestañinas, Labiales, Polvos & Bases, Skincare, Fijadores, Sombras).
- **Checkout Inteligente con Cálculo de Domicilio Local:**
  - Algoritmo de zonas barriales de Neiva (Las Granjas, Cándido, Centro, Ipanema, Oriente, Sur).
  - Promoción local activa: *Domicilio GRATIS en Barrio Las Granjas por compras superiores a $15.000 COP*.
  - Generación instantánea de pedido estructurado para WhatsApp API con desglose de items y dirección.
- **Rendimiento Punto a Punto (LCP & Core Web Vitals):**
  - Incremental Static Regeneration (ISR `revalidate = 60`) en el catálogo.
  - Zero-blocking rendering con carga diferida de imágenes y font display swap.
- **Seguridad y Control de Acceso Administrativo (RBAC):**
  - NextAuth.js v4 con tokens JWT cifrados en 256 bits.
  - Protección de rutas `/admin/*` con middleware blindado (fail-closed) y sanitización estricta.
  - Transacciones ACID nativas (`db.transaction`) con decremento atómico de inventario en Neon PostgreSQL.

---

## 🏛️ Arquitectura Limpia (Clean Architecture)

El proyecto implementa una arquitectura desacoplada por capas:

```
Dulce Cosmetics/
├── app/                      # Capa de Presentación (Next.js 15 App Router & React 19)
│   ├── (public)/             # Rutas públicas (Inicio, Tienda, Detalle, Checkout)
│   ├── admin/                # Panel de Control Administrativo (Gestión de Stock, Pedidos, KPIs)
│   ├── api/                  # Endpoints REST & NextAuth Handler
│   ├── layout.tsx            # Layout con MetadataBase, Navbar, CartDrawer y Footer
│   └── globals.css           # Tokens CSS, keyframes de animación y scrollbars estéticos
├── backend/                  # Capa de Aplicación y Casos de Uso
│   ├── actions/              # Server Actions (products, orders, categories, shipping)
│   ├── services/             # Servicios de dominio y autenticación (auth.ts)
│   ├── validations.ts        # Esquemas de validación Zod
│   └── whatsapp.ts           # Formateador de pedidos para mensajería directa
├── database/                 # Capa de Infraestructura y Persistencia
│   ├── schema.ts             # Modelos relacionales con Drizzle ORM
│   ├── db.ts                 # Conexión Singleton Pool a Neon PostgreSQL Serverless
│   └── seed.ts               # Inyector de catálogo oficial (37 productos, zonas y variantes)
├── components/               # Componentes UI reutilizables (Navbar, ProductCard, CartDrawer)
├── hooks/                    # Hooks de estado global (useCart con persistencia Zustand)
├── public/                   # Activos estáticos (Logo oficial, imágenes del catálogo)
└── vercel.json               # Configuración de despliegue optimizada para Vercel
```

---

## ⚙️ Variables de Entorno

Para ejecutar el proyecto de forma local o desplegarlo en Vercel, configura las siguientes variables en `.env.local` (local) o en el panel de Vercel (Producción):

```env
# 1. Base de Datos Neon (PostgreSQL Serverless)
DATABASE_URL="postgresql://neondb_owner:<TU_PASSWORD>@<TU_ENDPOINT>-pooler.<REGION>.aws.neon.tech/neondb?sslmode=require"

# 2. NextAuth.js (Autenticación Administrativa)
NEXTAUTH_SECRET="<CLAVE_SECRETA_ALEATORIA_MINIMO_32_CARACTERES>"
NEXTAUTH_URL="http://localhost:3000" # En producción: https://tu-dominio.vercel.app

# 3. Configuración Comercial Neiva
NEXT_PUBLIC_WHATSAPP_NUMBER="573177780413"
NEXT_PUBLIC_STORE_NAME="Dulce Cosmetics"
NEXT_PUBLIC_STORE_LOCATION="Neiva, Huila, Colombia"
```

> [!NOTE]
> Las credenciales reales nunca deben incluirse en commits públicos. Utiliza el archivo [.env.example](file:///.env.example) como referencia para el equipo de desarrollo.

---

## 🚀 Instalación y Despliegue

### 1. Clonar el repositorio
```bash
git clone https://github.com/edwin-esquivel-ADSO/Dulce-Cosmetics-.git
cd Dulce-Cosmetics-
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Migrar e inyectar el catálogo a Neon DB
```bash
# Empujar esquemas de Drizzle a PostgreSQL
pnpm run db:push

# Inyectar las categorías, 37 productos y zonas de domicilio de Neiva
pnpm run db:seed
```

### 4. Ejecutar en desarrollo
```bash
pnpm run dev
```
La tienda estará accesible en [http://localhost:3000](http://localhost:3000).

### 5. Compilación de Producción & Verificación
```bash
pnpm run build
```

### 6. Despliegue en Vercel
1. Conecta el repositorio de GitHub en [Vercel](https://vercel.com/new).
2. Configura las variables de entorno (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`).
3. El despliegue se ejecutará automáticamente bajo la configuración establecida en `vercel.json`.

---

## 📄 Licencia y Derechos de Autor

© 2026 **Dulce Cosmetics** — Todos los derechos reservados.  
Desarrollado por **Edwin Alejandro Esquivel Bahamón** como parte del programa formativo ADSO SENA (Ficha 3413974). Prohibida su reproducción comercial no autorizada.
