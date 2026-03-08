import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let displayName = "Usuario";

  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    console.log("aqui", user.id)

    if (profile) {
      displayName = `${profile.first_name} ${profile.last_name}`.trim();
    } else {
      displayName = user.user_metadata?.display_name ?? user.email ?? "Usuario";
    }
  }

  console.log(user?.id)

  return <DashboardShell displayName={displayName}>{children}</DashboardShell>;
}
