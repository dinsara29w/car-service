import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Customer, Inspection, Vehicle } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { getInspectionCounts, vehicleName } from "@/lib/inspection";

export function ReportRow({
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
    <Link
      href={`/inspections/${inspection.id}`}
      className="group flex min-h-[84px] items-start gap-3 px-4 py-4 transition-colors hover:bg-brand-50/40 sm:px-5"
    >
      <Avatar name={customer.name} size="md" className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-sm font-bold text-ink">{customer.name}</p>
          <span className="text-[10px] font-semibold text-ink-muted/70">
            {inspection.reportNumber}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs font-medium text-ink-muted">
          {vehicleName(vehicle)} · {vehicle.plate}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {counts.fail > 0 && (
            <Badge tone="red" dot>
              {counts.fail} failed
            </Badge>
          )}
          {counts.attention > 0 && (
            <Badge tone="amber" dot>
              {counts.attention} to review
            </Badge>
          )}
          {counts.fail === 0 && counts.attention === 0 && (
            <Badge tone="green" dot>
              All passed
            </Badge>
          )}
          <span className="text-[11px] text-ink-muted">{formatDate(inspection.date)}</span>
        </div>
      </div>
      <span className="mt-2 grid size-7 shrink-0 place-items-center rounded-full bg-canvas text-ink-muted transition group-hover:bg-white group-hover:text-brand-700">
        <ChevronRight className="size-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
