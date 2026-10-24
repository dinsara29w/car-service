import { cx, initials } from "@/lib/format";

const sizes = {
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-14 text-base",
};

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "grid shrink-0 place-items-center rounded-full bg-brand-50 font-bold text-brand-800 ring-1 ring-inset ring-brand-100",
        sizes[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
