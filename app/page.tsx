"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CarFront,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ListChecks,
  Plus,
  ReceiptText,
  Settings,
  Users,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ReportRow } from "@/components/report-row";
import { useStore } from "@/lib/store";
import { calculateTotals, firstWord, formatDate, formatNZD, todayISO } from "@/lib/format";
import { TECHNICIANS } from "@/lib/constants";

export default function DashboardPage() {
  const { data } = useStore();
  const [todayLabel, setTodayLabel] = useState("");

  useEffect(() => {
    setTodayLabel(formatDate(todayISO()));
  }, []);

  const customerMap = useMemo(
    () => new Map(data.customers.map((customer) => [customer.id, customer])),
    [data.customers],
  );
  const vehicleMap = useMemo(
    () => new Map(data.vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [data.vehicles],
  );

  const recent = useMemo(
    () =>
      [...data.inspections]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4),
    [data.inspections],
  );

  const unpaid = useMemo(
    () =>
      data.quotes
        .filter((quote) => quote.invoiceNumber && !quote.paid)
        .sort((a, b) => new Date(b.invoicedAt ?? b.createdAt).getTime() - new Date(a.invoicedAt ?? a.createdAt).getTime()),
    [data.quotes],
  );

  const unpaidTotal = unpaid.reduce((sum, quote) => sum + calculateTotals(quote.items).total, 0);
  const firstName = firstWord(TECHNICIANS[0]);

  const steps = [
    { number: "01", title: "Inspect", detail: "Checklist, notes & photos" },
    { number: "02", title: "Sign off", detail: "Customer signs on your phone" },
    { number: "03", title: "Invoice", detail: "Quote, GST & PDF in a tap" },
  ];

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-ink-muted">
            Auckland, New Zealand{todayLabel ? ` · ${todayLabel}` : ""}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">
            Kia ora, {firstName}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">Here&apos;s the workshop at a glance.</p>
        </div>
        <ButtonLink href="/inspections/new" className="hidden sm:inline-flex">
          <Plus className="size-4" strokeWidth={2.5} aria-hidden="true" />
          New inspection
        </ButtonLink>
      </div>

      <section className="relative isolate overflow-hidden rounded-3xl bg-ink px-5 py-6 text-white shadow-lift sm:px-8 sm:py-8">
        <div
          className="pointer-events-none absolute -right-24 -top-32 size-72 rounded-full bg-brand/25 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-36 right-28 size-72 rounded-full bg-brand-300/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_70%_20%,rgba(34,165,89,0.16),transparent_55%)] md:block"
          aria-hidden="true"
        />

        <div className="relative grid gap-8 md:grid-cols-[1.35fr_0.65fr] md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.07] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-brand-200">
              <span className="size-1.5 rounded-full bg-brand-300" />
              Workshop demo · Auckland
            </span>
            <h2 className="mt-4 max-w-md text-2xl font-bold leading-[1.15] tracking-[-0.03em] sm:text-[30px]">
              From inspection to invoice, sorted.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
              Run the full job on your phone — capture findings, collect a signature, and send a
              branded report or invoice.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ButtonLink
                href="/inspections/new"
                variant="outline"
                size="lg"
                className="border-white/20 bg-white text-ink hover:bg-brand-50"
              >
                <Plus className="size-4" strokeWidth={2.5} aria-hidden="true" />
                Start new inspection
              </ButtonLink>
              <Link
                href="/history"
                className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-white/75 transition hover:text-white"
              >
                View recent jobs
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 md:hidden">
              {steps.map((step) => (
                <div key={step.number}>
                  <p className="text-[9px] font-bold tracking-[0.12em] text-brand-300">
                    {step.number}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-white">{step.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">
                The full job
              </p>
              <div className="mt-3 space-y-3">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-start gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/10 text-[10px] font-bold text-brand-200">
                      {step.number}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{step.title}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-white/45">{step.detail}</p>
                    </div>
                    {index === steps.length - 1 && (
                      <Check className="ml-auto mt-1 size-4 shrink-0 text-brand-300" aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3" aria-label="Workshop snapshot">
        <Link
          href="/history"
          className="card card-hover flex flex-col p-3.5 sm:p-4"
          aria-label={`${data.inspections.length} reports saved`}
        >
          <div className="flex items-center justify-between">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <ClipboardCheck className="size-4" aria-hidden="true" />
            </span>
            <ChevronRight className="size-3.5 text-ink-muted/50" aria-hidden="true" />
          </div>
          <p className="mt-3 text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {data.inspections.length}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold leading-tight text-ink-muted sm:text-[11px]">
            Reports saved
          </p>
        </Link>

        <Link
          href="/history"
          className={`card card-hover flex flex-col p-3.5 sm:p-4 ${
            unpaid.length > 0 ? "border-amber-200/80 bg-amber-50/30" : ""
          }`}
          aria-label={`${unpaid.length} unpaid invoices`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`grid size-8 place-items-center rounded-lg ${
                unpaid.length > 0 ? "bg-amber-100 text-amber-700" : "bg-brand-50 text-brand-700"
              }`}
            >
              <ReceiptText className="size-4" aria-hidden="true" />
            </span>
            <ChevronRight className="size-3.5 text-ink-muted/50" aria-hidden="true" />
          </div>
          <p className="mt-3 text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {unpaid.length}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold leading-tight text-ink-muted sm:text-[11px]">
            Unpaid {unpaid.length === 1 ? "invoice" : "invoices"}
          </p>
        </Link>

        <Link href="/customers" className="card card-hover flex flex-col p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <CarFront className="size-4" aria-hidden="true" />
            </span>
            <ChevronRight className="size-3.5 text-ink-muted/50" aria-hidden="true" />
          </div>
          <p className="mt-3 text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {data.vehicles.length}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold leading-tight text-ink-muted sm:text-[11px]">
            Vehicles on file
          </p>
        </Link>
      </section>

      <div className="mt-6 grid gap-5 lg:mt-7 lg:grid-cols-[1.65fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight text-ink">Recent jobs</h2>
              <p className="mt-0.5 text-xs text-ink-muted">Your latest inspections and reports.</p>
            </div>
            <Link
              href="/history"
              className="inline-flex min-h-9 items-center gap-1 text-xs font-bold text-brand-700 transition hover:text-brand-800"
            >
              View all
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="card overflow-hidden">
            {recent.length > 0 ? (
              <div className="divide-y divide-line">
                {recent.map((inspection) => {
                  const customer = customerMap.get(inspection.customerId);
                  const vehicle = vehicleMap.get(inspection.vehicleId);
                  if (!customer || !vehicle) return null;
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
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <ClipboardCheck className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-sm font-bold text-ink">No inspections yet</p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-ink-muted">
                  Start your first inspection to see it appear here.
                </p>
                <ButtonLink href="/inspections/new" size="sm" className="mt-4">
                  <Plus className="size-3.5" aria-hidden="true" />
                  New inspection
                </ButtonLink>
              </div>
            )}
          </div>
        </section>

        <div className="space-y-5">
          <section className="card overflow-hidden">
            <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
              <div>
                <h2 className="text-base font-bold tracking-tight text-ink">Unpaid invoices</h2>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {unpaid.length > 0
                    ? `${formatNZD(unpaidTotal, true)} outstanding`
                    : "Nothing outstanding"}
                </p>
              </div>
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                  unpaid.length > 0 ? "bg-amber-50 text-amber-700" : "bg-brand-50 text-brand-700"
                }`}
              >
                <ReceiptText className="size-4" aria-hidden="true" />
              </span>
            </div>
            {unpaid.length > 0 ? (
              <div className="divide-y divide-line">
                {unpaid.slice(0, 3).map((quote) => {
                  const customer = customerMap.get(quote.customerId);
                  const totals = calculateTotals(quote.items);
                  return (
                    <Link
                      key={quote.id}
                      href={`/quotes/${quote.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-brand-50/40"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-ink">{quote.invoiceNumber}</p>
                        <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                          {customer?.name ?? "Customer"} · Due {formatDate(quote.dueAt)}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-ink">{formatNZD(totals.total)}</p>
                      <ChevronRight className="size-3.5 shrink-0 text-ink-muted/50" aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 border-t border-line px-5 py-4 text-xs text-ink-muted">
                <CheckCircle2 className="size-4 shrink-0 text-brand" aria-hidden="true" />
                All invoices are paid — nice work.
              </div>
            )}
          </section>

          <section className="card p-5">
            <p className="label-caps">Quick access</p>
            <div className="mt-3 grid gap-1">
              {[
                { href: "/customers", label: "Customers & vehicles", icon: Users },
                { href: "/templates", label: "Checklist templates", icon: ListChecks },
                { href: "/settings", label: "Settings & demo data", icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex min-h-10 items-center gap-3 rounded-xl px-2 text-sm font-medium text-ink-soft transition hover:bg-brand-50 hover:text-ink"
                  >
                    <span className="grid size-7 place-items-center rounded-lg bg-canvas text-ink-muted transition group-hover:bg-white group-hover:text-brand-700">
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>
                    {item.label}
                    <ChevronRight className="ml-auto size-3.5 text-ink-muted/50" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
