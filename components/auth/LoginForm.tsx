"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeClosed } from "iconoir-react";
import { signIn } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get("next") ?? "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const error = await signIn(email, password);
            if (error) {
                toast.error("Credenciales inválidas", {
                    description: "Verifica tu correo y contraseña.",
                });
                return;
            }
            router.push(next);
            router.refresh();
        });
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
                />
                <div
                    className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
                />
            </div>

            <div className="relative w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-3">
                        <span className="text-3xl font-bold text-primary">CarWash Pro</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Sistema de gestión — Inicia sesión para continuar
                    </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-7 shadow-2xl">
                    <h1 className="text-xl font-semibold text-foreground mb-6">Bienvenido de nuevo</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm text-muted-foreground">
                                Correo electrónico
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="admin@carwash.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isPending}
                                className="bg-background border-border h-10"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm text-muted-foreground">
                                Contraseña
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPwd ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isPending}
                                    className="bg-background border-border h-10 pr-10"
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPwd((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPwd ? <EyeClosed className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-10 mt-2 font-semibold"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <span className="flex items-center gap-2">
                                    <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                    Ingresando…
                                </span>
                            ) : (
                                "Iniciar sesión"
                            )}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-5">
                    Acceso restringido al personal autorizado
                </p>
            </div>
        </div>
    );
}
