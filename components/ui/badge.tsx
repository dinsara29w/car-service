import type { ReactNode } from "react";
import { cx } from "@/lib/format";

type Tone = "green" | "amber" | "red" | "gray" | "brand" | "dark";

const tones: Record<Tone, string> = {
  green: "bg-brand-50 text-brand-800 ring-brand-100",
  amber: "bg-amber-50 text-amber-800 ring-amber-200/70",
  red: "bg-red-50 text-red-700 ring-red-200/70",
  gray: "bg-slate-50 text-slate-600 ring-slate-200",
  brand: "bg-brand text-white ring-brand",
  dark: "bg-ink text-white ring-ink",
};

const dots: Record<Tone, string> = {
  green: "bg-brand",
  amber: "bg-amber-500",
  red: "bg-red-500",
  gray: "bg-slate-400",
  brand: "bg-white",
  dark: "bg-brand",
};

export function Badge({
  tone = "gray",
  dot = false,
  children,
  className,
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cx("size-1.5 rounded-full", dots[tone])} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: "pass" | "attention" | "fail" }) {
  const config = {
    pass: { tone: "green" as const, label: "Pass" },
    attention: { tone: "amber" as const, label: "Needs attention" },
    fail: { tone: "red" as const, label: "Fail" },
  }[status];
  return (
    <Badge tone={config.tone} dot>
      {config.label}
    </Badge>
  );
}
