import { jsPDF } from "jspdf";
import { GST_RATE, SHOP } from "@/lib/constants";
import {
  calculateTotals,
  formatDate,
  formatNZD,
  formatOdometer,
  roundCurrency,
} from "@/lib/format";
import { vehicleName } from "@/lib/inspection";
import type { Customer, Inspection, Quote, Vehicle } from "@/lib/types";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_LIMIT = 278;

const colors = {
  ink: [15, 61, 46] as [number, number, number],
  brand: [34, 165, 89] as [number, number, number],
  brandDark: [23, 104, 65] as [number, number, number],
  brandLight: [236, 253, 243] as [number, number, number],
  line: [226, 234, 229] as [number, number, number],
  muted: [107, 128, 120] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  amber: [180, 83, 9] as [number, number, number],
  amberBg: [255, 251, 235] as [number, number, number],
  red: [185, 28, 28] as [number, number, number],
  redBg: [254, 242, 242] as [number, number, number],
  greenBg: [236, 253, 243] as [number, number, number],
  canvas: [248, 250, 249] as [number, number, number],
};

const statusMeta = {
  pass: { label: "Pass", color: colors.brandDark, bg: colors.greenBg },
  attention: { label: "Needs attention", color: colors.amber, bg: colors.amberBg },
  fail: { label: "Fail", color: colors.red, bg: colors.redBg },
};

type PDF = jsPDF;

function setFont(doc: PDF, size: number, style: "normal" | "bold" = "normal", color = colors.ink) {
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
}

function drawBrandMark(doc: PDF, x: number, y: number, size: number) {
  doc.setFillColor(...colors.brand);
  doc.circle(x + size / 2, y + size / 2, size / 2, "F");
  doc.setDrawColor(...colors.white);
  doc.setLineWidth(1.1);
  doc.line(x + size * 0.26, y + size * 0.51, x + size * 0.44, y + size * 0.7);
  doc.line(x + size * 0.44, y + size * 0.7, x + size * 0.76, y + size * 0.33);
}

function drawHeader(doc: PDF, rightTop: string, rightBottom: string) {
  doc.setFillColor(...colors.ink);
  doc.rect(0, 0, PAGE_WIDTH, 38, "F");
  drawBrandMark(doc, MARGIN, 10, 13);
  setFont(doc, 14.5, "bold", colors.white);
  doc.text(SHOP.name, MARGIN + 17, 16.5);
  setFont(doc, 7.4, "normal", [190, 220, 205] as [number, number, number]);
  doc.text(
    `${SHOP.address}, ${SHOP.city}  ·  ${SHOP.phone}  ·  ${SHOP.email}`,
    MARGIN + 17,
    22.5,
  );
  setFont(doc, 7.6, "bold", [190, 220, 205] as [number, number, number]);
  doc.text(rightTop, PAGE_WIDTH - MARGIN, 15, { align: "right" });
  setFont(doc, 8.8, "normal", colors.white);
  doc.text(rightBottom, PAGE_WIDTH - MARGIN, 21, { align: "right" });
  setFont(doc, 6.6, "normal", [190, 220, 205] as [number, number, number]);
  doc.text("NZ-owned · WOF · Servicing · Repairs", PAGE_WIDTH - MARGIN, 26.5, {
    align: "right",
  });
}

function drawContinuationHeader(doc: PDF, label: string) {
  doc.setFillColor(...colors.brandLight);
  doc.rect(0, 0, PAGE_WIDTH, 18, "F");
  drawBrandMark(doc, MARGIN, 4.5, 9);
  setFont(doc, 9, "bold", colors.ink);
  doc.text(SHOP.name, MARGIN + 12, 10.5);
  setFont(doc, 8, "normal", colors.muted);
  doc.text(label, PAGE_WIDTH - MARGIN, 10.5, { align: "right" });
  doc.setDrawColor(...colors.line);
  doc.setLineWidth(0.3);
  doc.line(0, 18, PAGE_WIDTH, 18);
}

function addFooters(doc: PDF, label: string, disclaimer: string) {
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...colors.line);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, 287, PAGE_WIDTH - MARGIN, 287);
    setFont(doc, 6.8, "normal", colors.muted);
    doc.text(`${SHOP.name} · ${label}`, MARGIN, 291.5);
    doc.text(disclaimer, PAGE_WIDTH / 2, 291.5, {
      align: "center",
    });
    doc.text(`Page ${page} of ${total}`, PAGE_WIDTH - MARGIN, 291.5, { align: "right" });
  }
}

