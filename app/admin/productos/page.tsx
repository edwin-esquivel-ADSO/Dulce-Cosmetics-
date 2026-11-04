import { getAllCategoriesAdmin } from "@/backend/actions/categories";
import { getAllProductsAdmin } from "@/backend/actions/products";
import ProductManagementClient from "./ProductManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminProductosPage() {
  const [categories, products] = await Promise.all([
    getAllCategoriesAdmin(),
    getAllProductsAdmin(),
  ]);

  return <ProductManagementClient categories={categories} products={products} />;
}
