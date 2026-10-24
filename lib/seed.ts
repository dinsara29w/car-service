import { DATA_VERSION } from "@/lib/constants";
import { addDaysISO } from "@/lib/format";
import type {
  ChecklistSection,
  ChecklistTemplate,
  Customer,
  DemoData,
  Inspection,
  InspectionResult,
  ItemStatus,
  Quote,
  Vehicle,
} from "@/lib/types";

const CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Aroha Brown",
    email: "aroha.brown@example.com",
    phone: "021 555 0142",
    address: "18 Rata Road, Mount Eden, Auckland 1024",
  },
  {
    id: "cust-2",
    name: "Liam Fletcher",
    email: "liam.fletcher@example.com",
    phone: "027 555 0198",
    address: "42 Manuka Lane, Takapuna, Auckland 0622",
  },
  {
    id: "cust-3",
    name: "Mele Tupou",
    email: "mele.tupou@example.com",
    phone: "022 555 0119",
    address: "7 Kowhai Close, Manukau, Auckland 2104",
  },
];

const VEHICLES: Vehicle[] = [
  {
    id: "veh-1",
    customerId: "cust-1",
    make: "Toyota",
    model: "Corolla GX",
    year: 2018,
    plate: "LKM482",
    vin: "JTDBR32E1J312648",
    odometer: 92450,
    colour: "Glacier White",
    wofExpiry: "2027-02-12",
  },
  {
    id: "veh-2",
    customerId: "cust-2",
    make: "Ford",
    model: "Ranger XLT",
    year: 2020,
    plate: "MJP771",
    vin: "MPBUMFF50LX293847",
    odometer: 68210,
    colour: "Magnetic Grey",
    wofExpiry: "2026-11-28",
  },
  {
    id: "veh-3",
    customerId: "cust-3",
    make: "Mazda",
    model: "Axela",
    year: 2016,
    plate: "KRN319",
    vin: "JM0BM547810239465",
    odometer: 131780,
    colour: "Soul Red",
    wofExpiry: "2026-12-19",
  },
];

