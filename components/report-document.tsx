import { Check, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { SHOP } from "@/lib/constants";
import { formatDate, formatOdometer } from "@/lib/format";
import { getInspectionCounts, vehicleName } from "@/lib/inspection";
import type { Customer, Inspection, Vehicle } from "@/lib/types";

export function ReportDocument({
  inspection,
  customer,
  vehicle,
}: {
  inspection: Inspection;
  customer: Customer;
  vehicle: Vehicle;
}) {
  const counts = getInspectionCounts(inspection);

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <header className="relative overflow-hidden bg-ink px-5 py-5 text-white sm:px-7 sm:py-6">
        <div
          className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-brand/20 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <BrandMark className="size-9 rounded-[11px]" />
            <div>
              <p className="text-sm font-bold tracking-tight">{SHOP.name}</p>
              <p className="mt-0.5 text-[10px] text-white/50">
                {SHOP.address}, {SHOP.city}
              </p>
              <p className="mt-0.5 text-[10px] text-white/50">
                {SHOP.phone} · WOF · Servicing · Repairs
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brand-200">
              Inspection report
            </p>
            <p className="mt-1 text-sm font-bold">{inspection.reportNumber}</p>
            <p className="mt-0.5 text-[10px] text-white/50">{formatDate(inspection.date)}</p>
          </div>
        </div>
      </header>

      <div className="px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold tracking-[-0.02em] text-ink sm:text-xl">
              Vehicle inspection report
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">
              Prepared for {customer.name} · {inspection.templateName}
            </p>
          </div>
          <Badge tone={inspection.status === "completed" ? "green" : "amber"} dot>
            {inspection.status === "completed" ? "Completed" : "Awaiting signature"}
          </Badge>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-canvas/60 p-3.5">
            <p className="label-caps">Vehicle</p>
            <p className="mt-1.5 text-sm font-bold text-ink">{vehicleName(vehicle)}</p>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              {vehicle.plate} · {vehicle.colour}
            </p>
            <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2 text-[10px]">
              <div>
                <dt className="text-ink-muted">Odometer</dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {formatOdometer(inspection.odometer)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-muted">WOF expires</dt>
                <dd className="mt-0.5 inline-flex items-center gap-1 font-semibold text-ink">
                  <ShieldCheck className="size-3 text-brand" aria-hidden="true" />
                  {formatDate(vehicle.wofExpiry)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-ink-muted">VIN</dt>
                <dd className="mt-0.5 truncate font-mono text-[10px] text-ink">{vehicle.vin}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-line bg-canvas/60 p-3.5">
            <p className="label-caps">Customer</p>
            <p className="mt-1.5 text-sm font-bold text-ink">{customer.name}</p>
            <p className="mt-0.5 text-[11px] text-ink-muted">{customer.phone}</p>
            <p className="mt-0.5 truncate text-[11px] text-ink-muted">{customer.email}</p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-ink-muted">{customer.address}</p>
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-xl bg-brand-50/60 px-3.5 py-3 text-[10px] sm:grid-cols-4">
          <div>
            <p className="label-caps">Technician</p>
            <p className="mt-1 text-xs font-semibold text-ink">{inspection.technician}</p>
          </div>
          <div>
            <p className="label-caps">Inspection date</p>
            <p className="mt-1 text-xs font-semibold text-ink">{formatDate(inspection.date)}</p>
          </div>
          <div>
            <p className="label-caps">Odometer</p>
            <p className="mt-1 text-xs font-semibold text-ink">
              {formatOdometer(inspection.odometer)}
            </p>
          </div>
          <div>
            <p className="label-caps">Checklist</p>
            <p className="mt-1 truncate text-xs font-semibold text-ink">{inspection.templateName}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Passed", value: counts.pass, className: "bg-brand-50 text-brand-800" },
            { label: "Needs attention", value: counts.attention, className: "bg-amber-50 text-amber-800" },
            { label: "Failed", value: counts.fail, className: "bg-red-50 text-red-700" },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl px-3 py-2.5 ${item.className}`}>
              <p className="text-lg font-bold leading-none">{item.value}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-wide">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-5">
          {inspection.templateSections.map((section) => (
            <section key={section.id}>
              <div className="mb-2 flex items-center justify-between border-b border-line pb-2">
                <h3 className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-brand-800">
                  {section.title}
                </h3>
                <span className="text-[9px] text-ink-muted">{section.items.length} items</span>
              </div>
              <div className="space-y-2">
                {section.items.map((item) => {
                  const result = inspection.results.find((entry) => entry.itemId === item.id);
                  if (!result) return null;
                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-3 ${
                        result.status === "fail"
                          ? "border-red-100 bg-red-50/40"
                          : result.status === "attention"
                            ? "border-amber-100 bg-amber-50/40"
                            : "border-line/80 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 text-xs font-semibold leading-snug text-ink">
                          {item.label}
                        </p>
                        <StatusBadge status={result.status} />
                      </div>
                      {(result.measurement || result.notes) && (
                        <div className="mt-1.5 space-y-1">
                          {result.measurement && (
                            <p className="text-[10px] font-medium text-ink-muted">
                              Measured:{" "}
                              <span className="font-semibold text-ink">
                                {result.measurement}
                                {item.unit ? ` ${item.unit}` : ""}
                              </span>
                            </p>
                          )}
                          {result.notes && (
                            <p className="text-[10px] leading-relaxed text-ink-muted">
                              {result.notes}
                            </p>
                          )}
                        </div>
                      )}
                      {result.photos.length > 0 && (
                        <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                          {result.photos.map((photo, index) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={`${item.id}-${index}`}
                              src={photo}
                              alt={`${item.label} — photo ${index + 1}`}
                              className="aspect-[4/3] w-full rounded-lg border border-white object-cover shadow-sm"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-line bg-canvas/40 p-3.5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-ink">Customer sign-off</p>
              {inspection.signature ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={inspection.signature}
                    alt={`Signature of ${customer.name}`}
                    className="mt-1 h-16 w-full max-w-[260px] object-contain object-left"
                  />
                  <p className="mt-1 border-t border-line pt-1.5 text-[9px] text-ink-muted">
                    {customer.name} · Signed {formatDate(inspection.signedAt)}
                  </p>
                </>
              ) : (
                <div className="mt-3 rounded-lg border border-dashed border-amber-200 bg-amber-50/50 p-3 text-[10px] font-medium text-amber-800">
                  Signature pending — collect the customer signature to complete this report.
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-ink-muted">
              <Check className="size-3 text-brand" aria-hidden="true" />
              Recorded by {inspection.technician}
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-line bg-white px-5 py-3 text-[9px] text-ink-muted sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>
            {SHOP.name} · GST {SHOP.gstNumber} · {SHOP.email}
          </span>
          <span>Demo document by WebMint</span>
        </div>
      </footer>
    </article>
  );
}
