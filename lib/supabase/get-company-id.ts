import { createClient } from "./client";

export async function getCompanyId(): Promise<string> {
  const supabase = createClient();
  // getUser() validates against the server using the current access token,
  // which is reliable even if the refresh token was rotated by middleware.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const companyId = user?.app_metadata?.company_id;
  if (!companyId) throw new Error("No company_id in session");
  return companyId;
}