function createTemplates(): ChecklistTemplate[] {
  return [
    {
      id: "tpl-20point",
      name: "20-Point Pre-Service Check",
      description: "A thorough workshop-wide check before any service or repair.",
      updatedAt: new Date().toISOString(),
      sections: [
        {
          id: "sec-exterior",
          title: "Exterior & lights",
          items: [
            { id: "t20-1", label: "Headlights, indicators and brake lights", type: "check" },
            { id: "t20-2", label: "Windscreen and wipers", type: "check" },
            { id: "t20-3", label: "Body panels and mirrors", type: "check" },
            { id: "t20-4", label: "Tyre condition and pressures", type: "check" },
            {
              id: "t20-5",
              label: "Front tyre tread depth",
              type: "measurement",
              unit: "mm",
            },
          ],
        },
        {
          id: "sec-bonnet",
          title: "Under bonnet",
          items: [
            { id: "t20-6", label: "Engine oil level and condition", type: "check" },
            { id: "t20-7", label: "Coolant level and condition", type: "check" },
            { id: "t20-8", label: "Washer fluid and battery terminals", type: "check" },
            { id: "t20-9", label: "Drive belts and hoses", type: "check" },
          ],
        },
        {
          id: "sec-under",
          title: "Under vehicle",
          items: [
            {
              id: "t20-10",
              label: "Front brake pad thickness",
              type: "measurement",
              unit: "mm",
            },
            {
              id: "t20-11",
              label: "Rear brake pad thickness",
              type: "measurement",
              unit: "mm",
            },
            {
              id: "t20-12",
              label: "Rear tyre tread depth",
              type: "measurement",
              unit: "mm",
            },
            { id: "t20-13", label: "Suspension and steering components", type: "check" },
            { id: "t20-14", label: "Exhaust system and fluid leaks", type: "check" },
          ],
        },
        {
          id: "sec-safety",
          title: "Safety & cabin",
          items: [
            { id: "t20-15", label: "Seatbelts and restraints", type: "check" },
            { id: "t20-16", label: "Horn and warning lights", type: "check" },
            { id: "t20-17", label: "WOF compliance check", type: "check" },
            { id: "t20-18", label: "Air conditioning and heater", type: "check" },
          ],
        },
        {
          id: "sec-road",
          title: "Road test",
          items: [
            { id: "t20-19", label: "Braking performance", type: "check" },
            { id: "t20-20", label: "Steering and handling", type: "check" },
          ],
        },
      ],
    },
    {
      id: "tpl-brake",
      name: "Brake Inspection",
      description: "Pad, disc, fluid and brake performance checks with measurements.",
      updatedAt: new Date().toISOString(),
      sections: [
        {
          id: "sec-brakes",
          title: "Braking system",
          items: [
            {
              id: "brake-1",
              label: "Front brake pad thickness",
              type: "measurement",
              unit: "mm",
            },
            {
              id: "brake-2",
              label: "Rear brake pad thickness",
              type: "measurement",
              unit: "mm",
            },
            { id: "brake-3", label: "Front brake discs", type: "check" },
            { id: "brake-4", label: "Rear brake discs", type: "check" },
            { id: "brake-5", label: "Brake fluid level and condition", type: "check" },
            { id: "brake-6", label: "Brake lines and hoses", type: "check" },
            { id: "brake-7", label: "Handbrake operation", type: "check" },
            { id: "brake-8", label: "ABS warning light and road test", type: "check" },
          ],
        },
      ],
    },
    {
      id: "tpl-tyre",
      name: "Tyre Inspection",
      description: "Tread depth, condition and alignment checks for all four wheels.",
      updatedAt: new Date().toISOString(),
      sections: [
        {
          id: "sec-tyres",
          title: "Tyres & wheels",
          items: [
            {
              id: "tyre-1",
              label: "Left front tyre tread depth",
              type: "measurement",
              unit: "mm",
            },
            {
              id: "tyre-2",
              label: "Right front tyre tread depth",
              type: "measurement",
              unit: "mm",
            },
            {
              id: "tyre-3",
              label: "Left rear tyre tread depth",
              type: "measurement",
              unit: "mm",
            },
            {
              id: "tyre-4",
              label: "Right rear tyre tread depth",
              type: "measurement",
              unit: "mm",
            },
            { id: "tyre-5", label: "Tyre pressures", type: "check" },
            { id: "tyre-6", label: "Tyre condition and sidewalls", type: "check" },
            { id: "tyre-7", label: "Wheel alignment check", type: "check" },
            { id: "tyre-8", label: "Spare tyre condition", type: "check" },
          ],
        },
      ],
    },
  ];
}

function cloneSections(sections: ChecklistSection[]): ChecklistSection[] {
  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({ ...item })),
  }));
}

type ResultOverride = {
  status?: ItemStatus;
  notes?: string;
  measurement?: string;
};

const DEFAULT_MEASUREMENTS: Record<string, string> = {
  "Front tyre tread depth": "5.4",
  "Rear tyre tread depth": "5.1",
  "Front brake pad thickness": "7.8",
  "Rear brake pad thickness": "6.9",
  "Left front tyre tread depth": "6.2",
  "Right front tyre tread depth": "6.1",
  "Left rear tyre tread depth": "5.8",
  "Right rear tyre tread depth": "5.7",
};

function buildResults(
  sections: ChecklistSection[],
  overrides: Record<string, ResultOverride> = {},
): InspectionResult[] {
  return sections.flatMap((section) =>
    section.items.map((item) => {
      const override = overrides[item.label] || overrides[item.id] || {};
      return {
        itemId: item.id,
        status: override.status ?? "pass",
        notes: override.notes ?? "",
        photos: [],
        measurement:
          item.type === "measurement"
            ? (override.measurement ?? DEFAULT_MEASUREMENTS[item.label] ?? "")
            : undefined,
      };
    }),
  );
}

