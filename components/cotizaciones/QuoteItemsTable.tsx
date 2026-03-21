"use client";

import { useFieldArray } from "react-hook-form";
import type { Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { Trash, Plus } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QuoteFormData } from "@/lib/schemas/quote";

type QuoteItemsTableProps = Readonly<{
  control: Control<QuoteFormData>;
  register: UseFormRegister<QuoteFormData>;
  errors: FieldErrors<QuoteFormData>;
  watch: (name: string) => unknown;
}>;

export function QuoteItemsTable({ control, register, errors, watch }: QuoteItemsTableProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const items = watch("items") as QuoteFormData["items"];

  function addItem() {
    append({ description: "", quantity: 1, unitPrice: 0 });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs">
              <th className="text-left pb-2 pr-2 font-medium w-full">Descripción</th>
              <th className="text-right pb-2 px-2 font-medium whitespace-nowrap">Cant.</th>
              <th className="text-right pb-2 px-2 font-medium whitespace-nowrap">P. Unit.</th>
              <th className="text-right pb-2 pl-2 font-medium whitespace-nowrap">Subtotal</th>
              <th className="pb-2 pl-2 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {fields.map((field, index) => {
              const qty = Number(items?.[index]?.quantity ?? 1);
              const price = Number(items?.[index]?.unitPrice ?? 0);
              const sub = qty * price;
              const itemErrors = (errors.items as Record<string, unknown>[] | undefined)?.[index] as
                | Record<string, { message?: string }>
                | undefined;

              return (
                <tr key={field.id}>
                  <td className="py-2 pr-2">
                    <Input
                      {...register(`items.${index}.description`)}
                      placeholder="Descripción del servicio"
                      className="bg-card border-border rounded-md text-sm h-8"
                    />
                    {itemErrors?.description && (
                      <p className="text-destructive text-xs mt-0.5">
                        {itemErrors.description.message}
                      </p>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <Input
                      {...register(`items.${index}.quantity`)}
                      type="number"
                      min="1"
                      className="bg-card border-border rounded-md text-sm h-8 w-16 text-right"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <Input
                      {...register(`items.${index}.unitPrice`)}
                      type="number"
                      min="0"
                      step="0.01"
                      className="bg-card border-border rounded-md text-sm h-8 w-24 text-right"
                    />
                  </td>
                  <td className="py-2 pl-2 text-right font-medium whitespace-nowrap">
                    S/ {sub.toFixed(2)}
                  </td>
                  <td className="py-2 pl-2">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      disabled={fields.length === 1}
                    >
                      <Trash className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {errors.items && !Array.isArray(errors.items) && (
        <p className="text-destructive text-xs">{(errors.items as { message?: string }).message}</p>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addItem} className="self-start">
        <Plus className="size-4 mr-1.5" />
        Agregar ítem
      </Button>
    </div>
  );
}
