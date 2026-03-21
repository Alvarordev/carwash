"use client";

import { useRef, useEffect, useState } from "react";
import type { QuoteFormData } from "@/lib/schemas/quote";
import type { CompanyProfile } from "@/lib/types";
import { shouldShowSimpleTable, calculateQuoteTotals, formatQuoteDate } from "@/lib/utils/quote-helpers";

type QuotePreviewProps = Readonly<{
  data: QuoteFormData;
  companyName: string;
  profile: CompanyProfile | null;
}>;

const A4_WIDTH = 595;
const A4_HEIGHT = 842;

export function QuotePreview({ data, companyName, profile }: QuotePreviewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(entry.contentRect.width / A4_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const color = data.colorTheme || "#3B82F6";
  const items = data.items ?? [];
  const { subtotal, igv, total } = calculateQuoteTotals(items);
  const simple = shouldShowSimpleTable(items);
  const displayCompanyName = data.companyName || companyName || "Mi Empresa";
  const logoUrl = data.companyLogoUrl || profile?.logoUrl || null;
  const formattedDate = data.date ? formatQuoteDate(data.date) : "—";

  return (
    <div ref={wrapperRef} style={{ height: A4_HEIGHT * scale, overflow: "hidden" }}>
      <div
        style={{
          width: A4_WIDTH,
          height: A4_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          backgroundColor: "white",
          position: "relative",
          fontFamily: "helvetica, arial, sans-serif",
          color: "#1a1a1a",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 180,
            height: 110,
            clipPath: "polygon(40% 0, 100% 0, 100% 100%)",
            backgroundColor: color,
          }}
        />

        <div style={{ padding: "60px 40px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, position: "relative" }}>
            <div>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 2 }}>N°. {data.quoteNumber || "—"}</div>
              <div style={{ fontSize: 12, color: "#555" }}>{formattedDate}</div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 2, color: "#1a1a1a", paddingRight: 16 }}>
              COTIZACIÓN
            </div>
          </div>

          <div style={{ marginBottom: 20 }} />

          <div style={{ display: "flex", gap: 24, marginBottom: 28 }}>
            <div style={{ flex: 1 }}>
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{ height: 40, maxWidth: 120, objectFit: "contain", marginBottom: 6 }}
                />
              )}
              <div style={{ fontSize: 9, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 4, letterSpacing: 1 }}>
                Cotización
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color, marginBottom: 4 }}>{displayCompanyName}</div>
              {data.companyOwnerName && (
                <div style={{ fontSize: 11, color: "#333", marginBottom: 2 }}>{data.companyOwnerName}</div>
              )}
              {data.companyRuc && (
                <div style={{ fontSize: 11, color: "#333", marginBottom: 2 }}>RUC : {data.companyRuc}</div>
              )}
              {data.companyAddress && (
                <div style={{ fontSize: 11, color: "#333" }}>{data.companyAddress}</div>
              )}
            </div>
            
            <div style={{ flex: 1, textAlign: "right" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 4, letterSpacing: 1 }}>
                Cliente
              </div>
              {data.clientName ? (
                <div style={{ fontSize: 15, fontWeight: 700, color, marginBottom: 4 }}>{data.clientName}</div>
              ) : (
                <div style={{ fontSize: 13, color: "#bbb", marginBottom: 4 }}>—</div>
              )}
              {data.clientDocType && data.clientDocNumber && (
                <div style={{ fontSize: 11, color: "#333", marginBottom: 2 }}>{data.clientDocType} : {data.clientDocNumber}</div>
              )}
              {data.clientPhone && (
                <div style={{ fontSize: 11, color: "#333", marginBottom: 2 }}>ATENCION : {data.clientPhone}</div>
              )}
              {data.clientEmail && (
                <div style={{ fontSize: 11, color, marginBottom: 2 }}>REFERENCIA : {data.clientEmail}</div>
              )}
              {data.clientAddress && (
                <div style={{ fontSize: 11, color: "#333" }}>{data.clientAddress}</div>
              )}
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
            <thead>
              <tr style={{ backgroundColor: color }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "8px 12px",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: "4px 0 0 4px",
                  }}
                >
                  Descripción
                </th>
                {!simple && (
                  <>
                    <th style={{ textAlign: "center", padding: "8px 8px", color: "white", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                      Cant.
                    </th>
                    <th style={{ textAlign: "right", padding: "8px 8px", color: "white", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                      P. Unit.
                    </th>
                  </>
                )}
                <th
                  style={{
                    textAlign: "right",
                    padding: "8px 12px",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    borderRadius: "0 4px 4px 0",
                  }}
                >
                  {simple ? "Precio" : "Subtotal"}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={simple ? 2 : 4}
                    style={{ textAlign: "center", padding: "20px", color: "#aaa", fontSize: 11, fontStyle: "italic" }}
                  >
                    Sin ítems
                  </td>
                </tr>
              ) : (
                items.map((item, i) => {
                  const qty = Number(item.quantity);
                  const price = Number(item.unitPrice);
                  const rowTotal = qty * price;
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #e5e5e5" }}>
                      <td style={{ padding: "8px 12px", fontSize: 11, color: "#333" }}>
                        {item.description || <span style={{ color: "#bbb" }}>—</span>}
                      </td>
                      {!simple && (
                        <>
                          <td style={{ padding: "8px 8px", fontSize: 11, color: "#333", textAlign: "center" }}>{qty}</td>
                          <td style={{ padding: "8px 8px", fontSize: 11, color: "#333", textAlign: "right" }}>
                            S/. {price.toFixed(2)}
                          </td>
                        </>
                      )}
                      <td style={{ padding: "8px 12px", fontSize: 11, color: "#333", textAlign: "right" }}>
                        S/. {(simple ? price : rowTotal).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
            <div
              style={{
                backgroundColor: "#f3f3f3",
                borderRadius: 4,
                padding: "12px 20px",
                minWidth: 220,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555", marginBottom: 6 }}>
                <span>Subtotal</span>
                <span>S/. {subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555", marginBottom: 8 }}>
                <span>IGV</span>
                <span>S/. {igv.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>
                <span>TOTAL</span>
                <span>S/. {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment method */}
          {data.paymentMethod && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", marginBottom: 4 }}>
                Metodo de Pago
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#444" }}>{data.paymentMethod}</div>
            </div>
          )}

          {/* Notes */}
          {data.notes && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", marginBottom: 4 }}>
                Notas
              </div>
              <div style={{ fontSize: 11, color: "#555" }}>{data.notes}</div>
            </div>
          )}
        </div>

        {/* Decorative triangle — bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 160,
            height: 100,
            clipPath: "polygon(0 0, 0 100%, 100% 100%)",
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
