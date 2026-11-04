const fs = require('fs');
let dbUrl = process.env.DATABASE_URL || '';

if (!dbUrl && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  for (const line of envContent.split(/\r?\n/)) {
    if (line.startsWith('DATABASE_URL=')) {
      dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
    }
  }
}

if (!dbUrl) {
  console.error("No DATABASE_URL found in environment or .env.local");
  process.exit(1);
}

const { neon } = require('@neondatabase/serverless');
const sql = neon(dbUrl);

async function migrate() {
  console.log("🚀 Aplicando actualizaciones de esquema en Neon DB...");

  // 1. Crear tabla store_settings si no existe
  console.log("1. Asegurando tabla store_settings...");
  await sql`
    CREATE TABLE IF NOT EXISTS store_settings (
      id SERIAL PRIMARY KEY,
      brand_name VARCHAR(255) NOT NULL DEFAULT 'Dulce Cosmetics',
      logo_url TEXT NOT NULL,
      favicon_url TEXT NOT NULL DEFAULT '/favicon.ico',
      announcement_text TEXT,
      contact_phone VARCHAR(50),
      contact_email VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // Insertar fila por defecto en store_settings si está vacía
  await sql`
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
  `;

  // 2. Actualizar tabla users: activo, updated_at
  console.log("2. Verificando columnas en users...");
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;
  `;
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  `;

  // 3. Actualizar tabla products: stock, updated_at
  console.log("3. Verificando columnas en products (stock, updated_at)...");
  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 10 CHECK (stock >= 0);
  `;
  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  `;

  // 4. Actualizar tabla orders: ciudad, updated_at
  console.log("4. Verificando columnas en orders (ciudad, updated_at)...");
  await sql`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100) NOT NULL DEFAULT 'Neiva';
  `;
  await sql`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  `;

  console.log("✅ Todas las columnas y tablas requeridas han sido sincronizadas con éxito.");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error durante la migración:", err);
    process.exit(1);
  });
