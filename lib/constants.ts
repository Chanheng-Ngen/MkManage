import type {
  DetailSheetKey,
  DashboardView,
  SheetDef,
  SheetKey,
} from "@/lib/types";

export const APP_TITLE = "កងយោធពលខេមរភូមិន្ទ";
export const APP_SHORT_TITLE = "MK-Manage";

export const SHEETS_ENDPOINT = "/api/sheets";

export const DEFAULT_PHOTO_PATH = "/images/nonpf.webp";

export const STATUS_ACTIVE = "ACTIVE";
export const STATUS_DELETED = "DELETED";

export interface NavItem {
  id: DashboardView;
  label: string;
  khmer?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", khmer: "ទិដ្ឋភាពទូទៅ" },
  { id: "directory", label: "Personnel", khmer: "យោធិន" },
  { id: "composer", label: "New record", khmer: "បង្កើតប្រវត្តិរូប" },
  { id: "deleted", label: "Deleted records", khmer: "ប្រវត្តិរូបដែលបានលុប" },
];

export const PERSONNEL_FIELDS: SheetDef["fields"] = [
  { key: "Personnel_ID", label: "Personnel ID", type: "text" },
  { key: "នាមត្រកូល នាមខ្លួន", label: "Full name (Khmer)", type: "text" },
  { key: "អក្សរឡាតាំង", label: "Latin name", type: "text" },
  { key: "ឈ្មោះពីកំណើត", label: "Birth name", type: "text" },
  { key: "ឈ្មោះសសេរផ្សេងទៀត", label: "Other name", type: "text" },
  { key: "ភេទ", label: "Gender", type: "select", options: ["ប្រុស", "ស្រី"] },
  { key: "ថ្ងៃខែឆ្នាំកំណើត", label: "Date of birth", type: "date" },
  { key: "ស្រុកកំណើត - ភូមិ", label: "Birthplace (village)", type: "text" },
  { key: "ឃុំ", label: "Commune", type: "text" },
  { key: "ស្រុក", label: "District", type: "text" },
  { key: "ខេត្ត", label: "Province", type: "text" },
  { key: "ទីលំនៅបច្ចុប្បន្ន", label: "Current address", type: "text" },
  { key: "លេខអត្តសញ្ញាណប័ណ្ណ", label: "National ID", type: "text" },
  { key: "ឋាននិរនាម/មុខតំណែងបច្ចុប្បន្ន", label: "Current rank / position", type: "text" },
  { key: "កងឯកភាព", label: "Unit", type: "text" },
  { key: "លេខទូរស័ព្ទ", label: "Phone", type: "text" },
  { key: "ប្រភេទឈាម (AB/A/B/O)", label: "Blood type", type: "select", options: ["A", "B", "AB", "O", "មិនដឹង"] },
  { key: "ជនជាតិ", label: "Ethnicity", type: "text" },
  { key: "សញ្ជាតិ", label: "Nationality", type: "text" },
  { key: "សាសនា", label: "Religion", type: "text" },
  { key: "កម្រិតវប្បធម៌", label: "Education level", type: "text" },
  { key: "ភាសាបរទេស", label: "Foreign languages", type: "text" },
  { key: "មុខជំនាញ-ឯកទេស", label: "Specialty", type: "text" },
  { key: "ថ្ងៃចូលកងទ័ព", label: "Enlistment date", type: "date" },
  { key: "កម្ពស់ (cm)", label: "Height (cm)", type: "text" },
  { key: "រូបថត Link", label: "Photo link", type: "photo" },
  { key: "លេខអត្តលេខទាហាន", label: "Service number", type: "text" },
  { key: "លេខ ប័ណ្ណជីវប្រវត្តិ", label: "Bio-card number", type: "text" },
  { key: "កំណត់សម្គាល់", label: "Notes", type: "textarea" },
];

