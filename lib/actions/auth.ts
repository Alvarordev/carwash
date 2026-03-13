"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const SUPER_ADMIN_EMAIL = "alvaro@gmail.com";

function getUserRole(user: { app_metadata?: unknown } | null) {
    if (!user?.app_metadata || typeof user.app_metadata !== "object") {
        return "";
    }

    const role = (user.app_metadata as { role?: unknown }).role;
    return typeof role === "string" ? role.toLowerCase() : "";
}

export async function signIn(email: string, password: string): Promise<string | null> {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return "INVALID_CREDENTIALS";

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL ?? SUPER_ADMIN_EMAIL;
    const isSuperAdmin = user?.email === superAdminEmail;
    const isAdmin = getUserRole(user) === "admin";

    if (!isSuperAdmin && !isAdmin) {
        await supabase.auth.signOut();
        return "FORBIDDEN_ROLE";
    }

    return null;
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}
