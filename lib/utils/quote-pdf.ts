import type { QuoteFormData } from "@/lib/schemas/quote";
import { shouldShowSimpleTable, calculateQuoteTotals, formatQuoteDate } from "@/lib/utils/quote-helpers";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function formatCurrency(value: number): string {
  return `S/. ${value.toFixed(2)}`;
}

type PdfImageData = {
  dataUrl: string;
  format: "JPEG" | "PNG";
};

async function blobToDataUrl(blob: Blob): Promise<string | null> {
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

async function blobToPngDataUrl(blob: Blob): Promise<string | null> {
  return await new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(null);
        return;
      }
      ctx.drawImage(image, 0, 0);
      const pngDataUrl = canvas.toDataURL("image/png");
      URL.revokeObjectURL(url);
      resolve(pngDataUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    image.src = url;
  });
}

async function fetchImageForPdf(url: string): Promise<PdfImageData | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();

    const mimeType = blob.type.toLowerCase();
    if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
      const dataUrl = await blobToDataUrl(blob);
      return dataUrl ? { dataUrl, format: "JPEG" } : null;
    }

    const pngDataUrl = await blobToPngDataUrl(blob);
    return pngDataUrl ? { dataUrl: pngDataUrl, format: "PNG" } : null;
  } catch {
    return null;
  }
}

