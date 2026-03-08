import { getCompanies, getUsers } from "@/lib/actions/admin";
import AdminPageClient from "@/components/admin/AdminPageClient";

export default async function AdminPage() {
  const [companies, users] = await Promise.all([getCompanies(), getUsers()]);
  return <AdminPageClient companies={companies} users={users} />;
}
