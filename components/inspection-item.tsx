"use client";

import { AlertTriangle, Camera, Check, Loader2, MessageSquare, X } from "lucide-react";
import type { ChecklistItem, DraftInspectionResult, ItemStatus } from "@/lib/types";
import { cx } from "@/lib/format";

const statusOptions: {
  value: ItemStatus;
  label: string;
  icon: typeof Check;
  selected: string;
}[] = [
  {
    value: "pass",
    label: "Pass",
    icon: Check,
    selected: "border-brand bg-brand text-white shadow-sm",
  },
  {
    value: "attention",
    label: "Needs attention",
    icon: AlertTriangle,
    selected: "border-amber-500 bg-amber-500 text-white shadow-sm",
  },
  {
    value: "fail",
    label: "Fail",
    icon: X,
    selected: "border-red-600 bg-red-600 text-white shadow-sm",
  },
];

export function InspectionItemCard({
  item,
  index,
  result,
  onChange,
  onAddPhoto,
  onRemovePhoto,
  photoLoading,
}: {
  item: ChecklistItem;
  index: number;
  result: DraftInspectionResult;
  onChange: (update: Partial<DraftInspectionResult>) => void;
  onAddPhoto: (file: File) => void;
  onRemovePhoto: (photoIndex: number) => void;
  photoLoading: boolean;
}) {
  const cardTone =
    result.status === "fail"
      ? "border-red-200/80 bg-red-50/20"
      : result.status === "attention"
        ? "border-amber-200/80 bg-amber-50/20"
        : "border-line bg-white";
  const maxPhotos = 4;

  return (
    <div
      data-unmarked={!result.status ? "true" : undefined}
      className={cx("rounded-2xl border p-3.5 transition-colors sm:p-4", cardTone)}
    >
      <div className="flex items-start gap-3">
        <span
          className={cx(
            "mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg text-[10px] font-bold tabular-nums",
            result.status
              ? "bg-white text-ink shadow-sm ring-1 ring-inset ring-line"
              : "bg-canvas text-ink-muted",
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-ink">{item.label}</p>
          {item.type === "measurement" && (
            <div className="mt-2.5 flex items-center gap-2">
              <label htmlFor={`measure-${item.id}`} className="text-[11px] font-medium text-ink-muted">
                Measured
              </label>
              <div className="relative">
                <input
                  id={`measure-${item.id}`}
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  value={result.measurement}
                  onChange={(event) => onChange({ measurement: event.target.value })}
                  placeholder="0.0"
                  className="h-10 w-24 rounded-lg border border-line bg-white pl-3 pr-9 text-base font-semibold tabular-nums text-ink outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-50 sm:text-sm"
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-ink-muted">
                  {item.unit || "mm"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5" role="group" aria-label={`Result for ${item.label}`}>
        {statusOptions.map((option) => {
          const Icon = option.icon;
          const selected = result.status === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() =>
                onChange({ status: selected ? null : option.value })
              }
              className={cx(
                "flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl border px-1.5 py-2 text-[10px] font-bold leading-tight transition sm:flex-row sm:gap-1.5 sm:text-xs",
                selected
                  ? option.selected
                  : "border-line bg-white text-ink-muted hover:border-brand-200 hover:bg-brand-50 hover:text-ink",
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={selected ? 2.7 : 2} aria-hidden="true" />
              <span className="text-center">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <MessageSquare
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted/60"
            aria-hidden="true"
          />
          <label htmlFor={`notes-${item.id}`} className="sr-only">
            Notes for {item.label}
          </label>
          <input
            id={`notes-${item.id}`}
            type="text"
            value={result.notes}
            onChange={(event) => onChange({ notes: event.target.value })}
            placeholder="Add a note (optional)"
            className="h-10 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-base text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand-300 focus:ring-4 focus:ring-brand-50 sm:text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {result.photos.length < maxPhotos ? (
            <label
              className={cx(
                "flex h-10 min-w-[122px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-line bg-white px-3 text-[11px] font-semibold text-ink-soft transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800",
                photoLoading && "pointer-events-none opacity-60",
              )}
            >
              {photoLoading ? (
                <Loader2 className="size-3.5 animate-spin text-brand" aria-hidden="true" />
              ) : (
                <Camera className="size-3.5" aria-hidden="true" />
              )}
              {photoLoading ? "Adding photo" : "Add photo"}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) onAddPhoto(file);
                }}
                disabled={photoLoading}
              />
            </label>
          ) : (
            <span className="flex h-10 items-center rounded-xl bg-canvas px-3 text-[10px] font-medium text-ink-muted">
              Photo limit reached
            </span>
          )}
          {result.photos.length > 0 && (
            <span className="text-[10px] font-semibold text-ink-muted">
              {result.photos.length}/{maxPhotos}
            </span>
          )}
        </div>
      </div>

      {result.photos.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {result.photos.map((photo, photoIndex) => (
            <div
              key={`${photo.slice(-20)}-${photoIndex}`}
              className="group relative size-16 overflow-hidden rounded-xl border border-line bg-canvas"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt={`${item.label} photo ${photoIndex + 1}`}
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemovePhoto(photoIndex)}
                aria-label={`Remove photo ${photoIndex + 1} from ${item.label}`}
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/70 text-white shadow-sm backdrop-blur-sm transition hover:bg-red-600"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