function signatureSvg(name: string): string {
  const safeName = name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="180" viewBox="0 0 640 180">
    <rect width="640" height="180" fill="#ffffff"/>
    <text x="44" y="102" fill="#0F3D2E" font-size="58" font-family="'Segoe Script', 'Snell Roundhand', 'Brush Script MT', cursive" transform="rotate(-3 320 90)">${safeName}</text>
    <path d="M42 126 C 140 142, 300 138, 520 128" stroke="#9CB8AB" stroke-width="2" fill="none" stroke-linecap="round"/>
    <text x="44" y="158" fill="#6B8078" font-size="16" font-family="Arial, sans-serif">Signed electronically — Demo Auto Workshop</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function isoAt(daysAgo: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export function createSeedData(): DemoData {
  const templates = createTemplates();
  const twentyPoint = templates[0];
  const brakeTemplate = templates[1];

  const firstSignature = signatureSvg("Aroha Brown");
  const secondSignature = signatureSvg("Liam Fletcher");

  const firstResults = buildResults(twentyPoint.sections, {
    "Front brake pad thickness": {
      status: "attention",
      measurement: "3.2",
      notes: "Front pads measured at 3.2 mm. Replacement recommended within the next 1,000 km.",
    },
    "Air conditioning and heater": {
      status: "attention",
      notes: "Cabin filter due for replacement — airflow is slightly reduced.",
    },
  });

  const secondResults = buildResults(brakeTemplate.sections, {
    "Front brake discs": {
      status: "fail",
      notes: "Front discs are below minimum thickness and show heavy scoring. Replace discs and pads.",
    },
    "Brake fluid level and condition": {
      status: "attention",
      notes: "Brake fluid is dark and moisture content is elevated. A fluid flush is recommended.",
    },
    "Front brake pad thickness": {
      status: "attention",
      measurement: "2.8",
      notes: "Front pads are close to the wear limit.",
    },
  });

  const firstInspection: Inspection = {
    id: "insp-1",
    reportNumber: "RPT-0001",
    customerId: "cust-1",
    vehicleId: "veh-1",
    templateId: twentyPoint.id,
    templateName: twentyPoint.name,
    templateSections: cloneSections(twentyPoint.sections),
    technician: "Sam Walker",
    date: addDaysISO(-3),
    odometer: 92450,
    results: firstResults,
    signature: firstSignature,
    signedAt: isoAt(3, 11, 25),
    createdAt: isoAt(3, 9, 10),
    status: "completed",
  };

  const secondInspection: Inspection = {
    id: "insp-2",
    reportNumber: "RPT-0002",
    customerId: "cust-2",
    vehicleId: "veh-2",
    templateId: brakeTemplate.id,
    templateName: brakeTemplate.name,
    templateSections: cloneSections(brakeTemplate.sections),
    technician: "Jess Chen",
    date: addDaysISO(-21),
    odometer: 68210,
    results: secondResults,
    signature: secondSignature,
    signedAt: isoAt(21, 14, 5),
    createdAt: isoAt(21, 12, 40),
    status: "completed",
  };

  const quotes: Quote[] = [
    {
      id: "quote-1",
      quoteNumber: "QT-0001",
      invoiceNumber: "INV-0001",
      inspectionId: firstInspection.id,
      customerId: "cust-1",
      vehicleId: "veh-1",
      items: [
        {
          id: "line-seed-1",
          description: "Replace front brake pads",
          qty: 1,
          unitPrice: 185,
        },
        {
          id: "line-seed-2",
          description: "Replace air conditioning cabin filter",
          qty: 1,
          unitPrice: 65,
        },
      ],
      createdAt: isoAt(3, 11, 40),
      invoicedAt: addDaysISO(-3),
      dueAt: addDaysISO(4),
      paid: true,
    },
    {
      id: "quote-2",
      quoteNumber: "QT-0002",
      invoiceNumber: "INV-0002",
      inspectionId: secondInspection.id,
      customerId: "cust-2",
      vehicleId: "veh-2",
      items: [
        {
          id: "line-seed-3",
          description: "Replace front brake discs and pads",
          qty: 1,
          unitPrice: 460,
        },
        {
          id: "line-seed-4",
          description: "Brake fluid flush",
          qty: 1,
          unitPrice: 110,
        },
      ],
      createdAt: isoAt(21, 14, 20),
      invoicedAt: addDaysISO(-21),
      dueAt: addDaysISO(-14),
      paid: false,
    },
  ];

  return {
    version: DATA_VERSION,
    customers: CUSTOMERS.map((customer) => ({ ...customer })),
    vehicles: VEHICLES.map((vehicle) => ({ ...vehicle })),
    templates,
    inspections: [firstInspection, secondInspection],
    quotes,
    counters: { report: 3, quote: 3, invoice: 3 },
  };
}

export { cloneSections };
