# Dulce Cosmetics - Plataforma de Comercio Electrónico (Neiva)

Plataforma de comercio electrónico de alta gama (estética *Luxe Editorial*) diseñada específicamente para el mercado local de **Neiva, Huila (Colombia)**. Construida con arquitectura Monorepo Modular utilizando **Next.js (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **Drizzle ORM**, y **PostgreSQL (Neon Serverless)**.

---

## 1. Estructura del Proyecto

El código está estructurado bajo principios de modularidad y separación de responsabilidades:

```
Dulce Cosmetics/
├── app/                      # Rutas principales de Next.js App Router
│   ├── layout.tsx            # Layout con Navbar, CartDrawer, Google Fonts y Footer
│   ├── page.tsx              # Página de Inicio: Hero, Bento de categorías (Pestañinas), Top Ventas
│   ├── tienda/page.tsx       # Catálogo con filtros por categoría, búsqueda y ordenamiento
│   ├── producto/[slug]/      # Detalle de producto, selector de variantes y botón de asesoría
│   ├── checkout/page.tsx     # Checkout con cálculo dinámico de envío en Neiva y WhatsApp
│   ├── admin/                # Panel de Control Administrativo
│   │   ├── page.tsx          # Dashboard general con KPIs de ventas y pedidos
│   │   ├── productos/        # Formulario de inserción a Neon y control de inventario
│   │   └── pedidos/          # Tabla interactiva para cambio de estados (Pendiente, Enviado, etc.)
│   └── web/                  # Componentes UI reutilizables y hooks
│       ├── components/       # Navbar, Footer, CartDrawer, ProductCard, etc.
│       └── hooks/            # useCart (Zustand con persistencia en localStorage)
├── backend/                  # Lógica de servidor y Server Actions seguras
│   ├── actions/
│   │   ├── products.ts       # Consultas protegidas contra SQLi y mutaciones
│   │   ├── orders.ts         # Creación de pedidos, cálculo de KPIs y estados
│   │   ├── categories.ts     # Listado y gestión de categorías
│   │   └── shipping.ts       # Algoritmo de cálculo de domicilios según barrio en Neiva
│   ├── validations.ts        # Esquemas de validación Zod
│   └── whatsapp.ts           # Integración para formateo de pedidos vía WhatsApp Web API
├── database/                 # Capa de Base de Datos con Drizzle ORM
│   ├── schema.ts             # Esquema relacional completo (users, products, orders, shipping_zones, etc.)
│   ├── db.ts                 # Conexión optimizada para Neon Serverless HTTP
│   └── seed.ts               # Script de inyección inicial de zonas de Neiva y productos
├── docs/                     # Documentación y configuración de despliegue
│   ├── vercel.json           # Configuración de build y headers de seguridad
│   └── README.md             # Este archivo
├── public/                   # Activos estáticos
├── package.json              # Dependencias y scripts
├── tailwind.config.ts        # Tokens Luxe Editorial (Colores pasteles, Playfair Display, DM Sans)
└── vercel.json               # Configuración de despliegue en la raíz
```

---

## 2. Variables de Entorno (`.env.local`)

Crea o verifica el archivo `.env.local` en la raíz del proyecto con los siguientes valores:

```env
# Conexión a Base de Datos Neon PostgreSQL
DATABASE_URL="postgresql://neondb_owner:npg_2oaFHVzGQ4MO@ep-twilight-lake-ayw72r54-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Cloudinary (Listo para integración de subida de archivos)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="TU_CLOUD_NAME"
CLOUDINARY_API_KEY="TU_API_KEY"
CLOUDINARY_API_SECRET="TU_API_SECRET"

# Configuración de Negocio Local (Neiva, Huila)
NEXT_PUBLIC_WHATSAPP_NUMBER="573177780413"
```

---

## 3. Instalación y Ejecución Local

### Paso 1: Instalar dependencias
```bash
pnpm install
```

### Paso 2: Generar y migrar tablas a Neon PostgreSQL
```bash
pnpm run db:push
```

### Paso 3: Ejecutar el Seed inicial
Inyecta las zonas de Neiva (Las Granjas, Cándido, Centro, etc.), categorías y productos iniciales con sus tonalidades:
```bash
pnpm run db:seed
```

### Paso 4: Iniciar el servidor de desarrollo
```bash
pnpm dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 4. Características Principales

1. **Cálculo Dinámico de Domicilios en Neiva**:
   - Domicilio **GRATIS** en el barrio **Las Granjas** para compras superiores a **$15.000 COP**.
   - Domicilio a otros barrios de Neiva (Centro, Cándido, Santa Inés, Ipanema, etc.) calculado en tiempo real.
2. **Checkout con Redirección a WhatsApp**:
   - Guarda el pedido e ítems en las tablas `orders` y `order_items` de Neon DB.
   - Genera automáticamente un mensaje codificado para WhatsApp con el desglose exacto, permitiendo a la clienta enviar su pedido con un solo toque.
3. **Selector de Tonalidades**:
   - Crucial para labiales y polvos traslúcidos con indicador de stock.
4. **Botón "Necesito Asesoría"**:
   - Permite a las clientas resolver dudas sobre tonos directamente con las asesoras en Neiva antes del despacho.
5. **Panel de Administración**:
   - Dashboard en `/admin` con KPIs de ventas del día y pedidos pendientes.
   - Gestión de productos en `/admin/productos` para agregar nuevos cosméticos y variantes directamente a Neon.
   - Gestión de pedidos en `/admin/pedidos` con selector de estado interactivo (Pendiente, Confirmado, Enviado, Entregado).

---

## 5. Despliegue en Vercel

El proyecto incluye el archivo `vercel.json` configurado para Next.js con headers de seguridad:

1. Conecta el repositorio de GitHub a tu cuenta de Vercel.
2. Configura las variables de entorno en el panel de Vercel (`DATABASE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`).
3. El comando de build configurado es:
   ```bash
   pnpm run build
   ```
4. ¡El despliegue se completará automáticamente en la red Edge global de Vercel!