function drawInfoCard(
  doc: PDF,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
) {
  doc.setFillColor(...colors.canvas);
  doc.setDrawColor(...colors.line);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, height, 2.5, 2.5, "FD");
  setFont(doc, 6.6, "bold", colors.brandDark);
  doc.text(title.toUpperCase(), x + 5, y + 6.5, { charSpace: 0.5 });
}

function drawStatusPill(doc: PDF, label: string, x: number, y: number, color: [number, number, number], bg: [number, number, number]) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  const width = doc.getTextWidth(label) + 7;
  doc.setFillColor(...bg);
  doc.roundedRect(x - width, y, width, 6.4, 3, 3, "F");
  doc.setTextColor(...color);
  doc.text(label, x - width / 2, y + 4.2, { align: "center" });
}

async function prepareImage(dataUrl: string): Promise<string | null> {
  if (!dataUrl) return null;
  if (!dataUrl.startsWith("data:image/svg")) return dataUrl;

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 900;
        canvas.height = Math.round((900 / image.width) * image.height);
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(null);
          return;
        }
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = dataUrl;
  });
}

function imageFormat(dataUrl: string): "PNG" | "JPEG" | null {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  if (dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg")) return "JPEG";
  return null;
}

function safeAddImage(
  doc: PDF,
  dataUrl: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const format = imageFormat(dataUrl);
  if (!format) return false;
  try {
    doc.addImage(dataUrl, format, x, y, width, height);
    return true;
  } catch {
    return false;
  }
}

interface ReportArgs {
  inspection: Inspection;
  customer: Customer;
  vehicle: Vehicle;
}

export async function downloadReportPdf({ inspection, customer, vehicle }: ReportArgs) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const counts = inspection.results.reduce(
    (totals, result) => {
      totals[result.status] += 1;
      return totals;
    },
    { pass: 0, attention: 0, fail: 0 },
  );

  const signatureImage = await prepareImage(inspection.signature ?? "");
  drawHeader(doc, "INSPECTION REPORT", `${inspection.reportNumber}  ·  ${formatDate(inspection.date)}`);

  let y = 49;
  setFont(doc, 19, "bold", colors.ink);
  doc.text("Vehicle inspection report", MARGIN, y);
  y += 7;
  setFont(doc, 8.5, "normal", colors.muted);
  doc.text(`Prepared for ${customer.name}  ·  ${inspection.templateName}`, MARGIN, y);

  setFont(doc, 7.4, "bold", inspection.status === "completed" ? colors.brandDark : colors.amber);
  const statusLabel = inspection.status === "completed" ? "COMPLETED" : "AWAITING SIGNATURE";
  const statusWidth = doc.getTextWidth(statusLabel) + 9;
  doc.setFillColor(
    ...(inspection.status === "completed" ? colors.greenBg : colors.amberBg),
  );
  doc.roundedRect(PAGE_WIDTH - MARGIN - statusWidth, 42, statusWidth, 7, 3.5, 3.5, "F");
  doc.text(statusLabel, PAGE_WIDTH - MARGIN - statusWidth / 2, 46.7, { align: "center" });
  y = 61;

  const cardWidth = (CONTENT_WIDTH - 6) / 2;
  drawInfoCard(doc, MARGIN, y, cardWidth, 38, "Vehicle");
  setFont(doc, 10.4, "bold", colors.ink);
  doc.text(vehicleName(vehicle), MARGIN + 5, y + 13.5);
  setFont(doc, 7.4, "normal", colors.muted);
  doc.text(`${vehicle.plate}  ·  ${vehicle.colour}`, MARGIN + 5, y + 19);
  doc.text(`Odometer  ${formatOdometer(inspection.odometer)}`, MARGIN + 5, y + 24);
  doc.text(`VIN  ${vehicle.vin}`, MARGIN + 5, y + 29);
  doc.text(`WOF expires  ${formatDate(vehicle.wofExpiry)}`, MARGIN + 5, y + 34);

  const rightX = MARGIN + cardWidth + 6;
  drawInfoCard(doc, rightX, y, cardWidth, 38, "Customer");
  setFont(doc, 10.4, "bold", colors.ink);
  doc.text(customer.name, rightX + 5, y + 13.5);
  setFont(doc, 7.4, "normal", colors.muted);
  doc.text(customer.phone, rightX + 5, y + 19);
  doc.text(customer.email, rightX + 5, y + 24);
  const addressLines = doc.splitTextToSize(customer.address, cardWidth - 10) as string[];
  doc.text(addressLines, rightX + 5, y + 29);

  y += 44;
  const meta = [
    ["TECHNICIAN", inspection.technician],
    ["INSPECTION DATE", formatDate(inspection.date)],
    ["TEMPLATE", inspection.templateName],
    ["REPORT", inspection.reportNumber],
  ];
  const metaWidth = CONTENT_WIDTH / meta.length;
  doc.setFillColor(...colors.brandLight);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 15, 2.5, 2.5, "F");
  meta.forEach(([label, value], index) => {
    const x = MARGIN + 5 + index * metaWidth;
    setFont(doc, 5.9, "bold", colors.brandDark);
    doc.text(label, x, y + 5.8);
    setFont(doc, 7.2, "normal", colors.ink);
    const wrapped = doc.splitTextToSize(value, metaWidth - 7) as string[];
    doc.text(wrapped[0] ?? "", x, y + 10.8);
  });

  y += 21;
  const summaryItems = [
    { label: "Passed", value: counts.pass, color: statusMeta.pass.color, bg: statusMeta.pass.bg },
    {
      label: "Needs attention",
      value: counts.attention,
      color: statusMeta.attention.color,
      bg: statusMeta.attention.bg,
    },
    { label: "Failed", value: counts.fail, color: statusMeta.fail.color, bg: statusMeta.fail.bg },
  ];
  const summaryWidth = (CONTENT_WIDTH - 8) / 3;
  summaryItems.forEach((item, index) => {
    const x = MARGIN + index * (summaryWidth + 4);
    doc.setFillColor(...item.bg);
    doc.roundedRect(x, y, summaryWidth, 16, 2.5, 2.5, "F");
    setFont(doc, 13, "bold", item.color);
    doc.text(String(item.value), x + 5, y + 9);
    setFont(doc, 6.8, "bold", item.color);
    doc.text(item.label.toUpperCase(), x + 5, y + 13.2);
  });

  y += 24;

  const startNewPage = (label: string) => {
    doc.addPage();
    drawContinuationHeader(doc, label);
    return 27;
  };

  const ensureSpace = (height: number) => {
    if (y + height > BOTTOM_LIMIT) {
      y = startNewPage(`${inspection.reportNumber}  ·  Continued`);
    }
  };

  for (const section of inspection.templateSections) {
    ensureSpace(19);
    doc.setFillColor(...colors.brandLight);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 9, 2, 2, "F");
    setFont(doc, 7.6, "bold", colors.brandDark);
    doc.text(section.title.toUpperCase(), MARGIN + 4, y + 6);
    y += 13;

    for (const item of section.items) {
      const result = inspection.results.find((entry) => entry.itemId === item.id);
      if (!result) continue;
      const metaForStatus = statusMeta[result.status];
      const labelLines = doc.splitTextToSize(item.label, 132) as string[];
      const noteLines = result.notes
        ? (doc.splitTextToSize(result.notes, 150) as string[])
        : [];
      const hasMeasurement = !!result.measurement;
      const photoCount = result.photos.length;
      const photoRows = photoCount ? Math.ceil(photoCount / 4) : 0;
      const height =
        labelLines.length * 4.2 +
        (hasMeasurement ? 4 : 0) +
        (noteLines.length ? noteLines.length * 3.6 + 1.5 : 0) +
        photoRows * 25 +
        (photoRows ? 2 : 0) +
        5.5;

      ensureSpace(height + 3.5);
      if (result.status !== "pass") {
        doc.setFillColor(...metaForStatus.bg);
        doc.roundedRect(MARGIN, y - 2.5, CONTENT_WIDTH, height, 1.8, 1.8, "F");
      }

      let itemY = y + 2.4;
      setFont(doc, 8.8, "bold", colors.ink);
      doc.text(labelLines, MARGIN + 3, itemY + 1.3);
      drawStatusPill(
        doc,
        metaForStatus.label,
        PAGE_WIDTH - MARGIN - 3,
        itemY - 0.8,
        metaForStatus.color,
        result.status === "pass" ? colors.greenBg : colors.white,
      );
      itemY += labelLines.length * 4.2;

      if (hasMeasurement) {
        setFont(doc, 7.2, "normal", colors.muted);
        doc.text(
          `Measured: ${result.measurement}${item.unit ? ` ${item.unit}` : ""}`,
          MARGIN + 3,
          itemY,
        );
        itemY += 4;
      }

      if (noteLines.length) {
        setFont(doc, 7.2, "normal", colors.muted);
        doc.text(noteLines, MARGIN + 3, itemY);
        itemY += noteLines.length * 3.6 + 1.5;
      }

      if (photoCount) {
        const photoWidth = 39;
        const photoHeight = 22;
        result.photos.slice(0, 8).forEach((photo, index) => {
          const col = index % 4;
          const row = Math.floor(index / 4);
          const x = MARGIN + 3 + col * (photoWidth + 2);
          const photoY = itemY + row * 25;
          doc.setFillColor(...colors.canvas);
          doc.roundedRect(x, photoY, photoWidth, photoHeight, 1.5, 1.5, "F");
          safeAddImage(doc, photo, x, photoY, photoWidth, photoHeight);
          doc.setDrawColor(...colors.line);
          doc.setLineWidth(0.2);
          doc.roundedRect(x, photoY, photoWidth, photoHeight, 1.5, 1.5, "S");
        });
        itemY += photoRows * 25;
      }

      y += height + 3.2;
      doc.setDrawColor(...colors.line);
      doc.setLineWidth(0.25);
      doc.line(MARGIN, y - 1.2, PAGE_WIDTH - MARGIN, y - 1.2);
    }
    y += 2;
  }

  ensureSpace(53);
  setFont(doc, 9.5, "bold", colors.ink);
  doc.text("Customer sign-off", MARGIN, y + 4);
  y += 8;
  doc.setFillColor(...colors.canvas);
  doc.setDrawColor(...colors.line);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 38, 2.5, 2.5, "FD");

  if (signatureImage) {
    safeAddImage(doc, signatureImage, MARGIN + 5, y + 4, 74, 20);
    doc.setDrawColor(...colors.line);
    doc.line(MARGIN + 5, y + 27, MARGIN + 82, y + 27);
    setFont(doc, 6.8, "normal", colors.muted);
    doc.text("Customer signature", MARGIN + 5, y + 31);
  } else {
    setFont(doc, 8, "normal", colors.amber);
    doc.text("Signature pending — customer has not signed this report.", MARGIN + 5, y + 11);
    doc.setDrawColor(...colors.line);
    doc.line(MARGIN + 5, y + 27, MARGIN + 82, y + 27);
    setFont(doc, 6.8, "normal", colors.muted);
    doc.text("Customer signature", MARGIN + 5, y + 31);
  }

  setFont(doc, 7.2, "normal", colors.muted);
  doc.text("Signed", MARGIN + 90, y + 9);
  setFont(doc, 8, "bold", colors.ink);
  doc.text(inspection.signedAt ? formatDate(inspection.signedAt) : "Pending", MARGIN + 90, y + 14);
  setFont(doc, 7.2, "normal", colors.muted);
  doc.text("Technician", MARGIN + 90, y + 22);
  setFont(doc, 8, "bold", colors.ink);
  doc.text(inspection.technician, MARGIN + 90, y + 27);
  setFont(doc, 6.8, "normal", colors.muted);
  doc.text(
    "This report records the condition of the vehicle at the time of inspection.",
    PAGE_WIDTH - MARGIN - 5,
    y + 31,
    { align: "right" },
  );

  addFooters(doc, "Inspection report", "Demo document by WebMint · sample report only");
  const filename = `${inspection.reportNumber}-${customer.name.replace(/\s+/g, "-")}.pdf`;
  doc.save(filename);
}

