"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  PenLine,
  ReceiptText,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ReportDocument } from "@/components/report-document";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/format";
import { getInspectionCounts, vehicleName } from "@/lib/inspection";

export default function InspectionReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, actions } = useStore();
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [creatingQuote, setCreatingQuote] = useState(false);

  const inspectionId = typeof params.id === "string" ? params.id : "";
  const inspection = data.inspections.find((entry) => entry.id === inspectionId);
  const customer = inspection
    ? data.customers.find((entry) => entry.id === inspection.customerId)
    : undefined;
  const vehicle = inspection
    ? data.vehicles.find((entry) => entry.id === inspection.vehicleId)
    : undefined;
  const quote = data.quotes.find((entry) => entry.inspectionId === inspectionId);
  const counts = inspection ? getInspectionCounts(inspection) : { pass: 0, attention: 0, fail: 0 };
  const findings = counts.attention + counts.fail;

  async function handleDownload() {
    if (!inspection || !customer || !vehicle) return;
    setDownloading(true);
    try {
      const { downloadReportPdf } = await import("@/lib/pdf");
      await downloadReportPdf({ inspection, customer, vehicle });
      showToast("Inspection report downloaded as a PDF.");
    } catch {
      showToast("The PDF could not be generated. Please try again.", "error");
    } finally {
      setDownloading(false);
    }
  }

  function handleQuote() {
    if (!inspection) return;
    if (quote) {
      router.push(`/quotes/${quote.id}`);
      return;
    }
    setCreatingQuote(true);
    const result = actions.createQuoteFromInspection(inspection.id);
    if (!result) {
      setCreatingQuote(false);
      showToast("There are no failed or needs-attention items to quote.", "error");
      return;
    }
    showToast(
      result.existing
        ? "A quote already exists for this inspection."
        : "Quote created from the inspection findings.",
    );
    router.push(`/quotes/${result.quote.id}`);
  }

  if (!inspection || !customer || !vehicle) {
    return (
      <div className="animate-fade-up">
        <PageHeader title="Inspection not found" backHref="/history" backLabel="Jobs" />
        <EmptyState
          icon={FileText}
          title="We couldn't find that report"
          description="The report may have been removed when the demo data was reset."
          action={<ButtonLink href="/history">Back to jobs</ButtonLink>}
        />
      </div>
    );
  }

  const quoteLabel = quote
    ? quote.invoiceNumber
      ? `View ${quote.invoiceNumber}`
      : `View ${quote.quoteNumber}`
    : "Create quote";

  return (
    <div className="animate-fade-up">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          backHref="/history"
          backLabel="Jobs & invoices"
          eyebrow={inspection.reportNumber}
          title="Inspection report"
          description={`${customer.name} · ${vehicleName(vehicle)} · ${vehicle.plate}`}
          action={
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="outline" onClick={handleDownload} loading={downloading}>
                <Download className="size-4" aria-hidden="true" />
                Download PDF
              </Button>
              {inspection.status !== "completed" ? (
                <ButtonLink href={`/inspections/${inspection.id}/sign`}>
                  <PenLine className="size-4" aria-hidden="true" />
                  Collect signature
                </ButtonLink>
              ) : (
                <Badge tone="green" dot>
                  Signed {formatDate(inspection.signedAt)}
                </Badge>
              )}
            </div>
          }
        />

        {inspection.status !== "completed" && (
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <PenLine className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-amber-900">This report needs a signature</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800/75">
                  Collect the customer&apos;s signature to complete the report before sending.
                </p>
              </div>
            </div>
            <ButtonLink
              href={`/inspections/${inspection.id}/sign`}
              size="sm"
              variant="amber"
              className="shrink-0"
            >
              Sign now
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </ButtonLink>
          </div>
        )}

        {inspection.status === "completed" && (
          <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3">
            <CheckCircle2 className="size-4 shrink-0 text-brand-700" aria-hidden="true" />
            <p className="text-[11px] font-medium text-brand-900">
              Signed by {customer.name} on {formatDate(inspection.signedAt)}. Ready to download and
              share.
            </p>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-2 sm:hidden">
          <Button variant="outline" onClick={handleDownload} loading={downloading} className="flex-1">
            <Download className="size-4" aria-hidden="true" />
            PDF
          </Button>
          {inspection.status !== "completed" ? (
            <ButtonLink href={`/inspections/${inspection.id}/sign`} className="flex-1">
              <PenLine className="size-4" aria-hidden="true" />
              Sign
            </ButtonLink>
          ) : (
            <Badge tone="green" dot>
              Signed
            </Badge>
          )}
        </div>

        <ReportDocument inspection={inspection} customer={customer} vehicle={vehicle} />

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleQuote}
            disabled={(findings === 0 && !quote) || creatingQuote}
            className="group flex min-h-[68px] items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left shadow-card transition hover:border-brand-200 hover:bg-brand-50/30 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-line disabled:hover:bg-white"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <ReceiptText className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-ink">
                {creatingQuote ? "Creating quote…" : quoteLabel}
              </span>
              <span className="mt-0.5 block text-[10px] leading-relaxed text-ink-muted">
                {quote
                  ? quote.invoiceNumber
                    ? "Open the invoice for this job."
                    : "Open the editable quote for this job."
                  : findings > 0
                    ? `Turn ${findings} finding${findings === 1 ? "" : "s"} into editable quote lines.`
                    : "No findings to quote on this inspection."}
              </span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-ink-muted/50 transition group-hover:text-brand-700" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="group flex min-h-[68px] items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left shadow-card transition hover:border-brand-200 hover:bg-brand-50/30"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-white">
              <Download className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-ink">
                {downloading ? "Preparing PDF…" : "Download report PDF"}
              </span>
              <span className="mt-0.5 block text-[10px] leading-relaxed text-ink-muted">
                Branded, multi-page PDF with photos and signature.
              </span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-ink-muted/50 transition group-hover:text-brand-700" aria-hidden="true" />
          </button>
        </div>

        {findings === 0 && !quote && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-muted">
            <CheckCircle2 className="size-3.5 text-brand" aria-hidden="true" />
            Every item passed — there are no findings to add to a quote.
          </p>
        )}
      </div>
    </div>
  );
}
