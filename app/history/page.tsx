"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronRight,
  ClipboardCheck,
  FileText,
  Plus,
  ReceiptText,
  SearchX,
  SlidersHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useStore } from "@/lib/store";
import {
  calculateTotals,
  formatDate,
  formatNZD,
} from "@/lib/format";
import { getInspectionCounts, vehicleName } from "@/lib/inspection";
import type { Customer, Inspection, Quote, Vehicle } from "@/lib/types";

type Filter = "all" | "reports" | "invoices" | "unpaid";

interface ReportEntry {
  kind: "report";
  id: string;
  sortDate: string;
  inspection: Inspection;
  customer: Customer;
  vehicle: Vehicle;
}

interface InvoiceEntry {
  kind: "invoice";
  id: string;
  sortDate: string;
  quote: Quote;
  customer: Customer;
  vehicle: Vehicle;
}

type HistoryEntry = ReportEntry | InvoiceEntry;

export default function HistoryPage() {
  const { data } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const customerMap = useMemo(
    () => new Map(data.customers.map((customer) => [customer.id, customer])),
    [data.customers],
  );
  const vehicleMap = useMemo(
    () => new Map(data.vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [data.vehicles],
  );

  const entries = useMemo<HistoryEntry[]>(() => {
    const reports: HistoryEntry[] = [];
    for (const inspection of data.inspections) {
      const customer = customerMap.get(inspection.customerId);
      const vehicle = vehicleMap.get(inspection.vehicleId);
      if (!customer || !vehicle) continue;
      reports.push({
        kind: "report",
        id: inspection.id,
        sortDate: inspection.createdAt,
        inspection,
        customer,
        vehicle,
      });
    }
    const invoices: HistoryEntry[] = [];
    for (const quote of data.quotes) {
      if (!quote.invoiceNumber) continue;
      const customer = customerMap.get(quote.customerId);
      const vehicle = vehicleMap.get(quote.vehicleId);
      if (!customer || !vehicle) continue;
      invoices.push({
        kind: "invoice",
        id: quote.id,
        sortDate: quote.invoicedAt ?? quote.createdAt,
        quote,
        customer,
        vehicle,
      });
    }
    return [...reports, ...invoices].sort(
      (a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime(),
    );
  }, [data.inspections, data.quotes, customerMap, vehicleMap]);

  const counts = useMemo(
    () => ({
      all: entries.length,
      reports: entries.filter((entry) => entry.kind === "report").length,
      invoices: entries.filter((entry) => entry.kind === "invoice").length,
      unpaid: data.quotes.filter((quote) => quote.invoiceNumber && !quote.paid).length,
    }),
    [entries, data.quotes],
  );

  const unpaidTotal = data.quotes
    .filter((quote) => quote.invoiceNumber && !quote.paid)
    .reduce((sum, quote) => sum + calculateTotals(quote.items).total, 0);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (filter === "reports" && entry.kind !== "report") return false;
      if (filter === "invoices" && entry.kind !== "invoice") return false;
      if (filter === "unpaid" && (entry.kind !== "invoice" || entry.quote.paid)) return false;
      if (!term) return true;
      const base = [
        entry.customer.name,
        entry.customer.phone,
        vehicleName(entry.vehicle),
        entry.vehicle.plate,
      ];
      if (entry.kind === "report") {
        base.push(entry.inspection.reportNumber, entry.inspection.templateName);
      } else {
        base.push(entry.quote.invoiceNumber ?? "", entry.quote.quoteNumber);
      }
      return base.join(" ").toLowerCase().includes(term);
    });
  }, [entries, filter, query]);

  const filterOptions: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "reports", label: "Reports", count: counts.reports },
    { key: "invoices", label: "Invoices", count: counts.invoices },
    { key: "unpaid", label: "Unpaid", count: counts.unpaid },
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Jobs & invoices"
        description="Every inspection report and invoice, saved in this browser."
        action={
          <ButtonLink href="/inspections/new">
            <Plus className="size-4" strokeWidth={2.5} aria-hidden="true" />
            New inspection
          </ButtonLink>
        }
      />

      <div className="mb-4 grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="card p-3.5 sm:p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-muted">Reports</p>
          <p className="mt-1.5 text-xl font-bold tracking-tight text-ink">{counts.reports}</p>
        </div>
        <div className="card p-3.5 sm:p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-muted">Invoices</p>
          <p className="mt-1.5 text-xl font-bold tracking-tight text-ink">{counts.invoices}</p>
        </div>
        <div className={`card p-3.5 sm:p-4 ${counts.unpaid > 0 ? "border-amber-200/80 bg-amber-50/30" : ""}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-muted">Unpaid</p>
          <p className="mt-1.5 text-xl font-bold tracking-tight text-ink">
            {counts.unpaid}
          </p>
          {unpaidTotal > 0 && (
            <p className="mt-0.5 text-[9px] font-medium text-amber-700">{formatNZD(unpaidTotal)}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search report, invoice or plate"
          label="Search job history"
        />
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {filterOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={filter === option.key}
              onClick={() => setFilter(option.key)}
              className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition ${
                filter === option.key
                  ? "bg-ink text-white shadow-sm"
                  : "border border-line bg-white text-ink-muted hover:border-brand-200 hover:text-ink"
              }`}
            >
              {option.label}
              <span
                className={`grid min-w-5 place-items-center rounded-full px-1 py-0.5 text-[9px] font-bold ${
                  filter === option.key ? "bg-white/15 text-white" : "bg-canvas text-ink-muted"
                }`}
              >
                {option.count}
              </span>
            </button>
          ))}
          <span className="ml-auto hidden items-center gap-1.5 pl-2 text-[10px] text-ink-muted sm:flex">
            <SlidersHorizontal className="size-3" aria-hidden="true" />
            {filtered.length} shown
          </span>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="card mt-4 overflow-hidden divide-y divide-line">
          {filtered.map((entry) => {
            if (entry.kind === "report") {
              const countsForReport = getInspectionCounts(entry.inspection);
              return (
                <Link
                  key={`report-${entry.id}`}
                  href={`/inspections/${entry.id}`}
                  className="group flex items-start gap-3 px-4 py-4 transition hover:bg-brand-50/40 sm:px-5"
                >
                  <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <ClipboardCheck className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-xs font-bold text-ink">{entry.inspection.reportNumber}</p>
                      <Badge tone="gray">Report</Badge>
                      <Badge
                        tone={entry.inspection.status === "completed" ? "green" : "amber"}
                        dot
                      >
                        {entry.inspection.status === "completed" ? "Completed" : "Awaiting signature"}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold text-ink">
                      {entry.customer.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                      {vehicleName(entry.vehicle)} · {entry.vehicle.plate}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-muted">
                      <span>{formatDate(entry.inspection.date)}</span>
                      <span className="text-brand-700">{countsForReport.pass} passed</span>
                      {countsForReport.attention > 0 && (
                        <span className="text-amber-700">
                          {countsForReport.attention} attention
                        </span>
                      )}
                      {countsForReport.fail > 0 && (
                        <span className="text-red-600">{countsForReport.fail} failed</span>
                      )}
                    </div>
                  </div>
                  <span className="mt-2 grid size-7 shrink-0 place-items-center rounded-full bg-canvas text-ink-muted transition group-hover:bg-white group-hover:text-brand-700">
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </span>
                </Link>
              );
            }

            const totals = calculateTotals(entry.quote.items);
            return (
              <Link
                key={`invoice-${entry.id}`}
                href={`/quotes/${entry.id}`}
                className="group flex items-start gap-3 px-4 py-4 transition hover:bg-brand-50/40 sm:px-5"
              >
                <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-white">
                  <ReceiptText className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-xs font-bold text-ink">{entry.quote.invoiceNumber}</p>
                    <Badge tone="gray">Invoice</Badge>
                    <Badge tone={entry.quote.paid ? "green" : "amber"} dot>
                      {entry.quote.paid ? "Paid" : "Unpaid"}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-ink">
                    {entry.customer.name}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                    {vehicleName(entry.vehicle)} · {entry.vehicle.plate}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-muted">
                    <span>Issued {formatDate(entry.quote.invoicedAt)}</span>
                    {!entry.quote.paid && entry.quote.dueAt && (
                      <span>Due {formatDate(entry.quote.dueAt)}</span>
                    )}
                  </div>
                </div>
                <div className="mt-1 flex shrink-0 flex-col items-end gap-2">
                  <p className="text-sm font-bold text-ink">{formatNZD(totals.total)}</p>
                  <ChevronRight className="size-4 text-ink-muted/50 transition group-hover:text-brand-700" aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          className="mt-4"
          icon={query ? SearchX : FileText}
          title={query ? "No matching jobs" : filter === "unpaid" ? "No unpaid invoices" : "Nothing here yet"}
          description={
            query
              ? `Nothing matches “${query}” with this filter. Try a different search.`
              : filter === "unpaid"
                ? "All invoices are paid. Lovely."
                : "Completed inspections and invoices will appear here."
          }
          action={
            query || filter !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
                className="text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                Clear search and filters
              </button>
            ) : (
              <ButtonLink href="/inspections/new" size="sm">
                <Plus className="size-3.5" aria-hidden="true" />
                Start an inspection
              </ButtonLink>
            )
          }
        />
      )}
    </div>
  );
}
