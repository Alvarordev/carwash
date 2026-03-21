"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft } from "iconoir-react";
import { quoteSchema } from "@/lib/schemas/quote";
import type { QuoteFormData } from "@/lib/schemas/quote";
import type { Quote, CompanyProfile } from "@/lib/types";
import { useCompanyProfile } from "@/lib/hooks/useCompanyProfile";
import { generateQuotePdf } from "@/lib/utils/quote-pdf";
import { Button } from "@/components/ui/button";
import { QuoteForm } from "./QuoteForm";
import { QuotePreview } from "./QuotePreview";

type QuoteEditorProps = Readonly<{
  quote: Quote | null;
  onBack: () => void;
  onCreate: (data: QuoteFormData) => Promise<Quote>;
  onUpdate: (id: string, data: QuoteFormData) => Promise<Quote>;
  nextQuoteNumber: string;
}>;

function buildDefaultValues(
  quote: Quote | null,
  nextNum: string,
  profile: CompanyProfile | null,
  companyName: string
): QuoteFormData {
  if (quote) {
    return {
      quoteNumber: quote.quoteNumber,
      date: quote.date,
      status: quote.status,
      companyName: quote.companyName ?? "",
      companyRuc: quote.companyRuc ?? "",
      companyOwnerName: quote.companyOwnerName ?? "",
      companyAddress: quote.companyAddress ?? "",
      companyPhone: quote.companyPhone ?? "",
      companyLogoUrl: quote.companyLogoUrl ?? "",
      clientName: quote.clientName ?? "",
      clientDocType: quote.clientDocType ?? "",
      clientDocNumber: quote.clientDocNumber ?? "",
      clientPhone: quote.clientPhone ?? "",
      clientEmail: quote.clientEmail ?? "",
      clientAddress: quote.clientAddress ?? "",
      items: quote.items.map((i) => ({
        id: i.id,
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      paymentMethod: quote.paymentMethod ?? "",
      colorTheme: quote.colorTheme,
      notes: quote.notes ?? "",
    };
  }

  return {
    quoteNumber: nextNum,
    date: new Date().toISOString().split("T")[0],
    status: "borrador",
    companyName: companyName,
    companyRuc: profile?.ruc ?? "",
    companyOwnerName: profile?.ownerName ?? "",
    companyAddress: profile?.address ?? "",
    companyPhone: profile?.phone ?? "",
    companyLogoUrl: profile?.logoUrl ?? "",
    clientName: "",
    clientDocType: "",
    clientDocNumber: "",
    clientPhone: "",
    clientEmail: "",
    clientAddress: "",
    items: [{ description: "", quantity: 1, unitPrice: 0 }],
    paymentMethod: "",
    colorTheme: "#3B82F6",
    notes: "",
  };
}

export function QuoteEditor({ quote, onBack, onCreate, onUpdate, nextQuoteNumber }: QuoteEditorProps) {
  const { profile, companyName, loading: profileLoading } = useCompanyProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: buildDefaultValues(quote, nextQuoteNumber, null, ""),
  });

  useEffect(() => {
    if (!profileLoading) {
      reset(buildDefaultValues(quote, nextQuoteNumber, profile, companyName));
    }
  }, [profileLoading, profile, companyName]); // eslint-disable-line react-hooks/exhaustive-deps

  const watchedData = watch() as QuoteFormData;

  async function handleSave(data: QuoteFormData) {
    setIsSubmitting(true);
    try {
      if (quote) {
        await onUpdate(quote.id, data);
        toast.success("Cotización actualizada");
      } else {
        await onCreate(data);
        toast.success("Cotización creada");
        onBack();
      }
    } catch {
      toast.error("Error al guardar la cotización");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDownloadPdf() {
    const data = watch() as QuoteFormData;
    try {
      await generateQuotePdf(data, {
        name: data.companyName || companyName,
        ruc: data.companyRuc || null,
        ownerName: data.companyOwnerName || null,
        address: data.companyAddress || null,
        phone: data.companyPhone || null,
        logoUrl: data.companyLogoUrl || profile?.logoUrl || null,
      });
    } catch {
      toast.error("Error al generar el PDF");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="size-4" />
          Volver
        </Button>
        <h2 className="text-lg font-semibold">
          {quote ? `Cotización ${quote.quoteNumber}` : "Nueva cotización"}
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <form onSubmit={handleSubmit(handleSave)}>
          <QuoteForm
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
            watch={watch}
            companyName={companyName}
            profile={profile}
            isSubmitting={isSubmitting}
            onSave={handleSubmit(handleSave)}
            onDownloadPdf={handleDownloadPdf}
          />
        </form>

        <div className="xl:sticky xl:top-4">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
            Vista previa
          </p>
          <QuotePreview
            data={watchedData}
            companyName={companyName}
            profile={profile}
          />
        </div>
      </div>
    </div>
  );
}
