"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCompanyProfile } from "@/lib/hooks/useCompanyProfile";
import { companyProfileSchema } from "@/lib/schemas/companyProfile";
import type { CompanyProfileFormData } from "@/lib/schemas/companyProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompanyLogoUpload } from "./CompanyLogoUpload";

export function CompanyProfileSection() {
  const { profile, companyName, loading, upsertProfile, uploadLogo } = useCompanyProfile();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        ruc: profile.ruc ?? "",
        ownerName: profile.ownerName ?? "",
        address: profile.address ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile, reset]);

  async function onSubmit(data: CompanyProfileFormData) {
    try {
      await upsertProfile(data);
      toast.success("Perfil de empresa guardado");
    } catch {
      toast.error("Error al guardar el perfil");
    }
  }

  async function handleLogoUpload(file: File) {
    try {
      await uploadLogo(file);
      toast.success("Logo actualizado");
      return profile?.logoUrl ?? "";
    } catch {
      toast.error("Error al subir el logo");
      throw new Error("Upload failed");
    }
  }

  return (
    <div className="bg-card shadow-sm rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-base font-semibold">Perfil de Empresa</h2>
        <p className="text-sm text-muted-foreground">
          Datos que aparecerán en tus cotizaciones.
        </p>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-center text-muted-foreground text-sm">Cargando...</div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Logo</Label>
            <CompanyLogoUpload
              logoUrl={profile?.logoUrl ?? null}
              onUpload={handleLogoUpload}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Nombre de empresa</Label>
              <Input
                value={companyName}
                disabled
                className="bg-muted border-border rounded-md text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Cambiar desde administración
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">RUC</Label>
              <Input
                {...register("ruc")}
                placeholder="20123456789"
                className="bg-card border-border rounded-md"
              />
              {errors.ruc && (
                <p className="text-destructive text-xs">{errors.ruc.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Representante / Propietario</Label>
              <Input
                {...register("ownerName")}
                placeholder="Nombre del representante"
                className="bg-card border-border rounded-md"
              />
              {errors.ownerName && (
                <p className="text-destructive text-xs">{errors.ownerName.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Teléfono</Label>
              <Input
                {...register("phone")}
                placeholder="987 654 321"
                className="bg-card border-border rounded-md"
              />
              {errors.phone && (
                <p className="text-destructive text-xs">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Dirección</Label>
            <Input
              {...register("address")}
              placeholder="Av. Lima 123, Lima"
              className="bg-card border-border rounded-md"
            />
            {errors.address && (
              <p className="text-destructive text-xs">{errors.address.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
