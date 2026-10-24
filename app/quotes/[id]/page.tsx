"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Mail,
  Plus,
  ReceiptText,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import {
  calculateTotals,
  formatDate,
  formatNZD,
  formatOdometer,
  roundCurrency,
  todayISO,
} from "@/lib/format";
import { vehicleName } from "@/lib/inspection";
import type { QuoteLine } from "@/lib/types";

interface EditableLine {
  id: string;
  description: string;
  qty: string;
  unitPrice: string;
}

function toEditable(items: QuoteLine[]): EditableLine[] {
  return items.map((item) => ({
    id: item.id,
    description: item.description,
    qty: String(item.qty),
    unitPrice: String(item.unitPrice),
  }));
}

function makeLineId() {
  const value =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `line-${value}`;
}

export default function QuotePage() {
  const params = useParams<{ id: string }>();
  const { data, actions } = useStore();
  const { showToast } = useToast();
  const quoteId = typeof params.id === "string" ? params.id : "";
  const quote = data.quotes.find((entry) => entry.id === quoteId);
  const customer = quote ? data.customers.find((entry) => entry.id === quote.customerId) : undefined;
  const vehicle = quote ? data.vehicles.find((entry) => entry.id === quote.vehicleId) : undefined;
  const inspection = quote
    ? data.inspections.find((entry) => entry.id === quote.inspectionId)
    : undefined;

  const [lines, setLines] = useState<EditableLine[]>(() =>
    quote ? toEditable(quote.items) : [],
  );
  const [downloading, setDownloading] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (!quote) return;
    setLines(toEditable(quote.items));
    // Reset the editable rows when navigating to another document.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote?.id]);

  const isInvoice = !!quote?.invoiceNumber;
  const isPaid = !!quote?.paid;
  const isOverdue = !!quote?.dueAt && !isPaid && quote.dueAt < todayISO();
  const documentNumber = quote?.invoiceNumber ?? quote?.quoteNumber ?? "";
  const issueDate = quote?.invoiceNumber ? quote.invoicedAt : quote?.createdAt;
  const statusBadge = isInvoice ? (
    isPaid ? (
      <Badge tone="green" dot>
        Paid
      </Badge>
    ) : isOverdue ? (
      <Badge tone="red" dot>
        Overdue
      </Badge>
    ) : (
      <Badge tone="amber" dot>
        Payment due
      </Badge>
    )
  ) : (
    <Badge tone="gray" dot>
      Awaiting approval
    </Badge>
  );

  const numericLines = useMemo(
    () =>
      lines.map((line) => ({
        id: line.id,
        description: line.description.trim(),
        qty: Number(line.qty) || 0,
        unitPrice: Number(line.unitPrice) || 0,
      })),
    [lines],
  );
  const totals = calculateTotals(numericLines);
  const invalid = numericLines.some(
    (line) => !line.description || line.qty <= 0 || line.unitPrice < 0,
  );
  const dirty =
    !isInvoice &&
    !!quote &&
    JSON.stringify(numericLines) !==
      JSON.stringify(
        toEditable(quote.items).map((line) => ({
          id: line.id,
          description: line.description,
          qty: Number(line.qty),
          unitPrice: Number(line.unitPrice),
        })),
      );

  function updateLine(id: string, update: Partial<EditableLine>) {
    setLines((current) =>
      current.map((line) => (line.id === id ? { ...line, ...update } : line)),
    );
  }

  function addLine() {
    setLines((current) => [
      ...current,
      {
        id: makeLineId(),
        description: "New line item",
        qty: "1",
        unitPrice: "0",
      },
    ]);
  }

  function removeLine(id: string) {
    setLines((current) => current.filter((line) => line.id !== id));
  }

  function commitLines(showMessage = true): boolean {
    if (!quote) return false;
    if (numericLines.length === 0) {
      showToast("Add at least one line item before continuing.", "error");
      return false;
    }
    if (invalid) {
      showToast("Each line needs a description, a quantity over zero and a valid price.", "error");
      return false;
    }
    actions.updateQuoteLines(quote.id, numericLines);
    setLines(numericLines.map((line) => ({ ...line, qty: String(line.qty), unitPrice: String(line.unitPrice) })));
    if (showMessage) showToast(isInvoice ? "Invoice updated." : "Quote updated.");
    return true;
  }

  async function handleDownload() {
    if (!quote || !customer || !vehicle) return;
    if (!isInvoice && !commitLines(false)) return;
    setDownloading(true);
    try {
      const currentQuote = { ...quote, items: numericLines };
      const { downloadQuoteOrInvoicePdf } = await import("@/lib/pdf");
      await downloadQuoteOrInvoicePdf({
        quote: currentQuote,
        inspection,
        customer,
        vehicle,
      });
      showToast(`${isInvoice ? "Invoice" : "Quote"} PDF downloaded.`);
    } catch {
      showToast("The PDF could not be generated. Please try again.", "error");
    } finally {
      setDownloading(false);
    }
  }

  function handleConvert() {
    if (!quote || isInvoice) return;
    if (!commitLines(false)) return;
    setConverting(true);
    const invoice = actions.convertQuoteToInvoice(quote.id);
    setConverting(false);
    if (!invoice) {
      showToast("The invoice could not be created. Please try again.", "error");
      return;
    }
    showToast(`Invoice ${invoice.invoiceNumber} created from ${quote.quoteNumber}.`);
  }

  function handleEmail() {
    if (!quote || !customer) return;
    showToast(
      `${quote.invoiceNumber ?? quote.quoteNumber} emailed to ${customer.email} (demo only — no email was sent).`,
    );
  }

  function togglePaid() {
    if (!quote || !isInvoice) return;
    actions.setInvoicePaid(quote.id, !quote.paid);
    showToast(quote.paid ? "Invoice marked as unpaid." : "Invoice marked as paid.");
  }

  if (!quote || !customer || !vehicle) {
    return (
      <div className="animate-fade-up">
        <PageHeader title="Document not found" backHref="/history" backLabel="Jobs" />
        <EmptyState
          icon={FileText}
          title="We couldn't find that document"
          description="It may have been removed when the demo data was reset."
          action={<ButtonLink href="/history">Back to jobs</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          backHref={`/inspections/${quote.inspectionId}`}
          backLabel="Inspection report"
          eyebrow={documentNumber}
          title={isInvoice ? "Tax invoice" : "Quote"}
          description={`${customer.name} · ${vehicleName(vehicle)} · ${vehicle.plate}`}
          action={<div className="hidden sm:block">{statusBadge}</div>}
        />

        <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <header className="relative overflow-hidden bg-ink px-5 py-5 text-white sm:px-7 sm:py-6">
            <div
              className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-brand/20 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="grid size-9 place-items-center rounded-[11px] bg-brand text-white">
                  <CheckCircle2 className="size-5" strokeWidth={2.8} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold tracking-tight">Demo Auto Workshop</p>
                  <p className="mt-0.5 text-[10px] text-white/50">
                    12 Kauri Street, Penrose, Auckland 1061
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/50">
                    09 555 0184 · service@demoautoworkshop.example
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brand-200">
                  {isInvoice ? "Tax invoice" : "Quote"}
                </p>
                <p className="mt-1 text-sm font-bold">{documentNumber}</p>
                <p className="mt-0.5 text-[10px] text-white/50">
                  {isInvoice ? "Issued" : "Prepared"} {formatDate(issueDate)}
                </p>
              </div>
            </div>
          </header>

          <div className="px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-[-0.02em] text-ink">
                  {isInvoice ? "Tax invoice" : "Quote"}
                </h2>
                <p className="mt-1 text-[11px] text-ink-muted">
                  {isInvoice
                    ? "All amounts are in New Zealand dollars and include GST."
                    : "Prepared from your vehicle inspection findings. All amounts are in NZD."}
                </p>
              </div>
              <div className="sm:hidden">{statusBadge}</div>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-canvas/60 p-3.5">
                <p className="label-caps">Bill to</p>
                <p className="mt-1.5 text-sm font-bold text-ink">{customer.name}</p>
                <p className="mt-0.5 text-[11px] text-ink-muted">{customer.phone}</p>
                <p className="mt-0.5 truncate text-[11px] text-ink-muted">{customer.email}</p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-ink-muted">
                  {customer.address}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-canvas/60 p-3.5">
                <p className="label-caps">Vehicle</p>
                <p className="mt-1.5 text-sm font-bold text-ink">{vehicleName(vehicle)}</p>
                <p className="mt-0.5 text-[11px] text-ink-muted">
                  {vehicle.plate} · {vehicle.colour}
                </p>
                <p className="mt-1.5 text-[10px] text-ink-muted">
                  Odometer {formatOdometer(vehicle.odometer)}
                </p>
                <p className="mt-0.5 truncate font-mono text-[9px] text-ink-muted">{vehicle.vin}</p>
              </div>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-xl bg-brand-50/60 px-3.5 py-3 text-[10px] sm:grid-cols-4">
              <div>
                <p className="label-caps">Document</p>
                <p className="mt-1 text-xs font-semibold text-ink">{documentNumber}</p>
              </div>
              <div>
                <p className="label-caps">{isInvoice ? "Issued" : "Prepared"}</p>
                <p className="mt-1 text-xs font-semibold text-ink">{formatDate(issueDate)}</p>
              </div>
              <div>
                <p className="label-caps">{isInvoice ? "Due" : "Validity"}</p>
                <p className="mt-1 text-xs font-semibold text-ink">
                  {isInvoice ? formatDate(quote.dueAt) : "30 days"}
                </p>
              </div>
              <div>
                <p className="label-caps">GST</p>
                <p className="mt-1 text-xs font-semibold text-ink">15%</p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-ink">Line items</h3>
                  <p className="mt-0.5 text-[10px] text-ink-muted">
                    {isInvoice
                      ? "Final charges for this job."
                      : "Edit the description, quantity or unit price."}
                  </p>
                </div>
                <p className="text-[10px] text-ink-muted">
                  {numericLines.length} {numericLines.length === 1 ? "item" : "items"}
                </p>
              </div>

              {isInvoice ? (
                <div className="mt-2.5 overflow-hidden rounded-xl border border-line">
                  <div className="hidden grid-cols-[1fr_52px_92px_92px] bg-canvas px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-ink-muted sm:grid">
                    <span>Description</span>
                    <span className="text-right">Qty</span>
                    <span className="text-right">Unit price</span>
                    <span className="text-right">Amount</span>
                  </div>
                  {quote.items.map((line, index) => (
                    <div
                      key={line.id}
                      className={`px-3.5 py-3 text-xs sm:grid sm:grid-cols-[1fr_52px_92px_92px] sm:items-center sm:gap-2 ${
                        index > 0 ? "border-t border-line" : ""
                      }`}
                    >
                      <p className="font-medium leading-relaxed text-ink">{line.description}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-ink-muted sm:mt-0 sm:block sm:text-right">
                        <span className="sm:hidden">Qty {line.qty}</span>
                        <span className="hidden sm:inline">{line.qty}</span>
                        <span className="sm:hidden">{formatNZD(line.unitPrice)} each</span>
                        <span className="hidden sm:inline">{formatNZD(line.unitPrice)}</span>
                        <span className="font-bold text-ink sm:hidden">
                          {formatNZD(roundCurrency(line.qty * line.unitPrice))}
                        </span>
                      </div>
                      <span className="hidden text-right font-bold text-ink sm:block">
                        {formatNZD(roundCurrency(line.qty * line.unitPrice))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2.5 space-y-2">
                  {lines.map((line) => {
                    const amount =
                      (Number(line.qty) || 0) * (Number(line.unitPrice) || 0);
                    return (
                      <div key={line.id} className="rounded-xl border border-line bg-white p-3">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <label
                              htmlFor={`line-description-${line.id}`}
                              className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink-muted"
                            >
                              Description
                            </label>
                            <input
                              id={`line-description-${line.id}`}
                              value={line.description}
                              onChange={(event) =>
                                updateLine(line.id, { description: event.target.value })
                              }
                              className="mt-1 h-10 w-full rounded-lg border border-line bg-white px-3 text-base font-medium text-ink outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-50 sm:text-xs"
                              placeholder="What work is needed?"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(line.id)}
                            disabled={lines.length === 1}
                            aria-label="Remove line item"
                            className="mt-4 grid size-9 shrink-0 place-items-center rounded-lg border border-transparent text-ink-muted transition hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-30"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap items-end gap-2">
                          <div className="w-[72px]">
                            <label
                              htmlFor={`line-qty-${line.id}`}
                              className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink-muted"
                            >
                              Qty
                            </label>
                            <input
                              id={`line-qty-${line.id}`}
                              type="number"
                              min="1"
                              step="1"
                              inputMode="numeric"
                              value={line.qty}
                              onChange={(event) => updateLine(line.id, { qty: event.target.value })}
                              className="mt-1 h-10 w-full rounded-lg border border-line bg-white px-2.5 text-base font-semibold tabular-nums text-ink outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-50 sm:text-xs"
                            />
                          </div>
                          <div className="w-[118px]">
                            <label
                              htmlFor={`line-price-${line.id}`}
                              className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink-muted"
                            >
                              Unit price (NZD)
                            </label>
                            <div className="relative mt-1">
                              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-muted">
                                $
                              </span>
                              <input
                                id={`line-price-${line.id}`}
                                type="number"
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                                value={line.unitPrice}
                                onChange={(event) =>
                                  updateLine(line.id, { unitPrice: event.target.value })
                                }
                                className="h-10 w-full rounded-lg border border-line bg-white pl-6 pr-2 text-base font-semibold tabular-nums text-ink outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-50 sm:text-xs"
                              />
                            </div>
                          </div>
                          <div className="ml-auto text-right">
                            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink-muted">
                              Amount
                            </p>
                            <p className="mt-2 text-xs font-bold tabular-nums text-ink">
                              {formatNZD(roundCurrency(amount))}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={addLine}
                    className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line text-xs font-semibold text-ink-muted transition hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-800"
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                    Add line item
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <div className="w-full max-w-[260px] rounded-xl bg-canvas p-3.5">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Subtotal</span>
                  <span className="font-medium tabular-nums text-ink">
                    {formatNZD(totals.subtotal)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs text-ink-muted">
                  <span>GST (15%)</span>
                  <span className="font-medium tabular-nums text-ink">{formatNZD(totals.gst)}</span>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2.5">
                  <span className="text-xs font-bold text-ink">Total (NZD)</span>
                  <span className="text-lg font-bold tabular-nums tracking-tight text-brand-800">
                    {formatNZD(totals.total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/50 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-800">
                {isInvoice ? "Payment details" : "Next steps"}
              </p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-ink-muted">
                {isInvoice
                  ? `Payment is due within 7 days. Bank transfer 12-3456-7890123-00 — reference ${quote.invoiceNumber}.`
                  : "Approve this quote and we'll book your vehicle in at a time that suits. Prices are valid for 30 days."}
              </p>
            </div>
          </div>

          <footer className="border-t border-line bg-white px-5 py-3 text-[9px] text-ink-muted sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>Demo Auto Workshop · GST 123-456-789</span>
              <span>{isInvoice ? "Tax invoice" : "Quote"} · Demo by WebMint</span>
            </div>
          </footer>
        </article>

        <section className="card mt-4 p-4 sm:p-5">
          {!isInvoice ? (
            <>
              <div className="flex items-center gap-2">
                <ReceiptText className="size-4 text-brand-700" aria-hidden="true" />
                <h2 className="text-sm font-bold text-ink">Quote actions</h2>
                {dirty && <Badge tone="amber" className="ml-auto">Unsaved changes</Badge>}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
                Review the lines, save your edits, then convert the quote into an invoice.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => commitLines()}
                  disabled={!dirty || invalid}
                  className="w-full sm:w-auto"
                >
                  <Save className="size-4" aria-hidden="true" />
                  Save changes
                </Button>
                <Button
                  onClick={handleConvert}
                  loading={converting}
                  disabled={invalid || numericLines.length === 0}
                  className="w-full sm:w-auto"
                >
                  <ArrowRight className="size-4" aria-hidden="true" />
                  Convert to invoice
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleDownload}
                  loading={downloading}
                  disabled={invalid || numericLines.length === 0}
                  className="w-full sm:w-auto"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Download quote PDF
                </Button>
              </div>
              {invalid && (
                <p className="mt-2 text-[10px] font-medium text-red-600">
                  Every line needs a description, quantity above zero and a valid unit price.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <ReceiptText className="size-4 text-brand-700" aria-hidden="true" />
                <h2 className="text-sm font-bold text-ink">Invoice actions</h2>
                <span className="ml-auto">{statusBadge}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
                Send the invoice, download the PDF, or update its payment status.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button onClick={handleDownload} loading={downloading} className="w-full sm:w-auto">
                  <Download className="size-4" aria-hidden="true" />
                  Download invoice PDF
                </Button>
                <Button variant="secondary" onClick={handleEmail} className="w-full sm:w-auto">
                  <Send className="size-4" aria-hidden="true" />
                  Send by email
                </Button>
                <Button variant="outline" onClick={togglePaid} className="w-full sm:w-auto">
                  {isPaid ? (
                    <CreditCard className="size-4" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                  )}
                  {isPaid ? "Mark as unpaid" : "Mark as paid"}
                </Button>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[10px] text-ink-muted">
                <Mail className="size-3" aria-hidden="true" />
                Email sending is simulated in this demo — no email will be sent.
              </p>
            </>
          )}
        </section>

        {inspection && (
          <p className="mt-3 text-center text-[11px] text-ink-muted">
            Based on{" "}
            <Link
              href={`/inspections/${inspection.id}`}
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              {inspection.reportNumber}
            </Link>{" "}
            · {formatDate(inspection.date)}
          </p>
        )}
      </div>
    </div>
  );
}
