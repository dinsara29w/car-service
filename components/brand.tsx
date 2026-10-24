import { Check } from "lucide-react";
import { cx } from "@/lib/format";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "relative grid size-10 shrink-0 place-items-center rounded-[13px] bg-brand text-white shadow-[0_4px_12px_rgba(34,165,89,0.25)]",
        className,
      )}
      aria-hidden="true"
    >
      <Check className="size-[55%]" strokeWidth={3.5} />
      <span className="absolute right-[22%] top-[19%] size-1 rounded-full bg-white/90" />
    </span>
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <div className={cx("flex min-w-0 items-center gap-3", className)}>
      <BrandMark />
      <div className="min-w-0">
        <p className="truncate text-[15px] font-bold leading-tight tracking-[-0.02em] text-ink">
          Demo Auto Workshop
        </p>
        <p className="mt-0.5 text-[11px] font-medium leading-tight text-ink-muted">
          Auckland, New Zealand
        </p>
      </div>
    </div>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex h-6 items-center rounded-full border border-amber-200 bg-amber-50 px-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-amber-700",
        className,
      )}
    >
      Demo
    </span>
  );
}
