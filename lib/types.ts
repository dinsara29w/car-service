export type ChecklistItemType = "check" | "measurement";

export interface ChecklistItem {
  id: string;
  label: string;
  type: ChecklistItemType;
  unit?: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  sections: ChecklistSection[];
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  odometer: number;
  colour: string;
  wofExpiry: string;
}

export type ItemStatus = "pass" | "attention" | "fail";

export interface InspectionResult {
  itemId: string;
  status: ItemStatus;
  notes: string;
  photos: string[];
  measurement?: string;
}

export interface DraftInspectionResult {
  status: ItemStatus | null;
  notes: string;
  photos: string[];
  measurement: string;
}

export type InspectionStatus = "awaiting_signature" | "completed";

export interface Inspection {
  id: string;
  reportNumber: string;
  customerId: string;
  vehicleId: string;
  templateId: string;
  templateName: string;
  templateSections: ChecklistSection[];
  technician: string;
  date: string;
  odometer: number;
  results: InspectionResult[];
  signature: string | null;
  signedAt: string | null;
  createdAt: string;
  status: InspectionStatus;
}

export interface QuoteLine {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  invoiceNumber: string | null;
  inspectionId: string;
  customerId: string;
  vehicleId: string;
  items: QuoteLine[];
  createdAt: string;
  invoicedAt: string | null;
  dueAt: string | null;
  paid: boolean;
}

export interface DemoCounters {
  report: number;
  quote: number;
  invoice: number;
}

export interface DemoData {
  version: number;
  customers: Customer[];
  vehicles: Vehicle[];
  templates: ChecklistTemplate[];
  inspections: Inspection[];
  quotes: Quote[];
  counters: DemoCounters;
}

export interface NewInspectionInput {
  customerId: string;
  vehicleId: string;
  templateId: string;
  technician: string;
  date: string;
  odometer: number;
  results: InspectionResult[];
}
