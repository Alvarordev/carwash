import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión — CarWash" };

export default async function LoginPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect("/dashboard");

    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
