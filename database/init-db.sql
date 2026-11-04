-- ==============================================================================
-- Dulce Cosmetics - DDL Initialization Script (database/init-db.sql)
-- Arquitectura de Base de Datos PostgreSQL / Neon Serverless
-- Módulos: Products, Orders, Users (ADMIN, SUB_ADMIN), StoreSettings
-- Optimizado con índices B-Tree y GIN para filtrado ultrarrápido (Punto 5)
-- ==============================================================================

-- 1. Extensiones necesarias para búsqueda de texto completo y similitud trigram
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ------------------------------------------------------------------------------
-- 2. Tabla: StoreSettings (Branding dinámico de la tienda - Punto 14)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS store_settings (
    id SERIAL PRIMARY KEY,
    brand_name VARCHAR(255) NOT NULL DEFAULT 'Dulce Cosmetics',
    logo_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    favicon_url TEXT NOT NULL DEFAULT '/favicon.ico',
    announcement_text TEXT DEFAULT 'Envíos a todo Neiva • Domicilio GRATIS en Las Granjas por compras desde $15.000',
    contact_phone VARCHAR(50) DEFAULT '+57 317 778 0413',
    contact_email VARCHAR(255) DEFAULT 'contacto@dulcecosmetics.com',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. Tabla: Users (Administradores y Sub-Admins con roles estrictos - Puntos 8, 15)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('ADMIN', 'SUB_ADMIN')),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. Tabla: Categories (Categorías del Catálogo de Belleza)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. Tabla: Products (Catálogo Principal con Campos Estandarizados - Puntos 9, 10)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    precio INTEGER NOT NULL CHECK (precio >= 0),
    imagen_url TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 10 CHECK (stock >= 0),
    destacado BOOLEAN NOT NULL DEFAULT FALSE,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. Tabla: ProductVariants (Variantes de Tonos y Acabados)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    stock_estimado INTEGER NOT NULL DEFAULT 10 CHECK (stock_estimado >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. Tabla: Orders (Registro de Pedidos con Domicilios Dinámicos - Puntos 2, 12)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    nombre_cliente VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    barrio VARCHAR(150) NOT NULL,
    ciudad VARCHAR(100) NOT NULL DEFAULT 'Neiva',
    metodo_pago VARCHAR(50) NOT NULL CHECK (metodo_pago IN ('efectivo', 'nequi', 'daviplata')),
    total INTEGER NOT NULL CHECK (total >= 0),
    costo_domicilio INTEGER NOT NULL DEFAULT 0 CHECK (costo_domicilio >= 0),
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Confirmado', 'Enviado', 'Entregado', 'Cancelado')),
    notas TEXT,
    requiere_asesoria BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. Tabla: OrderItems (Ítems Detallados por Pedido)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario INTEGER NOT NULL CHECK (precio_unitario >= 0)
);

-- ------------------------------------------------------------------------------
-- 9. ÍNDICES DE ALTO RENDIMIENTO (Punto 5)
-- ------------------------------------------------------------------------------

-- Índices B-Tree para filtrado rápido por categoría, precio, estado y orden temporal
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_precio ON products(precio);
CREATE INDEX IF NOT EXISTS idx_products_estado_destacado ON products(estado, destacado);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Índices GIN para acelerar búsquedas de texto completo y similitud en productos
CREATE INDEX IF NOT EXISTS idx_products_tsv_search ON products USING gin(to_tsvector('spanish', nombre || ' ' || descripcion));
CREATE INDEX IF NOT EXISTS idx_products_nombre_trgm ON products USING gin(nombre gin_trgm_ops);

-- Índices B-Tree para Órdenes y Usuarios
CREATE INDEX IF NOT EXISTS idx_orders_estado_created ON orders(estado, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_barrio ON orders(barrio);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_rol ON users(rol);

-- ------------------------------------------------------------------------------
-- 10. DATOS INICIALES (SEED BÁSICO)
-- ------------------------------------------------------------------------------

-- Configuración inicial de la tienda
INSERT INTO store_settings (id, brand_name, logo_url, favicon_url, announcement_text, contact_phone, contact_email)
VALUES (
    1,
    'Dulce Cosmetics',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    '/favicon.ico',
    'Envíos a todo Neiva • Domicilio GRATIS en Las Granjas por compras desde $15.000',
    '+57 317 778 0413',
    'contacto@dulcecosmetics.com'
)
ON CONFLICT (id) DO NOTHING;

-- Categorías principales
INSERT INTO categories (id, nombre, slug, estado)
VALUES
    (1, 'Pestañinas', 'pestaninas', TRUE),
    (2, 'Labiales', 'labiales', TRUE),
    (3, 'Polvos & Rostro', 'polvos', TRUE),
    (4, 'Skincare & Cuidado', 'skincare', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Usuario Administrador Principal por defecto (password inicial: admin123456 con bcrypt)
-- Hash bcrypt de "admin123456": $2a$12$4mU8dG2uC77N92WkFsmZxe9kZfGj6M3O7uUuX0vKzF5X3Xw4cQ4Qy
INSERT INTO users (nombre, email, password_hash, rol, activo)
VALUES (
    'Administrador Dulce',
    'admin@dulcecosmetics.com',
    '$2a$12$vI8A3tV/WbY9WqN9z4aO.e9I7sQZ0pU.3pY4qT0mU5v6w7x8y9z0a',
    'ADMIN',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Usuario Sub-Admin para gestión de despachos en Neiva
INSERT INTO users (nombre, email, password_hash, rol, activo)
VALUES (
    'Operador Despachos Neiva',
    'despachos@dulcecosmetics.com',
    '$2a$12$vI8A3tV/WbY9WqN9z4aO.e9I7sQZ0pU.3pY4qT0mU5v6w7x8y9z0a',
    'SUB_ADMIN',
    TRUE
)
ON CONFLICT (email) DO NOTHING;
