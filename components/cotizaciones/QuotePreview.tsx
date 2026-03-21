"use client";

import type { QuoteFormData } from "@/lib/schemas/quote";
import type { CompanyProfile } from "@/lib/types";

type QuotePreviewProps = Readonly<{
  data: QuoteFormData;
  companyName: string;
  profile: CompanyProfile | null;
}>;

export function QuotePreview({ data, companyName, profile }: QuotePreviewProps) {
  const color = data.colorTheme || "#3B82F6";

  const items = data.items ?? [];
  const subtotal = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0);
  const igv = Math.round(subtotal * 0.18 * 100) / 100;
  const total = Math.round((subtotal + igv) * 100) / 100;

  const displayCompanyName = data.companyName || companyName || "Mi Empresa";
  const logoUrl = data.companyLogoUrl || profile?.logoUrl || null;

  return (
    <div className="bg-white text-gray-800 rounded-lg shadow-sm overflow-hidden text-[10px] leading-tight min-w-0">
      {/* Header */}
      <div className="flex items-start gap-3 p-4" style={{ backgroundColor: color }}>
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo"
            className="w-12 h-12 object-contain rounded shrink-0 bg-white/20"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">{displayCompanyName}</p>
          {data.companyRuc && (
            <p className="text-white/85 mt-0.5">RUC: {data.companyRuc}</p>
          )}
          {data.companyOwnerName && (
            <p className="text-white/85">{data.companyOwnerName}</p>
          )}
          {data.companyAddress && (
            <p className="text-white/85">{data.companyAddress}</p>
          )}
          {data.companyPhone && (
            <p className="text-white/85">{data.companyPhone}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-white font-bold text-base">COTIZACIÓN</p>
          <p className="text-white/85">N° {data.quoteNumber || "—"}</p>
          <p className="text-white/85">{data.date || "—"}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Client */}
        <div>
          <p className="font-semibold uppercase text-[9px] mb-1" style={{ color }}>
            Cliente
          </p>
          <div className="border-t mb-2" style={{ borderColor: color }} />
          <div className="space-y-0.5 text-gray-700">
            {data.clientName ? <p>{data.clientName}</p> : <p className="text-gray-400">—</p>}
            {data.clientDocType && data.clientDocNumber && (
              <p>{data.clientDocType}: {data.clientDocNumber}</p>
            )}
            {data.clientPhone && <p>Tel: {data.clientPhone}</p>}
            {data.clientEmail && <p>{data.clientEmail}</p>}
            {data.clientAddress && <p>{data.clientAddress}</p>}
          </div>
        </div>

        {/* Items table */}
        <div>
          <table className="w-full">
            <thead>
              <tr className="text-white" style={{ backgroundColor: color }}>
                <th className="text-left px-1.5 py-1 font-medium rounded-tl">#</th>
                <th className="text-left px-1.5 py-1 font-medium w-full">Descripción</th>
                <th className="text-right px-1.5 py-1 font-medium whitespace-nowrap">Cant.</th>
                <th className="text-right px-1.5 py-1 font-medium whitespace-nowrap">P. Unit.</th>
                <th className="text-right px-1.5 py-1 font-medium whitespace-nowrap rounded-tr">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-3 text-gray-400 italic">
                    Sin ítems
                  </td>
                </tr>
              ) : (
                items.map((item, i) => {
                  const sub = Number(item.quantity) * Number(item.unitPrice);
                  return (
                    <tr
                      key={i}
                      style={{ backgroundColor: i % 2 === 0 ? "#f9f9f9" : "white" }}
                    >
                      <td className="px-1.5 py-1 text-gray-500">{i + 1}</td>
                      <td className="px-1.5 py-1">{item.description || <span className="text-gray-400">—</span>}</td>
                      <td className="px-1.5 py-1 text-right">{item.quantity}</td>
                      <td className="px-1.5 py-1 text-right">S/ {Number(item.unitPrice).toFixed(2)}</td>
                      <td className="px-1.5 py-1 text-right font-medium">S/ {sub.toFixed(2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-44 space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>IGV (18%):</span>
              <span>S/ {igv.toFixed(2)}</span>
            </div>
            <div
              className="flex justify-between font-bold text-white text-[11px] px-2 py-1 rounded"
              style={{ backgroundColor: color }}
            >
              <span>TOTAL:</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        {(data.paymentMethod || data.notes) && (
          <div className="pt-2 border-t border-gray-200 space-y-1 text-gray-600">
            {data.paymentMethod && (
              <p><span className="font-medium">Forma de pago:</span> {data.paymentMethod}</p>
            )}
            {data.notes && (
              <p><span className="font-medium">Notas:</span> {data.notes}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
