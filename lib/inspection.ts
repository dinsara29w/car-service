import type { ChecklistItem, Inspection, InspectionResult } from "@/lib/types";

export interface InspectionFinding {
  sectionTitle: string;
  item: ChecklistItem;
  result: InspectionResult;
}

export function flattenChecklistItems(items: { items: ChecklistItem[] }[]): ChecklistItem[] {
  return items.flatMap((section) => section.items);
}

export function getFindings(inspection: Inspection): InspectionFinding[] {
  const findings: InspectionFinding[] = [];
  for (const section of inspection.templateSections) {
    for (const item of section.items) {
      const result = inspection.results.find((entry) => entry.itemId === item.id);
      if (result && result.status !== "pass") {
        findings.push({ sectionTitle: section.title, item, result });
      }
    }
  }
  return findings;
}

export function getInspectionCounts(inspection: Inspection) {
  return inspection.results.reduce(
    (counts, result) => {
      counts[result.status] += 1;
      return counts;
    },
    { pass: 0, attention: 0, fail: 0 },
  );
}

export function vehicleName(vehicle: { year: number; make: string; model: string }): string {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

export function findingPrice(label: string): number {
  const text = label.toLowerCase();
  const matches: [RegExp, number][] = [
    [/brake disc|rotor/, 320],
    [/brake pad/, 185],
    [/brake fluid/, 110],
    [/wheel alignment|alignment/, 95],
    [/tyre|tire/, 145],
    [/wiper/, 45],
    [/windscreen|windshield/, 250],
    [/battery/, 220],
    [/coolant/, 95],
    [/engine oil|oil change|oil level/, 120],
    [/suspension|shock|strut/, 380],
    [/exhaust/, 260],
    [/air conditioning|air con|cabin filter/, 85],
    [/light|indicator/, 65],
    [/wof/, 75],
    [/fluid flush/, 110],
  ];
  const match = matches.find(([pattern]) => pattern.test(text));
  return match ? match[1] : 85;
}
