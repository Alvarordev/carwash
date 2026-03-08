"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Company, UserProfile } from "@/lib/types";
import type { CreateUserFormData } from "@/lib/schemas/admin";

const SUPER_ADMIN_EMAIL = "alvaro@gmail.com";

async function assertSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    redirect("/login");
  }
  return user;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getCompanies(): Promise<Company[]> {
  await assertSuperAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    status: c.status,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }));
}

export async function getUsers(): Promise<UserProfile[]> {
  await assertSuperAdmin();
  const admin = createAdminClient();

  const [profilesResult, companiesResult] = await Promise.all([
    admin.from("user_profiles").select("*").order("created_at", { ascending: false }),
    admin.from("companies").select("id, name"),
  ]);

  if (profilesResult.error) throw new Error(profilesResult.error.message);
  if (companiesResult.error) throw new Error(companiesResult.error.message);

  const companyMap = new Map(
    (companiesResult.data ?? []).map((c) => [c.id, c.name])
  );

  return (profilesResult.data ?? []).map((p) => ({
    id: p.id,
    companyId: p.company_id ?? "",
    firstName: p.first_name,
    lastName: p.last_name,
    role: (p.role as "admin" | "operator") ?? "operator",
    email: p.email ?? "",
    companyName: companyMap.get(p.company_id ?? "") ?? "",
    createdAt: p.created_at ?? "",
  }));
}

type ActionResult = { success: true } | { success: false; error: string };

export async function createUser(data: CreateUserFormData): Promise<ActionResult> {
  await assertSuperAdmin();
  const admin = createAdminClient();

  let companyId = data.companyId;

  // Create company if needed
  if (!companyId && data.newCompanyName) {
    const slug = toSlug(data.newCompanyName);
    const { data: company, error } = await admin
      .from("companies")
      .insert({ name: data.newCompanyName, slug, status: "active" })
      .select("id")
      .single();

    if (error) return { success: false, error: `Error al crear la empresa: ${error.message}` };
    companyId = company.id;
  }

  if (!companyId) return { success: false, error: "No se pudo determinar la empresa." };

  // Create auth user
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    user_metadata: { display_name: `${data.firstName} ${data.lastName}` },
    app_metadata: { company_id: companyId, role: data.role, is_super_admin: false },
    email_confirm: true,
  });

  if (authError) {
    return { success: false, error: `Error al crear el usuario: ${authError.message}` };
  }

  // Create user profile (email stored here for direct lookup)
  const { error: profileError } = await admin.from("user_profiles").insert({
    id: authUser.user.id,
    company_id: companyId,
    first_name: data.firstName,
    last_name: data.lastName,
    role: data.role,
    email: data.email,
  });

  if (profileError) {
    // Rollback auth user
    await admin.auth.admin.deleteUser(authUser.user.id);
    return { success: false, error: `Error al crear el perfil: ${profileError.message}` };
  }

  return { success: true };
}
