"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  ListChecks,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, inputClass, selectClass } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/format";
import type { ChecklistItem, ChecklistSection } from "@/lib/types";

function makeId(prefix: string) {
  const value =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}

function cloneSections(sections: ChecklistSection[]): ChecklistSection[] {
  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({ ...item })),
  }));
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid size-10 place-items-center rounded-xl border transition disabled:pointer-events-none disabled:opacity-30 ${
        tone === "danger"
          ? "border-transparent text-ink-muted hover:border-red-100 hover:bg-red-50 hover:text-red-600"
          : "border-line bg-white text-ink-muted hover:border-brand-200 hover:bg-brand-50 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export default function TemplateEditorPage() {
  const params = useParams<{ id: string }>();
  const templateId = typeof params.id === "string" ? params.id : "";
  const { data, actions } = useStore();
  const { showToast } = useToast();
  const template = data.templates.find((entry) => entry.id === templateId);

  const [name, setName] = useState(template?.name ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [sections, setSections] = useState<ChecklistSection[]>(() =>
    template ? cloneSections(template.sections) : [],
  );
  const [sectionToRemove, setSectionToRemove] = useState<ChecklistSection | null>(null);

  useEffect(() => {
    if (!template) return;
    setName(template.name);
    setDescription(template.description);
    setSections(cloneSections(template.sections));
    // Only reset the editor when switching templates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const snapshot = useMemo(
    () =>
      JSON.stringify({
        name: template?.name ?? "",
        description: template?.description ?? "",
        sections: template?.sections ?? [],
      }),
    [template],
  );
  const current = JSON.stringify({ name, description, sections });
  const dirty = snapshot !== current;
  const totalItems = sections.reduce((count, section) => count + section.items.length, 0);
  const invalid =
    !name.trim() ||
    sections.length === 0 ||
    totalItems === 0 ||
    sections.some((section) => section.items.some((item) => !item.label.trim()));

  useEffect(() => {
    if (!dirty) return;
    const listener = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", listener);
    return () => window.removeEventListener("beforeunload", listener);
  }, [dirty]);

  function updateSection(sectionId: string, update: Partial<ChecklistSection>) {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.id === sectionId ? { ...section, ...update } : section,
      ),
    );
  }

  function updateItem(sectionId: string, itemId: string, update: Partial<ChecklistItem>) {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, ...update } : item,
              ),
            }
          : section,
      ),
    );
  }

  function addItem(sectionId: string) {
    const newItem: ChecklistItem = {
      id: makeId("item"),
      label: "New checklist item",
      type: "check",
    };
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.id === sectionId
          ? { ...section, items: [...section.items, newItem] }
          : section,
      ),
    );
  }

  function removeItem(sectionId: string, itemId: string) {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.id === sectionId
          ? { ...section, items: section.items.filter((item) => item.id !== itemId) }
          : section,
      ),
    );
  }

  function moveItem(sectionId: string, index: number, direction: -1 | 1) {
    setSections((currentSections) =>
      currentSections.map((section) => {
        if (section.id !== sectionId) return section;
        const target = index + direction;
        if (target < 0 || target >= section.items.length) return section;
        const items = [...section.items];
        [items[index], items[target]] = [items[target], items[index]];
        return { ...section, items };
      }),
    );
  }

  function moveSection(index: number, direction: -1 | 1) {
    setSections((currentSections) => {
      const target = index + direction;
      if (target < 0 || target >= currentSections.length) return currentSections;
      const next = [...currentSections];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addSection() {
    setSections((currentSections) => [
      ...currentSections,
      {
        id: makeId("section"),
        title: "New section",
        items: [
          {
            id: makeId("item"),
            label: "New checklist item",
            type: "check",
          },
        ],
      },
    ]);
  }

  function removeSection() {
    if (!sectionToRemove) return;
    setSections((currentSections) =>
      currentSections.filter((section) => section.id !== sectionToRemove.id),
    );
    showToast(`"${sectionToRemove.title}" removed. Save to keep the change.`, "info");
    setSectionToRemove(null);
  }

  function resetChanges() {
    if (!template) return;
    setName(template.name);
    setDescription(template.description);
    setSections(cloneSections(template.sections));
    showToast("Unsaved changes discarded.", "info");
  }

  function handleSave() {
    if (!template) return;
    if (invalid) {
      showToast("Add a template name, at least one item, and a label for every item.", "error");
      return;
    }
    const cleanSections = sections.map((section) => ({
      ...section,
      title: section.title.trim() || "Untitled section",
      items: section.items.map((item) => ({
        ...item,
        label: item.label.trim(),
        unit: item.type === "measurement" ? item.unit?.trim() || "mm" : undefined,
      })),
    }));
    actions.saveTemplate({
      ...template,
      name: name.trim(),
      description: description.trim() || "Workshop inspection checklist.",
      sections: cleanSections,
    });
    setName(name.trim());
    setDescription(description.trim() || "Workshop inspection checklist.");
    setSections(cleanSections);
    showToast("Checklist template saved.");
  }

  if (!template) {
    return (
      <div className="animate-fade-up">
        <PageHeader title="Template not found" backHref="/templates" backLabel="Templates" />
        <EmptyState
          icon={ListChecks}
          title="We couldn't find that template"
          description="It may have been removed when the demo data was reset."
          action={<ButtonLink href="/templates">Back to templates</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        backHref="/templates"
        backLabel="Checklist templates"
        eyebrow="Template editor"
        title={name || "Untitled template"}
        description={`${totalItems} items across ${sections.length} ${
          sections.length === 1 ? "section" : "sections"
        } · Last saved ${formatDate(template.updatedAt)}`}
        action={
          <div className="flex items-center gap-2">
            {dirty && (
              <Button variant="outline" size="md" onClick={resetChanges} className="hidden sm:inline-flex">
                <RotateCcw className="size-4" aria-hidden="true" />
                Discard
              </Button>
            )}
            <Button onClick={handleSave} disabled={!dirty || invalid}>
              <Save className="size-4" aria-hidden="true" />
              {dirty ? "Save changes" : "Saved"}
            </Button>
          </div>
        }
      />

      {invalid && dirty && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
          Every item needs a label, and the template needs a name and at least one item before it
          can be saved.
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_280px] xl:items-start">
        <div className="space-y-4">
          <section className="card p-4 sm:p-5">
            <div className="grid gap-4">
              <Field label="Template name" htmlFor="template-name" required>
                <input
                  id="template-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClass}
                  placeholder="e.g. 20-Point Pre-Service Check"
                />
              </Field>
              <Field
                label="Description"
                htmlFor="template-description"
                hint="Shown to technicians when choosing a checklist."
              >
                <textarea
                  id="template-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-line bg-white px-3.5 py-3 text-base text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand-300 focus:ring-4 focus:ring-brand-50 sm:text-sm"
                  placeholder="What this checklist covers"
                />
              </Field>
            </div>
          </section>

          {sections.map((section, sectionIndex) => (
            <section key={section.id} className="card overflow-hidden">
              <div className="flex items-start gap-3 border-b border-line bg-canvas/50 px-4 py-3.5 sm:px-5">
                <span className="mt-1.5 hidden text-[10px] font-bold tabular-nums text-ink-muted/60 sm:block">
                  {String(sectionIndex + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <label htmlFor={`section-${section.id}`} className="sr-only">
                    Section title
                  </label>
                  <input
                    id={`section-${section.id}`}
                    value={section.title}
                    onChange={(event) => updateSection(section.id, { title: event.target.value })}
                    className="w-full rounded-lg border border-transparent bg-transparent px-0 py-1 text-sm font-bold text-ink outline-none transition hover:border-line hover:bg-white focus:border-brand-300 focus:bg-white focus:px-2 focus:ring-2 focus:ring-brand-50"
                    placeholder="Section title"
                  />
                  <p className="mt-0.5 text-[10px] text-ink-muted">
                    {section.items.length} {section.items.length === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton
                    label="Move section up"
                    onClick={() => moveSection(sectionIndex, -1)}
                    disabled={sectionIndex === 0}
                  >
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label="Move section down"
                    onClick={() => moveSection(sectionIndex, 1)}
                    disabled={sectionIndex === sections.length - 1}
                  >
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label={`Remove ${section.title}`}
                    onClick={() => setSectionToRemove(section)}
                    disabled={sections.length === 1}
                    tone="danger"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </IconButton>
                </div>
              </div>

              <div className="space-y-2.5 p-3.5 sm:p-4">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-line bg-white p-3 transition hover:border-brand-100"
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-2 flex items-center gap-1 text-ink-muted/40">
                        <GripVertical className="size-4" aria-hidden="true" />
                        <span className="w-4 text-center text-[10px] font-bold tabular-nums">
                          {itemIndex + 1}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <label htmlFor={`item-${item.id}`} className="sr-only">
                          Item label
                        </label>
                        <input
                          id={`item-${item.id}`}
                          value={item.label}
                          onChange={(event) =>
                            updateItem(section.id, item.id, { label: event.target.value })
                          }
                          className="h-10 w-full rounded-lg border border-transparent bg-canvas px-3 text-base font-medium text-ink outline-none transition placeholder:text-ink-muted/50 hover:border-line focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-50 sm:text-sm"
                          placeholder="Checklist item"
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 pl-5 sm:pl-7">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="sr-only" htmlFor={`type-${item.id}`}>
                          Item type
                        </label>
                        <select
                          id={`type-${item.id}`}
                          value={item.type}
                          onChange={(event) =>
                            updateItem(section.id, item.id, {
                              type: event.target.value as ChecklistItem["type"],
                              unit: event.target.value === "measurement" ? item.unit || "mm" : undefined,
                            })
                          }
                          className="h-8 rounded-lg border border-line bg-white px-2 text-xs font-medium text-ink-soft outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-50"
                        >
                          <option value="check">Pass / attention / fail</option>
                          <option value="measurement">Measurement</option>
                        </select>
                        {item.type === "measurement" && (
                          <div className="flex items-center gap-1">
                            <label
                              htmlFor={`unit-${item.id}`}
                              className="text-[10px] font-medium text-ink-muted"
                            >
                              Unit
                            </label>
                            <input
                              id={`unit-${item.id}`}
                              value={item.unit ?? ""}
                              onChange={(event) =>
                                updateItem(section.id, item.id, { unit: event.target.value })
                              }
                              className="h-8 w-14 rounded-lg border border-line bg-white px-2 text-xs font-semibold text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-50"
                              placeholder="mm"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <IconButton
                          label="Move item up"
                          onClick={() => moveItem(section.id, itemIndex, -1)}
                          disabled={itemIndex === 0}
                        >
                          <ArrowUp className="size-4" aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          label="Move item down"
                          onClick={() => moveItem(section.id, itemIndex, 1)}
                          disabled={itemIndex === section.items.length - 1}
                        >
                          <ArrowDown className="size-4" aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          label={`Remove ${item.label || "item"}`}
                          onClick={() => removeItem(section.id, item.id)}
                          tone="danger"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addItem(section.id)}
                  className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line text-xs font-semibold text-ink-muted transition hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-800"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  Add item to {section.title || "section"}
                </button>
              </div>
            </section>
          ))}

          <button
            type="button"
            onClick={addSection}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add section
          </button>
        </div>

        <aside className="card p-5 xl:sticky xl:top-6">
          <p className="label-caps">Editor tips</p>
          <ul className="mt-3 space-y-3 text-xs leading-relaxed text-ink-muted">
            <li className="flex gap-2.5">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
              Use the arrow buttons to reorder items. The order here is the order technicians see.
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
              Switch an item to <span className="font-semibold text-ink">Measurement</span> to
              capture values like tread depth or pad thickness.
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
              Changes only affect new inspections. Completed reports keep their original checklist.
            </li>
          </ul>
          <div className="mt-4 border-t border-line pt-4">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-ink-muted">Items in template</span>
              <Badge tone="green">{totalItems}</Badge>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-ink-muted">Sections</span>
              <Badge tone="gray">{sections.length}</Badge>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!dirty || invalid}
            className="mt-4 w-full"
            variant={dirty ? "primary" : "outline"}
          >
            <Save className="size-4" aria-hidden="true" />
            {dirty ? "Save changes" : "All changes saved"}
          </Button>
          {dirty && (
            <button
              type="button"
              onClick={resetChanges}
              className="mt-2 flex min-h-9 w-full items-center justify-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Discard changes
            </button>
          )}
        </aside>
      </div>

      <Dialog
        open={!!sectionToRemove}
        onClose={() => setSectionToRemove(null)}
        title="Remove this section?"
        description={`"${
          sectionToRemove?.title ?? "Section"
        }" and its items will be removed. Save to keep this change.`}
      >
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setSectionToRemove(null)}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={removeSection}>
            <Trash2 className="size-4" aria-hidden="true" />
            Remove section
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
