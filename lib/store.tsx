"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DATA_VERSION, STORAGE_KEY } from "@/lib/constants";
import { addDaysISO, todayISO } from "@/lib/format";
import { cloneSections, createSeedData } from "@/lib/seed";
import { findingPrice } from "@/lib/inspection";
import type {
  ChecklistTemplate,
  DemoData,
  Inspection,
  NewInspectionInput,
  Quote,
  QuoteLine,
} from "@/lib/types";

interface CreateQuoteResult {
  quote: Quote;
  existing: boolean;
}

interface StoreActions {
  hydrated: boolean;
  createInspection: (input: NewInspectionInput) => Inspection | null;
  saveSignature: (inspectionId: string, signature: string) => Inspection | null;
  saveTemplate: (template: ChecklistTemplate) => void;
  createQuoteFromInspection: (inspectionId: string) => CreateQuoteResult | null;
  updateQuoteLines: (quoteId: string, items: QuoteLine[]) => void;
  convertQuoteToInvoice: (quoteId: string) => Quote | null;
  setInvoicePaid: (quoteId: string, paid: boolean) => void;
  resetDemoData: () => void;
}

interface StoreValue {
  data: DemoData;
  actions: StoreActions;
}

const StoreContext = createContext<StoreValue | null>(null);

function isDemoData(value: unknown): value is DemoData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DemoData>;
  return (
    candidate.version === DATA_VERSION &&
    Array.isArray(candidate.customers) &&
    Array.isArray(candidate.vehicles) &&
    Array.isArray(candidate.templates) &&
    Array.isArray(candidate.inspections) &&
    Array.isArray(candidate.quotes) &&
    !!candidate.counters
  );
}

