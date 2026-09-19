export type Gender = "ប្រុស" | "ស្រី";

export type DetailSheetKey =
  | "familyBackground"
  | "parents"
  | "spouse"
  | "childrenInfo"
  | "educationTimeline"
  | "rankPositionHistory"
  | "combatServiceLog"
  | "conductRecord";

export type SheetKey = "personnel" | DetailSheetKey;

export type DashboardView =
  | "overview"
  | "directory"
  | "composer"
  | "profile"
  | "deleted";

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type Row = Record<string, string | undefined>;

export interface PersonnelRecord extends Row {
  Personnel_ID: string;
}

export interface DetailRecord extends Row {
  Record_ID?: string;
  Personnel_ID: string;
  Status?: string;
}

export interface SoldierProfileDetail {
  personnel: PersonnelRecord | null;
  familyBackground: DetailRecord[];
  parents: DetailRecord[];
  spouse: DetailRecord[];
  childrenInfo: DetailRecord[];
  educationTimeline: DetailRecord[];
  rankPositionHistory: DetailRecord[];
  combatServiceLog: DetailRecord[];
  conductRecord: DetailRecord[];
}

export interface PersonnelListResponse {
  items: PersonnelRecord[];
  pagination: PaginationInfo;
}

export type SheetFieldType = "text" | "date" | "year" | "textarea" | "select" | "photo";

export interface RegisterToken {
  Token: string;
  Personnel_ID?: string;
  Created_at?: string;
  Used_at?: string;
  Status?: string;
}

export interface TokenValidation {
  valid: boolean;
  reason?: "not_found" | "used" | "ok";
  record?: RegisterToken;
}

export interface SheetFieldDef {
  key: string;
  label?: string;
  type?: SheetFieldType;
  options?: string[];
}

export type SheetScope = "personnel" | "detail";

export interface SheetDef {
  key: SheetKey;
  label: string;
  shortLabel: string;
  description: string;
  descriptionEn?: string;
  scope: SheetScope;
  idField: "Personnel_ID" | "Record_ID";
  fields: SheetFieldDef[];
}

export interface SubmitResponse<T = unknown> {
  success?: boolean;
  result?: "success";
  message?: string;
  data?: T;
  error?: string;
}

export interface FullProfileDraft {
  personnel: Row;
  sheets: Record<DetailSheetKey, Row[]>;
}

export interface SheetCountStat {
  key: DetailSheetKey;
  label: string;
  shortLabel: string;
  count: number;
  description: string;
}

export interface OverviewStats {
  total: number;
  active: number;
  deleted: number;
  totalRecords: number;
  genders: { label: string; value: number }[];
  units: { label: string; value: number }[];
  positions: { label: string; value: number }[];
  statuses: { label: string; value: number }[];
  sheetCounts: SheetCountStat[];
}