export async function generateQuotePdf(
  quote: QuoteFormData,
  options?: Readonly<{ fallbackLogoUrl?: string | null }>
): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Preview: padding 40px sides = 14.1mm → 14mm
  const margin = 14;
  const pageWidth = 210;
  const pageHeight = 297;
  const contentWidth = pageWidth - margin * 2; // 182mm
  const [r, g, b] = hexToRgb(quote.colorTheme);
  const rightEdge = pageWidth - margin; // 196mm
  const logoUrl = quote.companyLogoUrl || options?.fallbackLogoUrl || null;
  const hasLogo = Boolean(logoUrl);

  let y = 0;

  const checkPage = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // ── Decorative triangle — top-right ──
  // Preview: width=180px, height=110px, clip=polygon(40% 0, 100% 0, 100% 100%)
  // Points on page: (595-180+72=487px, 0), (595, 0), (595, 110)
  // In mm: (487*0.353=171.9, 0), (210, 0), (210, 38.8)
  doc.setFillColor(r, g, b);
  doc.triangle(172, 0, pageWidth, 0, pageWidth, 39, "F");

  const headerTopY = 30;
  const formattedDate = quote.date ? formatQuoteDate(quote.date) : "—";

  // ── Left header block (logo OR quote number/date) ──
  if (hasLogo && logoUrl) {
    const logoImage = await fetchImageForPdf(logoUrl);
    if (logoImage) {
      try {
        doc.addImage(logoImage.dataUrl, logoImage.format, margin, headerTopY - 2, 0, 17);
      } catch {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(90, 90, 90);
        doc.text(`N°. ${quote.quoteNumber}`, margin, headerTopY);
        doc.text(formattedDate, margin, headerTopY + 4.2);
      }
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text(`N°. ${quote.quoteNumber}`, margin, headerTopY);
      doc.text(formattedDate, margin, headerTopY + 4.2);
    }
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text(`N°. ${quote.quoteNumber}`, margin, headerTopY);
    doc.text(formattedDate, margin, headerTopY + 4.2);
  }

  // ── COTIZACIÓN title (right) ──
  // Preview: fontSize=32px≈24pt, letterSpacing=2, paddingRight=16px=5.6mm
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setCharSpace(0.7);
  doc.setTextColor(30, 30, 30);
  doc.text("COTIZACIÓN", rightEdge - 8, 30, { align: "right" });
  doc.setCharSpace(0);

  if (hasLogo) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text(`N°. ${quote.quoteNumber}`, rightEdge - 8, 37, { align: "right" });
    doc.text(formattedDate, rightEdge - 8, 41.2, { align: "right" });
  }

  // ── Gap after title row ──
  // Preview: marginBottom=24px(8.5mm) on title + marginBottom=20px(7mm) spacer = 15.5mm total
  // Title row starts at y=21, text is ~4mm tall, so title row bottom ≈ 25mm
  // After gap: 25 + 15.5 ≈ 40mm — no separator line in preview
  y = hasLogo ? 61 : 51;

  // ── Two-column info ──
  // Preview: flex, gap=24px=8.5mm → each col = (595-80)/2 = ~250px wide = 88mm
  // With margin=14: contentWidth=182, each col = (182-8.5)/2 = 86.75mm
  const colW = (contentWidth - 8.5) / 2; // ~86.75mm
  const infoStartY = y;

  let compY = infoStartY;

  // Company label (preview: fontSize=9px≈6.75pt → 7pt, marginBottom=4px=1.4mm)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("COTIZACIÓN", margin, compY);
  compY += 1.4 + 5.0; // marginBottom + label line height

  // Company name (preview: fontSize=15px≈11.25pt → 11pt, marginBottom=4px=1.4mm)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(r, g, b);
  doc.text(
    doc.splitTextToSize(quote.companyName || "Mi Empresa", colW)[0] ?? "Mi Empresa",
    margin,
    compY
  );
  compY += 1.4 + 4; // marginBottom + name line height

  // Company details (preview: fontSize=11px≈8.25pt → 8pt, marginBottom=2px=0.7mm)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  if (quote.companyOwnerName) {
    doc.text(quote.companyOwnerName, margin, compY);
    compY += 3.9; // 8pt line + 0.7mm margin
  }
  if (quote.companyRuc) {
    doc.text(`RUC : ${quote.companyRuc}`, margin, compY);
    compY += 3.9;
  }
  if (quote.companyAddress) {
    const lines = doc.splitTextToSize(quote.companyAddress, colW);
    doc.text(lines[0] ?? "", margin, compY);
    compY += 3.9;
  }

  // Client column — right-aligned (preview: textAlign="right")
  let clientY = infoStartY;

  // Client label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("CLIENTE", rightEdge, clientY, { align: "right" });
  clientY += 1.4 + 5.0;

  // Client name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(r, g, b);
  doc.text(
    doc.splitTextToSize(quote.clientName || "—", colW)[0] ?? "—",
    rightEdge,
    clientY,
    { align: "right" }
  );
  clientY += 1.4 + 4;

  // Client details
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  if (quote.clientDocType && quote.clientDocNumber) {
    doc.text(`${quote.clientDocType} : ${quote.clientDocNumber}`, rightEdge, clientY, { align: "right" });
    clientY += 3.9;
  }
  if (quote.clientPhone) {
    doc.text(`ATENCION : ${quote.clientPhone}`, rightEdge, clientY, { align: "right" });
    clientY += 3.9;
  }
  if (quote.clientEmail) {
    doc.setTextColor(r, g, b);
    doc.text(`REFERENCIA : ${quote.clientEmail}`, rightEdge, clientY, { align: "right" });
    doc.setTextColor(60, 60, 60);
    clientY += 3.9;
  }
  if (quote.clientAddress) {
    doc.text(quote.clientAddress, rightEdge, clientY, { align: "right" });
    clientY += 3.9;
  }

  // Preview: marginBottom=28px=9.9mm → 10mm
  y = Math.max(compY, clientY) + 10;

  // ── Items table ──
  const simple = shouldShowSimpleTable(quote.items);

  const colDesc = margin;
  const colCant = margin + contentWidth * 0.6;
  const colPrice = margin + contentWidth * 0.78;
  const colRight = rightEdge;
  const colRightInset = 3.2;

  // Preview: table header 8px top + 8px bottom padding + 12px text ≈ 28px = 9.9mm → 10mm
  const headerH = 7;
  checkPage(headerH + 6);

  doc.setFillColor(r, g, b);
  doc.roundedRect(margin, y, contentWidth, headerH, 1, 1, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("Descripción", colDesc + 4, y + 4.8);
  if (!simple) {
    doc.text("Cant.", colCant, y + 4.8, { align: "center" });
    doc.text("P. Unit.", colPrice, y + 4.8, { align: "right" });
  }
  doc.text(simple ? "Precio" : "Subtotal", colRight - colRightInset, y + 4.8, { align: "right" });

  y += headerH;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  const descWidth = simple ? contentWidth - 32 : colCant - colDesc - 6;

  for (const item of quote.items) {
    const qty = Number(item.quantity);
    const price = Number(item.unitPrice);
    const rowSubtotal = qty * price;
    const descLines = doc.splitTextToSize(item.description || "—", descWidth);
    // Preview: padding 8px=2.8mm top + 8px bottom + text → min row ≈ 9.5mm
    const rowH = Math.max(7, descLines.length * 4 + 5.6);

    checkPage(rowH + 2);

    doc.setTextColor(60, 60, 60);
    doc.text(descLines, colDesc + 4, y + rowH / 2 + 1.5);

    if (!simple) {
      doc.text(String(qty), colCant, y + rowH / 2 + 1.5, { align: "center" });
      doc.text(formatCurrency(price), colPrice, y + rowH / 2 + 1.5, { align: "right" });
    }
    doc.text(formatCurrency(simple ? price : rowSubtotal), colRight - colRightInset, y + rowH / 2 + 1.5, {
      align: "right",
    });

    y += rowH;

    // Row separator: preview borderBottom 1px #e5e5e5
    doc.setDrawColor(229, 229, 229);
    doc.setLineWidth(0.2);
    doc.line(margin, y, rightEdge, y);
  }

  // Preview: table marginBottom=20px=7mm
  y += 7;

  // ── Totals ──
  // Preview: minWidth=220px=77.7mm → 78mm, padding=12px/20px=4.2mm/7mm
  const { subtotal, igv, total } = calculateQuoteTotals(quote.items);
  const totalsBoxW = 78;
  const totalsBoxX = rightEdge - totalsBoxW;
  const totalsBoxH = 21;

  checkPage(totalsBoxH + 4);

  doc.setFillColor(243, 243, 243);
  doc.roundedRect(totalsBoxX, y, totalsBoxW, totalsBoxH, 1, 1, "F");

  // Preview row spacing: subtotal marginBottom=6px=2.1mm, IGV marginBottom=8px=2.8mm
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  doc.text("Subtotal", totalsBoxX + 7, y + 5);
  doc.text(formatCurrency(subtotal), rightEdge - 2, y + 5, { align: "right" });

  doc.text("IGV", totalsBoxX + 7, y + 11);
  doc.text(formatCurrency(igv), rightEdge - 2, y + 11, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  doc.text("TOTAL", totalsBoxX + 7, y + 18);
  doc.text(formatCurrency(total), rightEdge - 2, y + 18, { align: "right" });

  // Preview: totals marginBottom=28px=9.9mm → 10mm
  y += totalsBoxH + 10;

  // ── Payment method ──
  if (quote.paymentMethod) {
    checkPage(14);
    // Preview: "Metodo de Pago" fontSize=11px=8.25pt, fontWeight=700, uppercase, marginBottom=4px=1.4mm
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 30);
    doc.text("METODO DE PAGO", margin, y);
    y += 1.4 + 3.5;

    // Preview: payment text fontSize=11px, fontWeight=700
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(quote.paymentMethod, margin, y);
    y += 7;
  }

  // ── Notes ──
  if (quote.notes) {
    checkPage(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 30);
    doc.text("NOTAS", margin, y);
    y += 1.4 + 3.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const noteLines = doc.splitTextToSize(quote.notes, contentWidth);
    doc.text(noteLines, margin, y);
  }

  // ── Decorative triangle — bottom-left ──
  // Preview: width=160px=56.5mm, height=100px=35.3mm, clip=polygon(0 0, 0 100%, 100% 100%)
  // Points on page: (0, 261.7), (0, 297), (56.5, 297)
  doc.setFillColor(r, g, b);
  doc.triangle(0, pageHeight - 35, 0, pageHeight, 57, pageHeight, "F");

  doc.save(`cotizacion-${quote.quoteNumber}.pdf`);
}
