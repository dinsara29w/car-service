import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
  backHref,
  backLabel = "Back",
  eyebrow,
  onBack,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
  onBack?: () => void;
}) {
  const backClass =
    "mb-4 inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-ink-muted transition-colors hover:text-ink";
  return (
    <div className="mb-6 lg:mb-8">
      {backHref && !onBack && (
        <Link href={backHref} className={backClass}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          {backLabel}
        </Link>
      )}
      {onBack && (
        <button type="button" onClick={onBack} className={backClass}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          {backLabel}
        </button>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-bold tracking-[-0.025em] text-ink sm:text-[28px]">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">{description}</p>
          )}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
    </div>
  );
}
