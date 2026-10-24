import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link, { type LinkProps } from "next/link";
import { Loader2 } from "lucide-react";
import { cx } from "@/lib/format";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "dark" | "danger" | "amber";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-600 shadow-sm",
  secondary: "bg-brand-50 text-brand-800 hover:bg-brand-100",
  outline: "border border-line bg-white text-ink hover:border-brand-200 hover:bg-brand-50",
  ghost: "text-ink-soft hover:bg-brand-50 hover:text-ink",
  dark: "bg-ink text-white hover:bg-brand-900 shadow-sm",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  amber: "bg-amber-500 text-white hover:bg-amber-600 shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-[52px] px-5 text-[15px]",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cx(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
