import { SHEET_DEF_MAP, STATUS_ACTIVE } from "@/lib/constants";
import type {
  DetailSheetKey,
  FullProfileDraft,
  PersonnelRecord,
  Row,
  SheetDef,
  SheetKey,
  SoldierProfileDetail,
} from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function uid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createPersonnelId(): string {
  return `P-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

export function displayName(record: Row | PersonnelRecord | null | undefined): string {
  if (!record) return "—";
  return (
    record["នាមត្រកូល នាមខ្លួន"] ||
    record["អក្សរឡាតាំង"] ||
    record.Personnel_ID ||
    "Unnamed"
  );
}

export function initials(record: Row | PersonnelRecord | null | undefined): string {
  const name = displayName(record);
  if (name && name !== "—") {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return parts[0]?.charAt(0).toUpperCase() || "?";
  }
  return (record?.Personnel_ID ?? "?").slice(0, 2).toUpperCase();
}

export function normalizeStatus(row: Row | null | undefined): string {
  const status = (row?.Status ?? "").toString().trim().toUpperCase();
  return status || STATUS_ACTIVE;
}

export function isDeleted(row: Row | null | undefined): boolean {
  const s = (row?.Status ?? "").toString().trim().toLowerCase();
  return s === "deleted" || s === "inactive";
}

export function blankPersonnel(): Row {
  const def = SHEET_DEF_MAP.personnel;
  return def.fields.reduce<Row>((acc, field) => {
    acc[field.key] = field.key === "Personnel_ID" ? createPersonnelId() : "";
    return acc;
  }, { Status: STATUS_ACTIVE });
}

export function blankSheetRow(sheet: SheetKey, personnelId: string): Row {
  const def = SHEET_DEF_MAP[sheet];
  const row: Row = { Personnel_ID: personnelId, Status: STATUS_ACTIVE };

  def.fields.forEach((field) => {
    if (field.key === "Personnel_ID" || field.key === "Record_ID") return;
    row[field.key] = "";
  });

  return row;
}

export function fieldValue(row: Row, fieldKey: string): string {
  const value = row[fieldKey];
  return value === null || value === undefined ? "" : String(value);
}

export function buildPayload(
  draft: FullProfileDraft,
): { personnel: Row; sheets: Partial<Record<SheetKey, Row[]>> } {
  const personnel = { ...draft.personnel };
  if (!personnel.Personnel_ID) {
    personnel.Personnel_ID = createPersonnelId();
  }
  personnel.Status = personnel.Status || STATUS_ACTIVE;

  const sheets: Partial<Record<SheetKey, Row[]>> = {};
  (Object.keys(draft.sheets) as DetailSheetKey[]).forEach((sheet) => {
    const rows = draft.sheets[sheet].map((row) => ({
      ...row,
      Personnel_ID: row.Personnel_ID || personnel.Personnel_ID,
      Status: row.Status || STATUS_ACTIVE,
    }));
    sheets[sheet] = rows.filter((row) => hasData(row, SHEET_DEF_MAP[sheet]));
  });

  return { personnel, sheets };
}

export function hasData(row: Row, def: SheetDef): boolean {
  return def.fields.some((field) => {
    if (field.key === "Personnel_ID" || field.key === "Record_ID" || field.key === "Status") {
      return false;
    }
    return String(row[field.key] ?? "").trim() !== "";
  });
}

export function sheetRowsToDraft(
  profile: SoldierProfileDetail | null,
): FullProfileDraft {
  const personnel = profile?.personnel ? { ...profile.personnel } : blankPersonnel();

  const sheets: Record<DetailSheetKey, Row[]> = {
    familyBackground: profile?.familyBackground ?? [],
    parents: profile?.parents ?? [],
    spouse: profile?.spouse ?? [],
    childrenInfo: profile?.childrenInfo ?? [],
    educationTimeline: profile?.educationTimeline ?? [],
    rankPositionHistory: profile?.rankPositionHistory ?? [],
    combatServiceLog: profile?.combatServiceLog ?? [],
    conductRecord: profile?.conductRecord ?? [],
  };

  return { personnel, sheets };
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const valid = /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso : "";
  if (!valid) return iso;
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatSheetLabel(label: string): string {
  return label.replace(/^\d+_/, "").replace(/_/g, " ");
}