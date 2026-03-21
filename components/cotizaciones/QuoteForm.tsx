"use client";

import type { UseFormRegister, Control, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Controller } from "react-hook-form";
import { CalendarPlus } from "iconoir-react";
import { usePaymentMethods } from "@/lib/hooks/usePaymentMethods";
import type { QuoteFormData } from "@/lib/schemas/quote";
import { QUOTE_STATUSES } from "@/lib/schemas/quote";
import type { CompanyProfile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuoteItemsTable } from "./QuoteItemsTable";
import { QuoteColorPicker } from "./QuoteColorPicker";

type QuoteFormProps = Readonly<{
  register: UseFormRegister<QuoteFormData>;
  control: Control<QuoteFormData>;
  errors: FieldErrors<QuoteFormData>;
  setValue: UseFormSetValue<QuoteFormData>;
  watch: (name: string) => unknown;
  companyName: string;
  profile: CompanyProfile | null;
  isSubmitting: boolean;
  onSave: () => void;
  onDownloadPdf: () => void;
}>;

export function QuoteForm({
  register,
  control,
  errors,
  setValue,
  watch,
  companyName,
  profile,
  isSubmitting,
  onSave,
  onDownloadPdf,
}: QuoteFormProps) {
  const { paymentMethods } = usePaymentMethods();

  const items = watch("items") as QuoteFormData["items"] ?? [];
  const subtotal = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0);
  const igv = Math.round(subtotal * 0.18 * 100) / 100;
  const total = Math.round((subtotal + igv) * 100) / 100;

  function setToday() {
    const today = new Date().toISOString().split("T")[0];
    setValue("date", today);
  }

  return (
    <div className="space-y-5">
      {/* Metadata */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Datos de la cotización
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">
              N° Cotización <span className="text-destructive">*</span>
            </Label>
            <Input
              {...register("quoteNumber")}
              placeholder="COT-001"
              className="bg-card border-border rounded-md"
            />
            {errors.quoteNumber && (
              <p className="text-destructive text-xs">{errors.quoteNumber.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Fecha</Label>
            <div className="flex gap-2">
              <Input
                {...register("date")}
                type="date"
                className="bg-card border-border rounded-md flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={setToday}
                title="Hoy"
                className="shrink-0"
              >
                <CalendarPlus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Estado</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-card border-border rounded-md w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {QUOTE_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      {/* Company data */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Datos de la empresa
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Nombre de empresa</Label>
            <Input
              {...register("companyName")}
              placeholder={companyName || "Nombre de empresa"}
              className="bg-card border-border rounded-md"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">RUC</Label>
            <Input
              {...register("companyRuc")}
              placeholder={profile?.ruc || "20123456789"}
              className="bg-card border-border rounded-md"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Representante</Label>
            <Input
              {...register("companyOwnerName")}
              placeholder={profile?.ownerName || "Nombre del representante"}
              className="bg-card border-border rounded-md"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Teléfono empresa</Label>
            <Input
              {...register("companyPhone")}
              placeholder={profile?.phone || "987 654 321"}
              className="bg-card border-border rounded-md"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">Dirección empresa</Label>
          <Input
            {...register("companyAddress")}
            placeholder={profile?.address || "Av. Lima 123, Lima"}
            className="bg-card border-border rounded-md"
          />
        </div>
      </div>

      {/* Client data */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Datos del cliente
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Nombre / Razón social</Label>
            <Input
              {...register("clientName")}
              placeholder="Cliente S.A.C."
              className="bg-card border-border rounded-md"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Tipo documento</Label>
            <Controller
              control={control}
              name="clientDocType"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || null)}>
                  <SelectTrigger className="bg-card border-border rounded-md w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="RUC">RUC</SelectItem>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="CE">Carnet de Extranjería</SelectItem>
                    <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">N° Documento</Label>
            <Input
              {...register("clientDocNumber")}
              placeholder="20987654321"
              className="bg-card border-border rounded-md"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Teléfono</Label>
            <Input
              {...register("clientPhone")}
              placeholder="987 654 321"
              className="bg-card border-border rounded-md"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Email</Label>
            <Input
              {...register("clientEmail")}
              type="email"
              placeholder="cliente@email.com"
              className="bg-card border-border rounded-md"
            />
            {errors.clientEmail && (
              <p className="text-destructive text-xs">{errors.clientEmail.message}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">Dirección</Label>
          <Input
            {...register("clientAddress")}
            placeholder="Av. Cliente 456, Lima"
            className="bg-card border-border rounded-md"
          />
        </div>
      </div>

      {/* Items */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Servicios / Ítems
        </h3>
        <QuoteItemsTable
          control={control}
          register={register}
          errors={errors}
          watch={watch}
        />

        {/* Totals summary */}
        <div className="flex justify-end pt-2 border-t border-border">
          <div className="space-y-1 text-sm min-w-44">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>IGV (18%):</span>
              <span>S/ {igv.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer options */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Opciones adicionales
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Forma de pago</Label>
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || null)}>
                  <SelectTrigger className="bg-card border-border rounded-md w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {paymentMethods
                      .filter((pm) => pm.isActive)
                      .map((pm) => (
                        <SelectItem key={pm.id} value={pm.name}>
                          {pm.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Color de diseño</Label>
            <QuoteColorPicker control={control} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">Notas</Label>
          <Textarea
            {...register("notes")}
            placeholder="Condiciones, validez de la cotización, etc."
            className="bg-card border-border rounded-md resize-none"
            rows={3}
          />
          {errors.notes && (
            <p className="text-destructive text-xs">{errors.notes.message}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pb-4">
        <Button type="button" variant="outline" onClick={onDownloadPdf}>
          Descargar PDF
        </Button>
        <Button type="button" onClick={onSave} disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar cotización"}
        </Button>
      </div>
    </div>
  );
}
