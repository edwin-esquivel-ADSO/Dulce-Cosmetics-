import { getOrdersAdmin } from "@/backend/actions/orders";
import OrderManagementClient from "./OrderManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminPedidosPage() {
  const orders = await getOrdersAdmin();
  return <OrderManagementClient orders={orders} />;
}
