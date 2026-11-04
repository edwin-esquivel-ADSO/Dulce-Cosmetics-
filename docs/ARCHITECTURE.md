<!-- CONFIG FULL_NAME: Edwin Alejandro Esquivel Bahamón -->
# Dulce Cosmetics — Documentación Técnica y Arquitectura de Software

Este documento contiene las especificaciones técnicas, decisiones de diseño de software, patrones de arquitectura limpia y directrices de despliegue para la plataforma **Dulce Cosmetics**.

---

## 🏛️ 1. Arquitectura de Software (Clean Architecture & Modular Monorepo)

La aplicación sigue los principios de Clean Architecture adaptados al ecosistema moderno de **Next.js 15 (App Router)** y **React 19**, desacoplando la capa de presentación, la lógica de negocio y la infraestructura de datos.

```
Dulce Cosmetics/
├── app/                          # CAPA DE PRESENTACIÓN (UI / Controllers)
│   ├── (public)/                 # Vistas públicas para clientes (Catálogo, Producto, Checkout)
│   ├── admin/                    # Panel administrativo con RBAC (Inventario, Pedidos, KPIs)
│   ├── api/auth/[...nextauth]/   # Endpoint de autenticación con JWT 256-bit
│   ├── layout.tsx                # Layout raíz con MetadataBase, Navbar, CartDrawer y Footer
│   └── globals.css               # Tokens de diseño Tailwind, keyframes 60 FPS y estilos globales
│
├── backend/                      # CAPA DE APLICACIÓN Y CASOS DE USO
│   ├── actions/                  # Server Actions seguras contra inyección
│   │   ├── products.ts           # Lectura y mutación de catálogo con ISR
│   │   ├── orderActions.ts       # Transacciones ACID con decremento atómico de stock
│   │   ├── categories.ts         # Agrupaciones y categorías con control de permisos
│   │   └── shipping.ts           # Algoritmo de cálculo de domicilios por barrio en Neiva
│   ├── services/                 # Servicios transversales (NextAuth, Email)
│   ├── validations.ts            # Esquemas de tipado estricto con Zod
│   └── whatsapp.ts               # Integración de enlaces dinámicos a WhatsApp Web API
│
├── database/                     # CAPA DE INFRAESTRUCTURA Y PERSISTENCIA
│   ├── schema.ts                 # Definición de entidades relacionales con Drizzle ORM
│   ├── db.ts                     # Conexión Singleton Pool a Neon PostgreSQL Serverless
│   └── seed.ts                   # Inyector de catálogo oficial (37 productos, zonas, tonos)
│
├── components/                   # COMPONENTES UI REUTILIZABLES
│   ├── Navbar.tsx                # Barra de navegación adaptable (móvil y PC) con Image priority
│   ├── ProductCard.tsx           # Tarjeta de producto con hover interactivo y selector de variantes
│   ├── CartDrawer.tsx            # Carrito lateral responsivo con persistencia y meta de envío
│   └── Footer.tsx                # Pie de página con información comercial y sedes
│
├── hooks/                        # HOOKS DE ESTADO DEL CLIENTE
│   └── useCart.ts                # Store global con Zustand y sincronización con localStorage
│
└── public/                       # ACTIVOS ESTÁTICOS
    ├── logo.png                  # Logotipo oficial de Dulce Cosmetics
    └── images/products/          # 37 imágenes optimizadas extraídas del catálogo
```

---

## 🗄️ 2. Persistencia y Transaccionalidad (ACID)

- **Driver:** `@neondatabase/serverless` mediante conexión `Pool` (WebSockets/TCP pooling).
- **ORM:** `drizzle-orm/neon-serverless`.
- **Integridad Transaccional:**
  Las órdenes de compra se procesan dentro de una transacción atómica `db.transaction()` en [`backend/actions/orderActions.ts`](file:///backend/actions/orderActions.ts):
  ```typescript
  await tx
    .update(products)
    .set({ stock: sql`${products.stock} - ${item.cantidad}` })
    .where(and(eq(products.id, item.productId), gte(products.stock, item.cantidad)));
  ```
  Esto previene condiciones de carrera o sobreventas en compras simultáneas.

---

## 🛡️ 3. Seguridad y Control de Acceso (RBAC)

1. **Tokens JWT Cifrados:** Se emplea una clave secreta de 256 bits (`NEXTAUTH_SECRET`) gestionada por NextAuth.js.
2. **Middleware Fail-Closed:** [`middleware.ts`](file:///middleware.ts) intercepta cualquier acceso a `/admin/*` normalizando las rutas con `.toLowerCase()`, validando la presencia del token y restringiendo roles autorizados (`ADMIN`, `SUB_ADMIN`).
3. **Validación de Entradas:** Todas las mutaciones del cliente pasan obligatoriamente por esquemas de validación Zod antes de alcanzar la base de datos.

---

## ⚡ 4. Rendimiento y Optimización Punto a Punto

- **Core Web Vitals:** Logotipos y elementos LCP (Largest Contentful Paint) cargados con `priority` y atributos responsivos `sizes`.
- **Cumulative Layout Shift (CLS):** Control de proporciones mediante contenedores `aspect-square` con dimensiones fijas.
- **Carga de Paquetes:** First Load JS total de **102 kB**, minimizando el tiempo de bloqueo del hilo principal (TBT).
- **Estrategia de Caché:** `revalidate = 60` (ISR) en la página principal para servir páginas ultra-rápidas desde el Edge Cache de Vercel.

---

## 🚀 5. Parámetros de Despliegue en Vercel

Variables requeridas en el panel de Vercel:

| Variable | Tipo | Descripción |
|---|---|---|
| `DATABASE_URL` | Secreto | Cadena de conexión Neon PostgreSQL con pooler |
| `NEXTAUTH_SECRET` | Secreto | Clave aleatoria de 32+ caracteres para JWT |
| `NEXTAUTH_URL` | URL | Dominio asignado en producción |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | String | Línea comercial WhatsApp (`573177780413`) |

---

## 👨‍💻 Información Académica

- **Desarrollador:** Edwin Alejandro Esquivel Bahamón
- **Programa:** Tecnólogo en Análisis y Desarrollo de Software (ADSO) - SENA Ficha 3413974
- **Instructor Principal:** Jesús Ariel
