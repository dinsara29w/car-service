import { Check } from "lucide-react";
import { cx } from "@/lib/format";

export function StepProgress({
  current,
  steps = ["Job details", "Checklist", "Sign-off"],
}: {
  current: number;
  steps?: string[];
}) {
  return (
    <ol className="mb-6 flex items-start" aria-label={`Step ${current} of ${steps.length}`}>
      {steps.map((label, index) => {
        const step = index + 1;
        const complete = step < current;
        const active = step === current;
        return (
          <li key={label} className="relative flex flex-1 flex-col items-center text-center">
            {index < steps.length - 1 && (
              <span
                className={cx(
                  "absolute left-1/2 top-3 h-px w-full",
                  complete ? "bg-brand-300" : "bg-line",
                )}
                aria-hidden="true"
              />
            )}
            <span
              className={cx(
                "relative z-10 grid size-6 place-items-center rounded-full text-[10px] font-bold transition",
                complete && "bg-brand text-white",
                active && "bg-ink text-white ring-4 ring-white",
                !complete && !active && "border border-line bg-white text-ink-muted",
              )}
              aria-current={active ? "step" : undefined}
            >
              {complete ? <Check className="size-3" strokeWidth={3} aria-hidden="true" /> : step}
            </span>
            <span
              className={cx(
                "mt-1.5 text-[10px] font-semibold leading-tight",
                active ? "text-ink" : "text-ink-muted",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
