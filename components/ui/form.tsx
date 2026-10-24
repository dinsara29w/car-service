import type { ReactNode } from "react";
import { cx } from "@/lib/format";

export const inputClass =
  "h-12 w-full rounded-xl border border-line bg-white px-3.5 text-base text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand-300 focus:ring-4 focus:ring-brand-50 disabled:bg-slate-50 disabled:text-ink-muted sm:text-sm";

export const selectClass =
  "h-12 w-full appearance-none rounded-xl border border-line bg-white px-3.5 pr-10 text-base text-ink outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-50 sm:text-sm";

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
  required,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={cx("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-center gap-1 text-xs font-bold text-ink">
        {label}
        {required && <span className="text-brand">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] leading-relaxed text-ink-muted">{hint}</p>}
    </div>
  );
}
