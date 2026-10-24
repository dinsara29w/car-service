"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  CarFront,
  ChevronRight,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  Plus,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonClasses, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ReportRow } from "@/components/report-row";
import { useStore } from "@/lib/store";
import {
  calculateTotals,
  formatDate,
  formatNZD,
  formatOdometer,
} from "@/lib/format";
import { vehicleName } from "@/lib/inspection";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const { data } = useStore();
  const customerId = typeof params.id === "string" ? params.id : "";
  const customer = data.customers.find((entry) => entry.id === customerId);

  if (!customer) {
    return (
      <div className="animate-fade-up">
        <PageHeader title="Customer not found" backHref="/customers" backLabel="Customers" />
        <EmptyState
          icon={ClipboardList}
          title="We couldn't find that customer"
          description="The demo data may have been reset. Head back to the customer list and try again."
          action={<ButtonLink href="/customers">Back to customers</ButtonLink>}
        />
      </div>
    );
  }

  const vehicles = data.vehicles.filter((vehicle) => vehicle.customerId === customer.id);
  const reports = data.inspections
    .filter((inspection) => inspection.customerId === customer.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const invoices = data.quotes
    .filter((quote) => quote.customerId === customer.id && quote.invoiceNumber)
    .sort((a, b) => new Date(b.invoicedAt ?? b.createdAt).getTime() - new Date(a.invoicedAt ?? a.createdAt).getTime());
  const outstanding = invoices
    .filter((invoice) => !invoice.paid)
    .reduce((sum, invoice) => sum + calculateTotals(invoice.items).total, 0);

  return (
    <div className="animate-fade-up">
      <PageHeader
        backHref="/customers"
        backLabel="Customers"
        eyebrow="Customer"
        title={customer.name}
        description={customer.address}
        action={
          <a href={`tel:${customer.phone.replace(/\s/g, "")}`} className={buttonClasses("secondary")}>
            <Phone className="size-4" aria-hidden="true" />
            Call
          </a>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="card p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <Avatar name={customer.name} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold tracking-tight text-ink">{customer.name}</p>
              <p className="mt-0.5 text-xs text-ink-muted">Customer record</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge tone="green" dot>
                  {reports.length} {reports.length === 1 ? "report" : "reports"}
                </Badge>
                {outstanding > 0 && (
                  <Badge tone="amber" dot>
                    {formatNZD(outstanding)} outstanding
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-1 border-t border-line pt-4">
            <a
              href={`tel:${customer.phone.replace(/\s/g, "")}`}
              className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-sm text-ink transition hover:bg-brand-50"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <Phone className="size-3.5" aria-hidden="true" />
              </span>
              <span className="font-medium">{customer.phone}</span>
            </a>
            <a
              href={`mailto:${customer.email}`}
              className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-sm text-ink transition hover:bg-brand-50"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <Mail className="size-3.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 truncate font-medium">{customer.email}</span>
            </a>
            <div className="flex min-h-11 items-start gap-3 rounded-xl px-2 py-2.5 text-sm text-ink">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <MapPin className="size-3.5" aria-hidden="true" />
              </span>
              <span className="pt-1.5 font-medium leading-relaxed">{customer.address}</span>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-ink p-5 text-white shadow-card sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-200">
                Vehicle on file
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight">
                {vehicles.length > 0 ? vehicleName(vehicles[0]) : "No vehicle"}
              </h2>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10">
              <CarFront className="size-5" aria-hidden="true" />
            </span>
          </div>

          {vehicles.length > 0 ? (
            vehicles.map((vehicle) => (
              <div key={vehicle.id}>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-[11px] font-bold tracking-[0.08em] text-white">
                    {vehicle.plate}
                  </span>
                  <span className="text-xs text-white/55">{vehicle.colour}</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/35">
                      Odometer
                    </p>
                    <p className="mt-1 text-sm font-semibold">{formatOdometer(vehicle.odometer)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/35">
                      WOF expiry
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                      <ShieldCheck className="size-3.5 text-brand-300" aria-hidden="true" />
                      {formatDate(vehicle.wofExpiry)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/35">
                      VIN
                    </p>
                    <p className="mt-1 font-mono text-xs tracking-wide text-white/75">
                      {vehicle.vin}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="mt-4 text-sm text-white/60">No vehicle has been added yet.</p>
          )}

          <div className="mt-5 flex items-center gap-1.5 border-t border-white/10 pt-4 text-[10px] text-white/40">
            <Plus className="size-3" aria-hidden="true" />
            Add or edit vehicles from the workshop admin
          </div>
        </section>
      </div>

      <section className="mt-7">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-bold tracking-tight text-ink">Inspection history</h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Reports linked to this customer and vehicle.
            </p>
          </div>
          <span className="text-xs font-semibold text-ink-muted">
            {reports.length} {reports.length === 1 ? "report" : "reports"}
          </span>
        </div>

        <div className="card overflow-hidden">
          {reports.length > 0 ? (
            <div className="divide-y divide-line">
              {reports.map((inspection) => {
                const vehicle = data.vehicles.find((entry) => entry.id === inspection.vehicleId);
                if (!vehicle) return null;
                return (
                  <ReportRow
                    key={inspection.id}
                    inspection={inspection}
                    customer={customer}
                    vehicle={vehicle}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              className="border-0 bg-transparent shadow-none"
              icon={ClipboardList}
              title="No inspections yet"
              description="Start a new inspection to build this customer's service history."
              action={
                <ButtonLink href="/inspections/new" size="sm">
                  <Plus className="size-3.5" aria-hidden="true" />
                  New inspection
                </ButtonLink>
              }
            />
          )}
        </div>
      </section>

      {invoices.length > 0 && (
        <section className="mt-7">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-bold tracking-tight text-ink">Invoices</h2>
              <p className="mt-0.5 text-xs text-ink-muted">Invoiced work for this customer.</p>
            </div>
            <Link
              href="/history"
              className="inline-flex min-h-9 items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800"
            >
              All documents
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="card overflow-hidden divide-y divide-line">
            {invoices.map((invoice) => {
              const totals = calculateTotals(invoice.items);
              return (
                <Link
                  key={invoice.id}
                  href={`/quotes/${invoice.id}`}
                  className="flex items-center gap-3 px-4 py-4 transition hover:bg-brand-50/40 sm:px-5"
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <ReceiptText className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold text-ink">{invoice.invoiceNumber}</p>
                      <Badge tone={invoice.paid ? "green" : "amber"} dot>
                        {invoice.paid ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                      Issued {formatDate(invoice.invoicedAt)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-ink">{formatNZD(totals.total)}</p>
                  <ArrowRight className="size-4 text-ink-muted/50" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