export const SHEET_DEFS: SheetDef[] = [
  {
    key: "personnel",
    label: "01_Personnel",
    shortLabel: "Personnel",
    description: "ព័ត៌មានផ្ទាល់ខ្លួនយោធិន",
    descriptionEn: "Soldier personal information",
    scope: "personnel",
    idField: "Personnel_ID",
    fields: PERSONNEL_FIELDS,
  },
  {
    key: "familyBackground",
    label: "02_Family_Background",
    shortLabel: "Family",
    description: "ប្រវត្តិជំនាន់/សាច់ញាតិ",
    descriptionEn: "Generation / family history",
    scope: "detail",
    idField: "Record_ID",
    fields: [
      { key: "ជំនាន់/សាច់ញាតិ", label: "Generation / relation", type: "text" },
      { key: "លំដាប់ជំនាន់", label: "Generation order", type: "text" },
      { key: "ពីឆ្នាំ", type: "year" },
      { key: "ដល់ឆ្នាំ", type: "year" },
      { key: "សកម្មភាព", label: "Activity", type: "textarea" },
      { key: "ទីកន្លែង", label: "Location", type: "text" },
    ],
  },
  {
    key: "parents",
    label: "03_Parents",
    shortLabel: "Parents",
    description: "ព័ត៌មានឪពុកម្តាយ",
    descriptionEn: "Parents' information",
    scope: "detail",
    idField: "Record_ID",
    fields: [
      { key: "តួនាទី", label: "Role", type: "text" },
      { key: "ឈ្មោះ", label: "Name", type: "text" },
      { key: "ឆ្នាំកំណើត", label: "Birth year", type: "year" },
      { key: "នៅរស់ ឬ ស្លាប់", label: "Alive status", type: "select", options: ["នៅរស់", "ស្លាប់"] },
      { key: "ស្រុកកំណើត", label: "Birthplace", type: "text" },
      { key: "មុខរបរ", label: "Occupation", type: "text" },
      { key: "ទីលំនៅបច្ចុប្បន្ន", label: "Current address", type: "text" },
    ],
  },
  {
    key: "spouse",
    label: "04_Spouse",
    shortLabel: "Spouse",
    description: "ព័ត៌មានប្រពន្ធ/ប្តី",
    descriptionEn: "Spouse's information",
    scope: "detail",
    idField: "Record_ID",
    fields: [
      { key: "នាមត្រកូល នាមខ្លួន (ប្រពន្ធ/ប្តី)", label: "Spouse name", type: "text" },
      { key: "ឆ្នាំកំណើត", label: "Birth year", type: "year" },
      { key: "លេខលិខិតរៀបអាពាហ៍ពិពាហ៍", label: "Marriage cert no.", type: "text" },
      { key: "ថ្ងៃខែឆ្នាំច្បាប់", label: "Legal date", type: "date" },
      { key: "ទីលំនៅបច្ចុប្បន្ន", label: "Current address", type: "text" },
      { key: "ចំនួនកូន (សរុប)", label: "Number of children", type: "text" },
      { key: "កំណត់សម្គាល់ (ករណីមានប្រពន្ធ/ប្តីទី២)", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "childrenInfo",
    label: "05_Children",
    shortLabel: "Children",
    description: "ព័ត៌មានកូន",
    descriptionEn: "Children's information",
    scope: "detail",
    idField: "Record_ID",
    fields: [
      { key: "លេខរៀងកូន", label: "Order no.", type: "text" },
      { key: "ឈ្មោះ", label: "Name", type: "text" },
      { key: "ឆ្នាំកំណើត", label: "Birth year", type: "year" },
      { key: "ភេទ", label: "Gender", type: "select", options: ["ប្រុស", "ស្រី"] },
    ],
  },
  {
    key: "educationTimeline",
    label: "06_Education_Timeline",
    shortLabel: "Education",
    description: "ប្រវត្តិសិក្សា/ការងារ",
    descriptionEn: "Study / career timeline",
    scope: "detail",
    idField: "Record_ID",
    fields: [
      { key: "ពីថ្ងៃ/ឆ្នាំ", label: "From", type: "text" },
      { key: "ដល់ថ្ងៃ/ឆ្នាំ", label: "To", type: "text" },
      { key: "ព្រឹត្តិការណ៍ (សិក្សា/ការងារ)", label: "Event", type: "textarea" },
      { key: "ទីកន្លែង", label: "Location", type: "text" },
    ],
  },
  {
    key: "rankPositionHistory",
    label: "07_Rank_Position_History",
    shortLabel: "Rank history",
    description: "ឋានន្តរស័ក្តិ និងមុខតំណែង",
    descriptionEn: "Rank and position history",
    scope: "detail",
    idField: "Record_ID",
    fields: [
      { key: "ពីថ្ងៃ", label: "From", type: "date" },
      { key: "ដល់ថ្ងៃ", label: "To", type: "date" },
      { key: "ឋាននិរនាម/មុខតំណែង", label: "Rank / position", type: "text" },
      { key: "កងឯកភាព", label: "Unit", type: "text" },
      { key: "ថ្នាក់សម្រេច", label: "Achieved grade", type: "text" },
    ],
  },
  {
    key: "combatServiceLog",
    label: "08_Combat_Service_Log",
    shortLabel: "Service log",
    description: "បំពេញភារកិច្ច/ចម្បាំង",
    descriptionEn: "Combat / service log",
    scope: "detail",
    idField: "Record_ID",
    fields: [
      {
        key: "ប្រភេទ (ចូលកងទ័ព/ចម្បាំង/បំពេញបេសកកម្ម)",
        label: "Type",
        type: "select",
        options: ["ចូលកងទ័ព", "ចម្បាំង", "បំពេញបេសកកម្ម"],
      },
      { key: "ថ្ងៃខែឆ្នាំ", label: "Date", type: "date" },
      { key: "ចំនួនលើក", label: "Times", type: "text" },
      { key: "ទីកន្លែង/ថ្នាក់ខ្ពស់បំផុត", label: "Place / highest level", type: "text" },
      { key: "កំណត់សម្គាល់", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "conductRecord",
    label: "09_Conduct_Record",
    shortLabel: "Conduct",
    description: "កំណត់ត្រាឥរិយាបថ",
    descriptionEn: "Conduct record",
    scope: "detail",
    idField: "Record_ID",
    fields: [
      { key: "ប្រភេទកំណត់ត្រា", label: "Record type", type: "text" },
      { key: "ថ្ងៃខែឆ្នាំ", label: "Date", type: "date" },
      { key: "លម្អិត", label: "Details", type: "textarea" },
    ],
  },
];

export const DETAIL_SHEET_DEFS = SHEET_DEFS.filter(
  (def) => def.scope === "detail",
) as Array<SheetDef & { key: DetailSheetKey }>;

export const SHEET_DEF_MAP = Object.fromEntries(
  SHEET_DEFS.map((def) => [def.key, def]),
) as Record<SheetKey, SheetDef>;

export const GENDER_OPTIONS = [
  { value: "ប្រុស", label: "ប្រុស" },
  { value: "ស្រី", label: "ស្រី" },
];

export const DETAIL_SHEET_KEYS = DETAIL_SHEET_DEFS.map((def) => def.key);

export const STATUS_TONES: Record<string, string> = {
  ACTIVE: "success",
  DELETED: "danger",
  INACTIVE: "danger",
};