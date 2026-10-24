"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, CircleDot, ClipboardCheck, Disc, ListChecks, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/format";

const templateIcons = [ClipboardCheck, Disc, CircleDot];

export default function TemplatesPage() {
  const { data } = useStore();
  const [noticeVisible, setNoticeVisible] = useState(true);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Checklist templates"
        description="Reusable inspection checklists your team can run on any phone."
        action={
          <ButtonLink href="/inspections/new">
            <Plus className="size-4" strokeWidth={2.5} aria-hidden="true" />
            New inspection
          </ButtonLink>
        }
      />

      {noticeVisible && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3.5">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-white text-brand-700 shadow-sm">
            <ListChecks className="size-3.5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-brand-900">Editable for the demo</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-brand-800/70">
              Open a template to rename, add, remove or reorder items. Changes save to this
              browser.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNoticeVisible(false)}
            className="text-[11px] font-bold text-brand-700 hover:text-brand-900"
          >
            Got it
          </button>
        </div>
      )}

      {data.templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.templates.map((template, index) => {
            const Icon = templateIcons[index % templateIcons.length];
            const itemCount = template.sections.reduce(
              (count, section) => count + section.items.length,
              0,
            );
            return (
              <Link
                key={template.id}
                href={`/templates/${template.id}`}
                className="card card-hover group flex flex-col p-5"
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                    <Icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <Badge tone="gray">Template</Badge>
                </div>
                <h2 className="mt-4 text-base font-bold leading-snug tracking-tight text-ink">
                  {template.name}
                </h2>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                  {template.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <Badge tone="green">{itemCount} items</Badge>
                  <Badge tone="gray">{template.sections.length} sections</Badge>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-line pt-3.5">
                  <p className="text-[10px] text-ink-muted">
                    Updated {formatDate(template.updatedAt)}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700">
                    Edit checklist
                    <ChevronRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={ListChecks}
          title="No checklist templates"
          description="Templates will appear here. Reset demo data from Settings to restore the samples."
        />
      )}
    </div>
  );
}
