"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ClipboardCheck,
  Disc,
  Gauge,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, inputClass, selectClass } from "@/components/ui/form";
import { StepProgress } from "@/components/step-progress";
import { InspectionItemCard } from "@/components/inspection-item";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { fileToCompressedDataUrl } from "@/lib/images";
import { formatDate, formatOdometer, todayISO } from "@/lib/format";
import { TECHNICIANS } from "@/lib/constants";
import { vehicleName } from "@/lib/inspection";
import type {
  ChecklistTemplate,
  DraftInspectionResult,
  InspectionResult,
} from "@/lib/types";

const templateIcons = [ClipboardCheck, Disc, CircleDot];

function createResults(template?: ChecklistTemplate): Record<string, DraftInspectionResult> {
  if (!template) return {};
  const entries: [string, DraftInspectionResult][] = [];
  for (const section of template.sections) {
    for (const item of section.items) {
      entries.push([
        item.id,
        {
          status: null,
          notes: "",
          photos: [],
          measurement: "",
        },
      ]);
    }
  }
  return Object.fromEntries(entries);
}

export default function NewInspectionPage() {
  const { data, actions } = useStore();
  const { showToast } = useToast();
  const router = useRouter();

  const initialCustomer = data.customers[0];
  const initialVehicle = initialCustomer
    ? data.vehicles.find((vehicle) => vehicle.customerId === initialCustomer.id)
    : undefined;
  const initialTemplate = data.templates[0];

  const [step, setStep] = useState<1 | 2>(1);
  const [customerId, setCustomerId] = useState(initialCustomer?.id ?? "");
  const [vehicleId, setVehicleId] = useState(initialVehicle?.id ?? "");
  const [templateId, setTemplateId] = useState(initialTemplate?.id ?? "");
  const [technician, setTechnician] = useState<string>(TECHNICIANS[0]);
  const [date, setDate] = useState(todayISO());
  const [odometer, setOdometer] = useState(initialVehicle ? String(initialVehicle.odometer) : "");
  const [results, setResults] = useState<Record<string, DraftInspectionResult>>(() =>
    createResults(initialTemplate),
  );
  const [photoLoadingId, setPhotoLoadingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedCustomer = data.customers.find((customer) => customer.id === customerId);
  const selectedVehicle = data.vehicles.find((vehicle) => vehicle.id === vehicleId);
  const selectedTemplate = data.templates.find((template) => template.id === templateId);
  const customerVehicles = useMemo(
    () => data.vehicles.filter((vehicle) => vehicle.customerId === customerId),
    [data.vehicles, customerId],
  );

  const totalItems =
    selectedTemplate?.sections.reduce((count, section) => count + section.items.length, 0) ?? 0;
  const markedCount = Object.values(results).filter((result) => result.status !== null).length;
  const remaining = Math.max(0, totalItems - markedCount);

  function chooseCustomer(id: string) {
    setCustomerId(id);
    const nextVehicle = data.vehicles.find((vehicle) => vehicle.customerId === id);
    setVehicleId(nextVehicle?.id ?? "");
    setOdometer(nextVehicle ? String(nextVehicle.odometer) : "");
  }

  function chooseVehicle(id: string) {
    setVehicleId(id);
    const vehicle = data.vehicles.find((entry) => entry.id === id);
    if (vehicle) setOdometer(String(vehicle.odometer));
  }

  function chooseTemplate(id: string) {
    if (id === templateId) return;
    const template = data.templates.find((entry) => entry.id === id);
    setTemplateId(id);
    setResults(createResults(template));
  }

  function updateResult(itemId: string, update: Partial<DraftInspectionResult>) {
    setResults((current) => ({
      ...current,
      [itemId]: { ...current[itemId], ...update },
    }));
  }

  async function addPhoto(itemId: string, file: File) {
    if (!results[itemId] || results[itemId].photos.length >= 4) {
      showToast("You can add up to 4 photos per item in this demo.", "info");
      return;
    }
    setPhotoLoadingId(itemId);
    try {
      const photo = await fileToCompressedDataUrl(file);
      setResults((current) => {
        const existing = current[itemId];
        if (!existing || existing.photos.length >= 4) return current;
        return {
          ...current,
          [itemId]: { ...existing, photos: [...existing.photos, photo] },
        };
      });
      showToast("Photo added.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "We couldn't add that photo.",
        "error",
      );
    } finally {
      setPhotoLoadingId(null);
    }
  }

  function removePhoto(itemId: string, photoIndex: number) {
    setResults((current) => ({
      ...current,
      [itemId]: {
        ...current[itemId],
        photos: current[itemId].photos.filter((_, index) => index !== photoIndex),
      },
    }));
  }

  function markRemainingPassed() {
    if (remaining === 0) return;
    setResults((current) => {
      const next = { ...current };
      for (const [itemId, result] of Object.entries(next)) {
        if (!result.status) next[itemId] = { ...result, status: "pass" };
      }
      return next;
    });
    showToast(
      `${remaining} remaining ${remaining === 1 ? "item" : "items"} marked as pass.`,
      "success",
    );
  }

  function goToChecklist() {
    if (!selectedCustomer || !selectedVehicle) {
      showToast("Choose a customer and vehicle to continue.", "error");
      return;
    }
    if (!selectedTemplate || totalItems === 0) {
      showToast("Choose a checklist template to continue.", "error");
      return;
    }
    if (!technician || !date) {
      showToast("Add the technician and inspection date.", "error");
      return;
    }
    if (!odometer.trim() || !Number.isFinite(Number(odometer)) || Number(odometer) < 0) {
      showToast("Enter a valid odometer reading in kilometres.", "error");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function createAndSign() {
    if (markedCount < totalItems) {
      showToast(
        `${remaining} ${remaining === 1 ? "item still needs" : "items still need"} a result.`,
        "error",
      );
      document
        .querySelector('[data-unmarked="true"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!selectedTemplate || !selectedCustomer || !selectedVehicle) {
      showToast("Job details are missing. Go back and check the details.", "error");
      setStep(1);
      return;
    }

    setSubmitting(true);
    const finalResults: InspectionResult[] = selectedTemplate.sections.flatMap((section) =>
      section.items.map((item) => {
        const result = results[item.id];
        return {
          itemId: item.id,
          status: result.status ?? "pass",
          notes: result.notes.trim(),
          photos: result.photos,
          measurement:
            item.type === "measurement" ? result.measurement.trim() : undefined,
        };
      }),
    );

    const inspection = actions.createInspection({
      customerId: selectedCustomer.id,
      vehicleId: selectedVehicle.id,
      templateId: selectedTemplate.id,
      technician,
      date,
      odometer: Number(odometer),
      results: finalResults,
    });

    if (!inspection) {
      setSubmitting(false);
      showToast("The inspection could not be saved. Please try again.", "error");
      return;
    }

    showToast("Inspection saved. Collect the customer signature next.");
    router.push(`/inspections/${inspection.id}/sign`);
  }

  return (
    <>
      <div className="animate-fade-up pb-24">
        <PageHeader
          onBack={() =>
            step === 1 ? router.push("/") : setStep(1)
          }
          backLabel={step === 1 ? "Dashboard" : "Job details"}
          eyebrow="New inspection"
          title={step === 1 ? "Set up the job" : "Run the checklist"}
          description={
            step === 1
              ? "Choose the customer, vehicle and checklist. We'll fill in the vehicle details."
              : "Tap a result for each item. Add notes, measurements and photos as you go."
          }
        />
        <StepProgress current={step === 1 ? 1 : 2} />

        {step === 1 ? (
          <div className="space-y-4">
            <section className="card p-4 sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Users className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-ink">Customer & vehicle</h2>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    Vehicle details fill in automatically.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Customer" htmlFor="inspection-customer" required>
                  <div className="relative">
                    <select
                      id="inspection-customer"
                      value={customerId}
                      onChange={(event) => chooseCustomer(event.target.value)}
                      className={selectClass}
                    >
                      <option value="" disabled>
                        Select a customer
                      </option>
                      {data.customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} · {customer.phone}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
                  </div>
                </Field>

                <Field label="Vehicle" htmlFor="inspection-vehicle" required>
                  <div className="relative">
                    <select
                      id="inspection-vehicle"
                      value={vehicleId}
                      onChange={(event) => chooseVehicle(event.target.value)}
                      className={selectClass}
                      disabled={customerVehicles.length === 0}
                    >
                      <option value="" disabled>
                        Select a vehicle
                      </option>
                      {customerVehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicleName(vehicle)} · {vehicle.plate}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
                  </div>
                </Field>
              </div>

              {selectedCustomer && selectedVehicle && (
                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-brand-100 bg-brand-50/50 p-3.5 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand-700 shadow-sm">
                      <CarFront className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">
                        {vehicleName(selectedVehicle)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink-muted">
                        {selectedVehicle.vin} · {formatOdometer(selectedVehicle.odometer)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="dark">{selectedVehicle.plate}</Badge>
                    <Badge tone="green">
                      <ShieldCheck className="size-3" aria-hidden="true" />
                      WOF {formatDate(selectedVehicle.wofExpiry)}
                    </Badge>
                  </div>
                </div>
              )}
            </section>

            <section className="card p-4 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <ClipboardCheck className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-ink">Checklist template</h2>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      Pick the checklist for this inspection.
                    </p>
                  </div>
                </div>
                <Badge tone="gray">{data.templates.length} available</Badge>
              </div>

              {data.templates.length > 0 ? (
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {data.templates.map((template, index) => {
                    const Icon = templateIcons[index % templateIcons.length];
                    const itemCount = template.sections.reduce(
                      (count, section) => count + section.items.length,
                      0,
                    );
                    const selected = template.id === templateId;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => chooseTemplate(template.id)}
                        className={`relative rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-brand bg-brand-50/60 ring-1 ring-brand"
                            : "border-line bg-white hover:border-brand-200 hover:bg-brand-50/30"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span
                            className={`grid size-9 place-items-center rounded-xl transition ${
                              selected ? "bg-brand text-white" : "bg-canvas text-ink-muted"
                            }`}
                          >
                            <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
                          </span>
                          <span
                            className={`grid size-5 place-items-center rounded-full border ${
                              selected
                                ? "border-brand bg-brand text-white"
                                : "border-line bg-white"
                            }`}
                          >
                            {selected && <CheckCircle2 className="size-3.5" aria-hidden="true" />}
                          </span>
                        </div>
                        <p className="mt-3 text-xs font-bold leading-snug text-ink">
                          {template.name}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-ink-muted">
                          {template.description}
                        </p>
                        <p className="mt-2.5 text-[10px] font-semibold text-brand-700">
                          {itemCount} items
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  No templates available. Reset the demo data from Settings to restore the sample
                  checklists.
                </div>
              )}
            </section>

            <section className="card p-4 sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Gauge className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-ink">Job details</h2>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    These details appear on the report and invoice.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Inspection date" htmlFor="inspection-date" required>
                  <div className="relative">
                    <CalendarDays
                      className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
                      aria-hidden="true"
                    />
                    <input
                      id="inspection-date"
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </Field>

                <Field label="Technician" htmlFor="inspection-technician" required>
                  <div className="relative">
                    <UserRound
                      className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
                      aria-hidden="true"
                    />
                    <select
                      id="inspection-technician"
                      value={technician}
                      onChange={(event) => setTechnician(event.target.value)}
                      className={`${selectClass} pl-10`}
                    >
                      {TECHNICIANS.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
                      aria-hidden="true"
                    />
                  </div>
                </Field>

                <Field label="Odometer" htmlFor="inspection-odometer" required hint="Recorded in kilometres.">
                  <div className="relative">
                    <input
                      id="inspection-odometer"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={odometer}
                      onChange={(event) => setOdometer(event.target.value)}
                      className={`${inputClass} pr-10`}
                      placeholder="0"
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-muted">
                      km
                    </span>
                  </div>
                </Field>
              </div>

              <p className="mt-4 flex items-center gap-1.5 border-t border-line pt-4 text-[11px] text-ink-muted">
                <ShieldCheck className="size-3.5 text-brand-700" aria-hidden="true" />
                Report numbering is handled automatically. This demo does not connect to a real
                vehicle database.
              </p>
            </section>
          </div>
        ) : (
          <div>
            <div className="card p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <CarFront className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">
                      {selectedCustomer?.name} · {selectedVehicle?.plate}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                      {selectedVehicle ? vehicleName(selectedVehicle) : "Vehicle"} ·{" "}
                      {selectedTemplate?.name}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone="dark">{selectedVehicle?.plate}</Badge>
                  <Badge tone="green">{markedCount}/{totalItems} marked</Badge>
                </div>
              </div>
            </div>

            <div className="card mt-3 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold text-ink">Inspection progress</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    {remaining === 0
                      ? "All items have a result — ready for sign-off."
                      : `${remaining} ${remaining === 1 ? "item needs" : "items need"} a result.`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={markRemainingPassed}
                  disabled={remaining === 0}
                >
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  Mark remaining as pass
                </Button>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-canvas" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-300"
                  style={{ width: `${totalItems ? (markedCount / totalItems) * 100 : 0}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-medium text-ink-muted">
                <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-brand" />Pass</span>
                <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-amber-500" />Needs attention</span>
                <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-red-500" />Fail</span>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {selectedTemplate?.sections.map((section, sectionIndex) => (
                <section key={section.id}>
                  <div className="mb-2.5 flex items-center gap-2.5 px-1">
                    <span className="grid size-6 place-items-center rounded-md bg-ink text-[9px] font-bold text-white">
                      {String(sectionIndex + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-sm font-bold tracking-tight text-ink">{section.title}</h2>
                    <span className="ml-auto text-[10px] font-medium text-ink-muted">
                      {section.items.length} {section.items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {section.items.map((item, index) => (
                      <InspectionItemCard
                        key={item.id}
                        item={item}
                        index={index}
                        result={results[item.id]}
                        onChange={(update) => updateResult(item.id, update)}
                        onAddPhoto={(file) => addPhoto(item.id, file)}
                        onRemovePhoto={(photoIndex) => removePhoto(item.id, photoIndex)}
                        photoLoading={photoLoadingId === item.id}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {selectedTemplate && selectedTemplate.sections.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-ink-muted">
                This template has no items. Go back and choose another checklist.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-xl lg:left-72">
        <div
          className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-10"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          <div className="hidden min-w-0 flex-1 sm:block">
            {step === 1 ? (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                  Step 1 of 3
                </p>
                <p className="mt-0.5 truncate text-xs font-semibold text-ink">
                  Next: run the {selectedTemplate?.name ?? "checklist"}
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                  Step 2 of 3 · {markedCount}/{totalItems} marked
                </p>
                <p className="mt-0.5 truncate text-xs font-semibold text-ink">
                  Next: customer signature
                </p>
              </>
            )}
          </div>
          {step === 1 ? (
            <Button size="lg" onClick={goToChecklist} className="w-full sm:w-auto">
              Continue to checklist
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={createAndSign}
              loading={submitting}
              className="w-full sm:w-auto"
            >
              Continue to signature
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
