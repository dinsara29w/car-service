"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Database,
  Info,
  RotateCcw,
  ShieldCheck,
  Share,
  Smartphone,
  Store,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { SHOP } from "@/lib/constants";

export default function SettingsPage() {
  const { data, actions } = useStore();
  const { showToast } = useToast();
  const router = useRouter();
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const invoiceCount = data.quotes.filter((quote) => quote.invoiceNumber).length;

  function handleReset() {
    setResetting(true);
    actions.resetDemoData();
    setResetOpen(false);
    setResetting(false);
    showToast("Demo data reset to the original sample jobs.");
    router.push("/");
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Settings"
        description="Demo preferences, sample data and device setup."
        action={
          <Badge tone="amber" dot>
            Demo mode
          </Badge>
        }
      />

      <div className="mx-auto max-w-3xl space-y-4">
        <section className="card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <Store className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-ink">Workshop details</h2>
                <Badge tone="green">Demo</Badge>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                Details shown on reports, quotes and invoices.
              </p>
            </div>
          </div>
          <dl className="mt-4 divide-y divide-line border-t border-line text-xs">
            {[
              ["Business", SHOP.name],
              ["Location", `${SHOP.address}, ${SHOP.city}`],
              ["Phone", SHOP.phone],
              ["Email", SHOP.email],
              ["GST number", SHOP.gstNumber],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-3">
                <dt className="shrink-0 text-ink-muted">{label}</dt>
                <dd className="text-right font-semibold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-canvas p-3 text-[10px] leading-relaxed text-ink-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            All business details, customers and vehicles are fictional. Do not use this demo with
            real customer information.
          </p>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <Smartphone className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink">Add to iPhone home screen</h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                This demo includes a web app manifest, so it can run full-screen like an app.
              </p>
            </div>
          </div>
          <ol className="mt-4 space-y-2.5">
            {[
              { title: "Open this site in Safari", detail: "Add to Home Screen only works in Safari on iPhone." },
              { title: "Tap the Share button", detail: "It's the square with an arrow at the bottom of the screen." },
              { title: "Choose Add to Home Screen", detail: "The workshop icon will appear on your home screen." },
            ].map((step, index) => (
              <li key={step.title} className="flex gap-3 rounded-xl border border-line bg-white p-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-800">
                  {index + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink">{step.title}</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-ink-muted">{step.detail}</p>
                </div>
                {index === 1 && <Share className="ml-auto mt-0.5 size-4 shrink-0 text-ink-muted/50" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <Database className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink">Demo data</h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                Everything is stored in this browser only. There is no server or database.
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Customers", data.customers.length],
              ["Vehicles", data.vehicles.length],
              ["Reports", data.inspections.length],
              ["Invoices", invoiceCount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-canvas p-3">
                <p className="text-lg font-bold leading-none text-ink">{value}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-ink-muted">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-red-100 bg-red-50/40 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-ink">Reset demo data</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
                Restores the original customers, templates and two sample jobs. Your inspections
                and edits will be removed.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setResetOpen(true)}
              className="shrink-0"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Reset demo data
            </Button>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-white">
              <Wrench className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink">About this prototype</h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                A clickable concept built to show the full workshop workflow — from inspection to
                signed report and invoice.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2 border-t border-line pt-4">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-ink-muted">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Privacy
              </span>
              <span className="font-semibold text-ink">Browser storage only</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-ink-muted">
                <Database className="size-3.5" aria-hidden="true" />
                Backend
              </span>
              <span className="font-semibold text-ink">None — demo data</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-ink-muted">
                <Info className="size-3.5" aria-hidden="true" />
                Version
              </span>
              <span className="font-semibold text-ink">Prototype 1.0</span>
            </div>
          </div>
          <p className="mt-4 text-[10px] text-ink-muted">Demo by WebMint · Made for a New Zealand workshop.</p>
        </section>
      </div>

      <Dialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset all demo data?"
        description="This will remove inspections, quotes, invoices and template edits saved in this browser. The original sample data will be restored."
      >
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setResetOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleReset}
            loading={resetting}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset demo
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
