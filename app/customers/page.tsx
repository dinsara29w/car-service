"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CarFront, ChevronRight, Plus, SearchX, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useStore } from "@/lib/store";
import { formatDate, formatOdometer } from "@/lib/format";
import { vehicleName } from "@/lib/inspection";

export default function CustomersPage() {
  const { data } = useStore();
  const [query, setQuery] = useState("");

  const entries = useMemo(
    () =>
      data.customers.map((customer) => ({
        customer,
        vehicles: data.vehicles.filter((vehicle) => vehicle.customerId === customer.id),
      })),
    [data.customers, data.vehicles],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return entries;
    return entries.filter(({ customer, vehicles }) => {
      const haystack = [
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        ...vehicles.flatMap((vehicle) => [
          vehicle.make,
          vehicle.model,
          vehicle.plate,
          vehicle.vin,
          String(vehicle.year),
        ]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [entries, query]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Customers & vehicles"
        description="Every vehicle and its service history in one place."
        action={
          <ButtonLink href="/inspections/new">
            <Plus className="size-4" strokeWidth={2.5} aria-hidden="true" />
            New inspection
          </ButtonLink>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search name, plate or vehicle"
          label="Search customers and vehicles"
          className="w-full sm:max-w-sm"
        />
        <p className="text-xs font-medium text-ink-muted">
          {filtered.length} of {entries.length} customers
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={Users}
          title="No customers yet"
          description="Add your first customer to start recording inspections."
        />
      ) : filtered.length > 0 ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ customer, vehicles }) => {
            const vehicle = vehicles[0];
            return (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="card card-hover group flex flex-col overflow-hidden"
              >
                <div className="flex items-start gap-3 p-4 sm:p-5">
                  <Avatar name={customer.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{customer.name}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">{customer.phone}</p>
                    <p className="mt-0.5 truncate text-[11px] text-ink-muted/80">{customer.email}</p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-ink-muted/40 transition group-hover:text-brand-700" aria-hidden="true" />
                </div>

                {vehicle ? (
                  <div className="mx-4 mb-4 rounded-xl border border-line bg-canvas/70 p-3 sm:mx-5 sm:mb-5">
                    <div className="flex items-center gap-2">
                      <CarFront className="size-3.5 shrink-0 text-brand-700" aria-hidden="true" />
                      <p className="min-w-0 truncate text-xs font-semibold text-ink">
                        {vehicleName(vehicle)}
                      </p>
                      <Badge tone="gray" className="ml-auto px-2 py-0.5 text-[9px]">
                        {vehicle.plate}
                      </Badge>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-muted">
                      <span>{formatOdometer(vehicle.odometer)}</span>
                      <span className="inline-flex items-center gap-1">
                        <ShieldCheck className="size-3" aria-hidden="true" />
                        WOF {formatDate(vehicle.wofExpiry)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="mx-4 mb-4 rounded-xl bg-canvas p-3 text-xs text-ink-muted sm:mx-5 sm:mb-5">
                    No vehicle on file
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          icon={SearchX}
          title="No customers found"
          description={`Nothing matches “${query}”. Try a name, plate, make or model.`}
          action={
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Clear search
            </button>
          }
        />
      )}
    </div>
  );
}