function readStoredData(): DemoData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isDemoData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function newId(prefix: string): string {
  const value =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DemoData>(() => createSeedData());
  const [hydrated, setHydrated] = useState(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    const stored = readStoredData();
    if (stored) {
      setData(stored);
    } else {
      const seed = createSeedData();
      setData(seed);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      } catch {
        // The demo still works in memory when storage is unavailable.
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage quota issues in this demo.
    }
  }, [data, hydrated]);

  const createInspection = useCallback((input: NewInspectionInput): Inspection | null => {
    const current = dataRef.current;
    const template = current.templates.find((entry) => entry.id === input.templateId);
    if (!template) return null;

    const inspection: Inspection = {
      id: newId("insp"),
      reportNumber: `RPT-${String(current.counters.report).padStart(4, "0")}`,
      customerId: input.customerId,
      vehicleId: input.vehicleId,
      templateId: template.id,
      templateName: template.name,
      templateSections: cloneSections(template.sections),
      technician: input.technician,
      date: input.date,
      odometer: input.odometer,
      results: input.results,
      signature: null,
      signedAt: null,
      createdAt: new Date().toISOString(),
      status: "awaiting_signature",
    };

    const next: DemoData = {
      ...current,
      inspections: [inspection, ...current.inspections],
      counters: { ...current.counters, report: current.counters.report + 1 },
    };
    dataRef.current = next;
    setData(next);
    return inspection;
  }, []);

  const saveSignature = useCallback(
    (inspectionId: string, signature: string): Inspection | null => {
      const current = dataRef.current;
      const inspection = current.inspections.find((entry) => entry.id === inspectionId);
      if (!inspection) return null;
      const signedAt = new Date().toISOString();
      const updated: Inspection = {
        ...inspection,
        signature,
        signedAt,
        status: "completed",
      };
      const next: DemoData = {
        ...current,
        inspections: current.inspections.map((entry) =>
          entry.id === inspectionId ? updated : entry,
        ),
        vehicles: current.vehicles.map((vehicle) =>
          vehicle.id === inspection.vehicleId
            ? { ...vehicle, odometer: inspection.odometer }
            : vehicle,
        ),
      };
      dataRef.current = next;
      setData(next);
      return updated;
    },
    [],
  );

  const saveTemplate = useCallback((template: ChecklistTemplate) => {
    const current = dataRef.current;
    const next: DemoData = {
      ...current,
      templates: current.templates.map((entry) =>
        entry.id === template.id
          ? { ...template, updatedAt: new Date().toISOString() }
          : entry,
      ),
    };
    dataRef.current = next;
    setData(next);
  }, []);

  const createQuoteFromInspection = useCallback(
    (inspectionId: string): CreateQuoteResult | null => {
      const current = dataRef.current;
      const inspection = current.inspections.find((entry) => entry.id === inspectionId);
      if (!inspection) return null;
      const existing = current.quotes.find((quote) => quote.inspectionId === inspectionId);
      if (existing) return { quote: existing, existing: true };

      const items: QuoteLine[] = [];
      for (const section of inspection.templateSections) {
        for (const item of section.items) {
          const result = inspection.results.find((entry) => entry.itemId === item.id);
          if (!result || result.status === "pass") continue;
          items.push({
            id: newId("line"),
            description: item.label,
            qty: 1,
            unitPrice: findingPrice(item.label),
          });
        }
      }

      if (items.length === 0) return null;

      const quote: Quote = {
        id: newId("quote"),
        quoteNumber: `QT-${String(current.counters.quote).padStart(4, "0")}`,
        invoiceNumber: null,
        inspectionId,
        customerId: inspection.customerId,
        vehicleId: inspection.vehicleId,
        items,
        createdAt: new Date().toISOString(),
        invoicedAt: null,
        dueAt: null,
        paid: false,
      };

      const next: DemoData = {
        ...current,
        quotes: [quote, ...current.quotes],
        counters: { ...current.counters, quote: current.counters.quote + 1 },
      };
      dataRef.current = next;
      setData(next);
      return { quote, existing: false };
    },
    [],
  );

  const updateQuoteLines = useCallback((quoteId: string, items: QuoteLine[]) => {
    const current = dataRef.current;
    const next: DemoData = {
      ...current,
      quotes: current.quotes.map((quote) => (quote.id === quoteId ? { ...quote, items } : quote)),
    };
    dataRef.current = next;
    setData(next);
  }, []);

  const convertQuoteToInvoice = useCallback((quoteId: string): Quote | null => {
    const current = dataRef.current;
    const quote = current.quotes.find((entry) => entry.id === quoteId);
    if (!quote) return null;
    if (quote.invoiceNumber) return quote;

    const updated: Quote = {
      ...quote,
      invoiceNumber: `INV-${String(current.counters.invoice).padStart(4, "0")}`,
      invoicedAt: todayISO(),
      dueAt: addDaysISO(7),
      paid: false,
    };
    const next: DemoData = {
      ...current,
      quotes: current.quotes.map((entry) => (entry.id === quoteId ? updated : entry)),
      counters: { ...current.counters, invoice: current.counters.invoice + 1 },
    };
    dataRef.current = next;
    setData(next);
    return updated;
  }, []);

  const setInvoicePaid = useCallback((quoteId: string, paid: boolean) => {
    const current = dataRef.current;
    const next: DemoData = {
      ...current,
      quotes: current.quotes.map((quote) => (quote.id === quoteId ? { ...quote, paid } : quote)),
    };
    dataRef.current = next;
    setData(next);
  }, []);

  const resetDemoData = useCallback(() => {
    const seed = createSeedData();
    dataRef.current = seed;
    setData(seed);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    } catch {
      // Ignore storage errors in this demo.
    }
  }, []);

  const actions = useMemo<StoreActions>(
    () => ({
      hydrated,
      createInspection,
      saveSignature,
      saveTemplate,
      createQuoteFromInspection,
      updateQuoteLines,
      convertQuoteToInvoice,
      setInvoicePaid,
      resetDemoData,
    }),
    [
      hydrated,
      createInspection,
      saveSignature,
      saveTemplate,
      createQuoteFromInspection,
      updateQuoteLines,
      convertQuoteToInvoice,
      setInvoicePaid,
      resetDemoData,
    ],
  );

  const value = useMemo(() => ({ data, actions }), [data, actions]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
}