interface InvoiceArgs {
  quote: Quote;
  inspection?: Inspection;
  customer: Customer;
  vehicle: Vehicle;
}

export async function downloadQuoteOrInvoicePdf({ quote, customer, vehicle }: InvoiceArgs) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const totals = calculateTotals(quote.items);
  const isInvoice = !!quote.invoiceNumber;
  const documentNumber = quote.invoiceNumber ?? quote.quoteNumber;
  const documentLabel = isInvoice ? "TAX INVOICE" : "QUOTE";
  const issueDate = isInvoice ? (quote.invoicedAt ?? quote.createdAt) : quote.createdAt;

  drawHeader(doc, documentLabel, `${documentNumber}  ·  ${formatDate(issueDate)}`);

  let y = 49;
  setFont(doc, 19, "bold", colors.ink);
  doc.text(isInvoice ? "Tax invoice" : "Quote", MARGIN, y);
  y += 7;
  setFont(doc, 8.3, "normal", colors.muted);
  doc.text(
    isInvoice
      ? "All amounts are in New Zealand dollars and include GST where shown."
      : "Prepared from workshop inspection findings. All amounts are in NZD.",
    MARGIN,
    y,
  );

  const paidLabel = isInvoice ? (quote.paid ? "PAID" : "PAYMENT DUE") : "AWAITING APPROVAL";
  setFont(doc, 7.3, "bold", isInvoice && quote.paid ? colors.brandDark : colors.amber);
  const labelWidth = doc.getTextWidth(paidLabel) + 10;
  doc.setFillColor(...(isInvoice && quote.paid ? colors.greenBg : colors.amberBg));
  doc.roundedRect(PAGE_WIDTH - MARGIN - labelWidth, 42, labelWidth, 7, 3.5, 3.5, "F");
  doc.text(paidLabel, PAGE_WIDTH - MARGIN - labelWidth / 2, 46.7, { align: "center" });

  y = 63;
  const cardWidth = (CONTENT_WIDTH - 6) / 2;
  drawInfoCard(doc, MARGIN, y, cardWidth, 35, "Bill to");
  setFont(doc, 10.3, "bold", colors.ink);
  doc.text(customer.name, MARGIN + 5, y + 13.5);
  setFont(doc, 7.4, "normal", colors.muted);
  doc.text(customer.phone, MARGIN + 5, y + 19);
  doc.text(customer.email, MARGIN + 5, y + 24);
  doc.text(doc.splitTextToSize(customer.address, cardWidth - 10) as string[], MARGIN + 5, y + 29);

  const rightX = MARGIN + cardWidth + 6;
  drawInfoCard(doc, rightX, y, cardWidth, 35, "Vehicle");
  setFont(doc, 10.3, "bold", colors.ink);
  doc.text(vehicleName(vehicle), rightX + 5, y + 13.5);
  setFont(doc, 7.4, "normal", colors.muted);
  doc.text(`${vehicle.plate}  ·  ${vehicle.colour}`, rightX + 5, y + 19);
  doc.text(`Odometer  ${formatOdometer(vehicle.odometer)}`, rightX + 5, y + 24);
  doc.text(`VIN  ${vehicle.vin}`, rightX + 5, y + 29);

  y += 41;
  doc.setFillColor(...colors.brandLight);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 14, 2.5, 2.5, "F");
  const meta = [
    ["DOCUMENT", documentNumber],
    ["ISSUED", formatDate(issueDate)],
    [isInvoice ? "DUE" : "INSPECTION", isInvoice ? formatDate(quote.dueAt) : "Findings quote"],
    ["GST", "15%"],
  ];
  const metaWidth = CONTENT_WIDTH / meta.length;
  meta.forEach(([label, value], index) => {
    const x = MARGIN + 5 + index * metaWidth;
    setFont(doc, 5.9, "bold", colors.brandDark);
    doc.text(label, x, y + 5.6);
    setFont(doc, 7.2, "normal", colors.ink);
    doc.text(value, x, y + 10.3);
  });

  y += 22;
  const colX = [MARGIN + 4, MARGIN + 115, MARGIN + 135, PAGE_WIDTH - MARGIN - 4];
  const drawTableHeader = (top: number) => {
    doc.setFillColor(...colors.ink);
    doc.roundedRect(MARGIN, top, CONTENT_WIDTH, 9, 1.5, 1.5, "F");
    setFont(doc, 6.5, "bold", colors.white);
    doc.text("DESCRIPTION", colX[0], top + 5.9);
    doc.text("QTY", colX[1], top + 5.9, { align: "right" });
    doc.text("UNIT PRICE", colX[2], top + 5.9, { align: "right" });
    doc.text("AMOUNT", colX[3], top + 5.9, { align: "right" });
  };

  let tableY = y;
  drawTableHeader(tableY);
  tableY += 9;

  quote.items.forEach((line, index) => {
    const descriptionLines = doc.splitTextToSize(line.description, 100) as string[];
    const rowHeight = Math.max(13, descriptionLines.length * 3.8 + 8);
    if (tableY + rowHeight > BOTTOM_LIMIT - 44) {
      doc.addPage();
      drawContinuationHeader(doc, `${documentLabel} ${documentNumber}  ·  Continued`);
      tableY = 27;
      drawTableHeader(tableY);
      tableY += 9;
    }
    if (index % 2 === 1) {
      doc.setFillColor(...colors.canvas);
      doc.rect(MARGIN, tableY, CONTENT_WIDTH, rowHeight, "F");
    }
    setFont(doc, 7.8, "normal", colors.ink);
    doc.text(descriptionLines, colX[0], tableY + 6);
    setFont(doc, 7.8, "normal", colors.ink);
    doc.text(String(line.qty), colX[1], tableY + 6, { align: "right" });
    doc.text(formatNZD(line.unitPrice), colX[2], tableY + 6, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(formatNZD(roundCurrency(line.qty * line.unitPrice)), colX[3], tableY + 6, {
      align: "right",
    });
    doc.setDrawColor(...colors.line);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, tableY + rowHeight, PAGE_WIDTH - MARGIN, tableY + rowHeight);
    tableY += rowHeight;
  });

  tableY += 7;
  if (tableY + 45 > BOTTOM_LIMIT) {
    doc.addPage();
    drawContinuationHeader(doc, `${documentLabel} ${documentNumber}  ·  Totals`);
    tableY = 30;
  }

  const totalsX = PAGE_WIDTH - MARGIN - 74;
  setFont(doc, 7.8, "normal", colors.muted);
  doc.text("Subtotal", totalsX, tableY + 4);
  doc.text(formatNZD(totals.subtotal), PAGE_WIDTH - MARGIN - 4, tableY + 4, { align: "right" });
  doc.text(`GST (${GST_RATE * 100}%)`, totalsX, tableY + 10);
  doc.text(formatNZD(totals.gst), PAGE_WIDTH - MARGIN - 4, tableY + 10, { align: "right" });
  doc.setDrawColor(...colors.line);
  doc.line(totalsX, tableY + 14, PAGE_WIDTH - MARGIN - 4, tableY + 14);
  setFont(doc, 8, "bold", colors.ink);
  doc.text("TOTAL (NZD)", totalsX, tableY + 20);
  setFont(doc, 13, "bold", colors.brandDark);
  doc.text(formatNZD(totals.total), PAGE_WIDTH - MARGIN - 4, tableY + 20, { align: "right" });

  const notesY = tableY + 36;
  doc.setFillColor(...colors.brandLight);
  doc.roundedRect(MARGIN, notesY, 90, 28, 2, 2, "F");
  setFont(doc, 6.5, "bold", colors.brandDark);
  doc.text(isInvoice ? "PAYMENT DETAILS" : "NEXT STEPS", MARGIN + 5, notesY + 6.5);
  setFont(doc, 7, "normal", colors.ink);
  const noteLines = isInvoice
    ? [
        "Payment due within 7 days.",
        "Bank transfer: 12-3456-7890123-00",
        `Reference: ${quote.invoiceNumber}`,
      ]
    : [
        "Approve this quote and we'll book",
        "your vehicle in at a time that suits.",
        "Prices valid for 30 days.",
      ];
  doc.text(noteLines, MARGIN + 5, notesY + 12);

  addFooters(
    doc,
    isInvoice ? "Tax invoice" : "Quote",
    isInvoice ? "Demo document by WebMint · not a real tax invoice" : "Demo document by WebMint · sample quote only",
  );
  const filename = `${documentNumber}-${customer.name.replace(/\s+/g, "-")}.pdf`;
  doc.save(filename);
}
