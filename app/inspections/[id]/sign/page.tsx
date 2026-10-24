"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  CarFront,
  CheckCircle2,
  ClipboardCheck,
  Eraser,
  PenLine,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StepProgress } from "@/components/step-progress";
import { SignaturePad, type SignaturePadHandle } from "@/components/signature-pad";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatDateTime, formatOdometer } from "@/lib/format";
import { vehicleName } from "@/lib/inspection";

export default function SignaturePage() {
  const params = useParams<{ id: string }>();
  const { data, actions } = useStore();
  const { showToast } = useToast();
  const router = useRouter();
  const signatureRef = useRef<SignaturePadHandle>(null);
  const [hasInk, setHasInk] = useState(false);
  const [saving, setSaving] = useState(false);

  const inspectionId = typeof params.id === "string" ? params.id : "";
  const inspection = data.inspections.find((entry) => entry.id === inspectionId);
  const customer = inspection
    ? data.customers.find((entry) => entry.id === inspection.customerId)
    : undefined;
  const vehicle = inspection
    ? data.vehicles.find((entry) => entry.id === inspection.vehicleId)
    : undefined;

  function handleSave() {
    if (!inspection) return;
    const signature = signatureRef.current?.getDataUrl();
    if (!signature) {
      showToast("Ask the customer to sign in the box before saving.", "error");
      return;
    }
    setSaving(true);
    const saved = actions.saveSignature(inspection.id, signature);
    if (!saved) {
      setSaving(false);
      showToast("We couldn't save the signature. Please try again.", "error");
      return;
    }
    showToast("Signature saved. The inspection report is ready.");
    router.push(`/inspections/${inspection.id}`);
  }

  if (!inspection || !customer || !vehicle) {
    return (
      <div className="animate-fade-up">
        <PageHeader title="Inspection not found" backHref="/history" backLabel="Jobs" />
        <EmptyState
          icon={ClipboardCheck}
          title="We couldn't find that inspection"
          description="It may have been removed when the demo data was reset."
          action={<ButtonLink href="/inspections/new">Start a new inspection</ButtonLink>}
        />
      </div>
    );
  }

  if (inspection.status === "completed" && inspection.signature) {
    return (
      <div className="animate-fade-up">
        <PageHeader
          backHref={`/inspections/${inspection.id}`}
          backLabel="Inspection report"
          eyebrow="Sign-off complete"
          title="Signature collected"
          description={`${inspection.reportNumber} has been signed by ${customer.name}.`}
        />
        <StepProgress current={3} />
        <div className="card mx-auto max-w-xl overflow-hidden">
          <div className="flex items-center gap-3 border-b border-line bg-brand-50/60 px-5 py-4">
            <span className="grid size-9 place-items-center rounded-xl bg-white text-brand shadow-sm">
              <CheckCircle2 className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">Report signed and saved</p>
              <p className="mt-0.5 text-[11px] text-ink-muted">
                Signed {formatDateTime(inspection.signedAt)}
              </p>
            </div>
          </div>
          <div className="px-5 py-5">
            <div className="rounded-xl border border-line bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={inspection.signature}
                alt={`Signature of ${customer.name}`}
                className="mx-auto h-24 w-full object-contain"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-ink-muted">
              <span>{customer.name}</span>
              <span>{vehicle.plate}</span>
            </div>
          </div>
          <div className="border-t border-line p-4">
            <ButtonLink href={`/inspections/${inspection.id}`} className="w-full">
              View report & invoice options
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        backHref={`/inspections/${inspection.id}`}
        backLabel="Report preview"
        eyebrow="Customer sign-off"
        title="Capture a signature"
        description="Hand the phone to the customer. They can sign with a finger — no printing needed."
      />
      <StepProgress current={3} />

      <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div className="space-y-3">
          <section className="card p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <CarFront className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">{customer.name}</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {vehicleName(vehicle)} · {vehicle.plate}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="dark">{inspection.reportNumber}</Badge>
                  <Badge tone="green">
                    {inspection.templateName}
                  </Badge>
                </div>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-line pt-4 text-[11px]">
              <div>
                <dt className="text-ink-muted">Inspection date</dt>
                <dd className="mt-0.5 font-semibold text-ink">{formatDate(inspection.date)}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Technician</dt>
                <dd className="mt-0.5 font-semibold text-ink">{inspection.technician}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Odometer</dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {formatOdometer(inspection.odometer)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-muted">WOF expiry</dt>
                <dd className="mt-0.5 inline-flex items-center gap-1 font-semibold text-ink">
                  <ShieldCheck className="size-3 text-brand" aria-hidden="true" />
                  {formatDate(vehicle.wofExpiry)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl bg-ink p-4 text-white sm:p-5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-200">
              <PenLine className="size-3.5" aria-hidden="true" />
              Next step
            </div>
            <p className="mt-2 text-sm font-semibold">Review, sign, then send.</p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/55">
              After signing you can preview the report, turn findings into a quote, and download a
              branded PDF.
            </p>
          </section>
        </div>

        <section className="card p-4 sm:p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-ink">Customer signature</h2>
              <p className="mt-0.5 text-[11px] text-ink-muted">
                Sign inside the box using a finger or stylus.
              </p>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <PenLine className="size-4" aria-hidden="true" />
            </span>
          </div>

          <SignaturePad
            ref={signatureRef}
            onInkChange={(ink) => setHasInk(ink)}
          />

          <p className="mt-3 text-[10px] leading-relaxed text-ink-muted">
            By signing, the customer acknowledges the inspection findings and agrees to the work
            listed in the report. This is a demo and does not create a legal record.
          </p>

          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => signatureRef.current?.clear()}
              disabled={!hasInk || saving}
              className="flex-1"
            >
              <Eraser className="size-4" aria-hidden="true" />
              Clear
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!hasInk}
              loading={saving}
              className="flex-1"
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Save signature
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
