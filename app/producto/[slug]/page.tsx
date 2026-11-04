import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/backend/actions/products";
import ProductDetailClient from "./ProductDetailClient";
import ProductCard from "@/components/ProductCard";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    return {
      title: "Producto no encontrado | Dulce Cosmetics",
    };
  }

  return {
    title: `${product.nombre} | Dulce Cosmetics Neiva`,
    description: product.descripcion.slice(0, 160),
    openGraph: {
      title: `${product.nombre} | Dulce Cosmetics`,
      description: product.descripcion.slice(0, 160),
      images: [{ url: product.imagenUrl }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  // Productos relacionados de la misma categoría
  const related = await getProducts({ categorySlug: product.category.slug });
  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Vista Principal del Producto */}
      <ProductDetailClient product={product} />

      {/* Sección de Productos Relacionados */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-[#d4c2c2]/40 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#735c00] font-bold block mb-1">
                Completa Tu Rutina
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
                Productos Relacionados
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                nombre={p.nombre}
                slug={p.slug}
                precio={p.precio}
                imagenUrl={p.imagenUrl}
                destacado={p.destacado}
                category={p.category}
                variants={p.variants}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
