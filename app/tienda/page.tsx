import { getProducts } from "@/backend/actions/products";
import { getCategories } from "@/backend/actions/categories";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";

export const dynamic = "force-dynamic";

interface TiendaPageProps {
  searchParams: Promise<{
    cat?: string;
    q?: string;
    sort?: string;
  }>;
}

export default async function TiendaPage({ searchParams }: TiendaPageProps) {
  const resolvedParams = await searchParams;
  const currentCat = resolvedParams.cat || "todas";
  const searchQuery = resolvedParams.q || "";
  const currentSort = resolvedParams.sort || "featured";

  const [categories, rawProducts] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug: currentCat !== "todas" ? currentCat : undefined,
      search: searchQuery,
    }),
  ]);

  // Aplicar ordenamiento
  let sortedProducts = [...rawProducts];
  if (currentSort === "price-asc") {
    sortedProducts.sort((a, b) => a.precio - b.precio);
  } else if (currentSort === "price-desc") {
    sortedProducts.sort((a, b) => b.precio - a.precio);
  } else if (currentSort === "name-asc") {
    sortedProducts.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  const currentCategoryName =
    currentCat === "todas"
      ? "Catálogo Completo"
      : categories.find((c) => c.slug === currentCat)?.nombre || "Colección";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header del Catálogo */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-[#735c00] font-bold">
          Boutique Dulce Cosmetics
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1c1c]">
          {currentCategoryName}
        </h1>
        <p className="text-sm text-[#504444] max-w-md mx-auto">
          Fórmulas profesionales seleccionadas para el clima y la belleza de las mujeres de Neiva.
        </p>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#d4c2c2]/40 shadow-sm space-y-4">
        {/* Fila 1: Buscador y Ordenamiento */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Buscador */}
          <form method="GET" action="/tienda" className="relative w-full sm:max-w-md">
            {currentCat !== "todas" && (
              <input type="hidden" name="cat" value={currentCat} />
            )}
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Buscar por nombre, tono o categoría..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-[#d4c2c2] rounded-xl text-sm focus:outline-none focus:border-[#7b5455] transition-colors"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <Link
                href={`/tienda${currentCat !== "todas" ? `?cat=${currentCat}` : ""}`}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </Link>
            )}
          </form>

          {/* Selector de Orden */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs text-gray-500 hidden sm:inline">Ordenar:</span>
            <div className="flex items-center gap-2">
              <Link
                href={`/tienda?cat=${currentCat}&q=${encodeURIComponent(searchQuery)}&sort=featured`}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  currentSort === "featured"
                    ? "bg-[#7b5455] text-white border-[#7b5455]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                Destacados
              </Link>
              <Link
                href={`/tienda?cat=${currentCat}&q=${encodeURIComponent(searchQuery)}&sort=price-asc`}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  currentSort === "price-asc"
                    ? "bg-[#7b5455] text-white border-[#7b5455]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                Precio: Menor
              </Link>
              <Link
                href={`/tienda?cat=${currentCat}&q=${encodeURIComponent(searchQuery)}&sort=price-desc`}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  currentSort === "price-desc"
                    ? "bg-[#7b5455] text-white border-[#7b5455]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                Precio: Mayor
              </Link>
            </div>
          </div>
        </div>

        {/* Fila 2: Chips de Categorías */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none border-t border-gray-100">
          <Link
            href={`/tienda${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              currentCat === "todas"
                ? "bg-[#7b5455] text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-[#f4c2c2]/40"
            }`}
          >
            Todas
          </Link>

          {categories.map((cat) => {
            const isActive = currentCat === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/tienda?cat=${cat.slug}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#7b5455] text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-[#f4c2c2]/40"
                }`}
              >
                {cat.nombre}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Resultados y Contador */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Mostrando {sortedProducts.length} producto(s)</span>
        {searchQuery && (
          <span>
            Filtrado por término: <strong className="text-gray-800">"{searchQuery}"</strong>
          </span>
        )}
      </div>

      {/* Grilla de Productos */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#d4c2c2]/40 shadow-sm p-8 space-y-4">
          <div className="w-16 h-16 bg-[#f4c2c2]/30 text-[#7b5455] rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-gray-900">
            No encontramos productos con ese criterio
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Intenta buscando con otra palabra clave o restablece los filtros para ver todo nuestro
            catálogo de belleza en Neiva.
          </p>
          <Link
            href="/tienda"
            className="inline-block px-6 py-2.5 bg-[#7b5455] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#613d3e] transition-colors"
          >
            Ver Todos los Productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              nombre={product.nombre}
              slug={product.slug}
              precio={product.precio}
              imagenUrl={product.imagenUrl}
              destacado={product.destacado}
              category={product.category}
              variants={product.variants}
            />
          ))}
        </div>
      )}
    </div>
  );
}
