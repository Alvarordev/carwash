import { createClient } from "./client";

export async function getCompanyId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const companyId = session?.user?.app_metadata?.company_id;
  if (!companyId) throw new Error("No company_id in session");
  return companyId;
}
