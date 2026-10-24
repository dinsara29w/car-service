import type { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cx } from "@/lib/format";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
