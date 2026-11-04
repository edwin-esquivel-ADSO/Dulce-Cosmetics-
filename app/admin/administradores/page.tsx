import { getAdminUsersAction } from "@/backend/actions/adminUserActions";
import AdminUsersClient from "./AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminAdministradoresPage() {
  const users = await getAdminUsersAction();

  return <AdminUsersClient initialUsers={users} />;
}
