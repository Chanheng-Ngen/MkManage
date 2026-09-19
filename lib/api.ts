import axios from "axios";
import { SHEETS_ENDPOINT } from "@/lib/constants";
import type {
  PersonnelListResponse,
  PersonnelRecord,
  RegisterToken,
  Row,
  SheetKey,
  SoldierProfileDetail,
  SubmitResponse,
  TokenValidation,
} from "@/lib/types";

export const apiClient = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

interface ListEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

function unwrap<T>(data: ListEnvelope<T>, fallback: T): T {
  if (data && data.success && Array.isArray(data.data)) {
    return data.data as T;
  }
  if (data && data.success && data.data) {
    return data.data;
  }
  return fallback;
}

export async function fetchPersonnelList(params: {
  page?: number;
  limit?: number;
  q?: string;
  includeDeleted?: boolean;
}): Promise<PersonnelListResponse> {
  const { data } = await apiClient.get<ListEnvelope<PersonnelListResponse | PersonnelRecord[]>>(
    SHEETS_ENDPOINT,
    { params: { sheet: "personnel", ...params } },
  );

  if (data.success && data.data && !Array.isArray(data.data) && "items" in data.data) {
    return data.data;
  }

  const items = Array.isArray(data.data) ? (data.data as PersonnelRecord[]) : [];
  return {
    items,
    pagination: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      total: items.length,
      totalPages: Math.max(Math.ceil(items.length / (params.limit ?? 20)), 1),
      hasNextPage: false,
      hasPrevPage: (params.page ?? 1) > 1,
    },
  };
}

export async function fetchAllProfiles(): Promise<SoldierProfileDetail[]> {
  const { data } = await apiClient.get<ListEnvelope<SoldierProfileDetail[]>>(
    SHEETS_ENDPOINT,
    { params: { sheet: "profiles" } },
  );
  return unwrap<SoldierProfileDetail[]>(data, []);
}

export async function fetchProfileDetail(personnelId: string): Promise<SoldierProfileDetail> {
  const { data } = await apiClient.get<ListEnvelope<SoldierProfileDetail>>(
    SHEETS_ENDPOINT,
    { params: { sheet: "profile", Personnel_ID: personnelId } },
  );
  return unwrap<SoldierProfileDetail>(data, {
    personnel: null,
    familyBackground: [],
    parents: [],
    spouse: [],
    childrenInfo: [],
    educationTimeline: [],
    rankPositionHistory: [],
    combatServiceLog: [],
    conductRecord: [],
  });
}

export async function fetchSheetRecords(
  sheet: SheetKey,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<Row[]> {
  const { data } = await apiClient.get<ListEnvelope<Row[]>>(SHEETS_ENDPOINT, {
    params: { sheet, ...params },
  });
  return unwrap<Row[]>(data, []);
}

export async function saveSheetRecord(
  sheet: SheetKey,
  action: "create" | "update" | "delete",
  body?: Row,
  id?: string,
): Promise<SubmitResponse> {
  const { data } = await apiClient.post<SubmitResponse>(SHEETS_ENDPOINT, body ?? {}, {
    params: { sheet, action, ...(id ? { id } : {}) },
  });

  return data;
}

export async function createFullProfile(payload: {
  personnel: Row;
  sheets: Partial<Record<SheetKey, Row[]>>;
}): Promise<SubmitResponse> {
  const body: Record<string, unknown> = {
    personnel: payload.personnel,
  };

  (Object.keys(payload.sheets) as SheetKey[]).forEach((sheet) => {
    const rows = payload.sheets[sheet];
    if (Array.isArray(rows) && rows.length > 0) {
      body[sheet] = rows;
    }
  });

  const { data } = await apiClient.post<SubmitResponse>(SHEETS_ENDPOINT, body, {
    params: { sheet: "profile", action: "create" },
  });

  return data;
}

export async function submitBioToSheets(
  payload: { personnel: Row; sheets: Partial<Record<SheetKey, Row[]>> },
  selectedPersonnelId?: string,
): Promise<SubmitResponse> {
  if (selectedPersonnelId) {
    return saveSheetRecord("personnel", "update", payload.personnel, selectedPersonnelId);
  }
  return createFullProfile(payload);
}

export async function softDeletePersonnel(personnelId: string): Promise<SubmitResponse> {
  const { data } = await apiClient.post<SubmitResponse>(SHEETS_ENDPOINT, null, {
    params: { sheet: "personnel", action: "delete", id: personnelId },
  });

  return data;
}

export async function restorePersonnel(
  personnelId: string,
  body?: Row,
): Promise<SubmitResponse> {
  return saveSheetRecord("personnel", "update", { Status: "ACTIVE", ...(body ?? {}) }, personnelId);
}

export async function generateRegisterToken(personnelId?: string): Promise<RegisterToken> {
  const { data } = await apiClient.post<SubmitResponse>(
    SHEETS_ENDPOINT,
    personnelId ? { Personnel_ID: personnelId } : {},
    { params: { sheet: "tokens", action: "generate" } },
  );

  if (data && (data.success || data.result === "success") && data.data) {
    return data.data as RegisterToken;
  }

  throw new Error(data.message ?? data.error ?? "Failed to generate registration link");
}

export async function validateRegisterToken(token: string): Promise<TokenValidation> {
  const { data } = await apiClient.get<SubmitResponse>(SHEETS_ENDPOINT, {
    params: { sheet: "tokens", action: "validate", Token: token },
  });

  if (data && data.success && data.data) {
    return data.data as TokenValidation;
  }

  throw new Error(data.message ?? data.error ?? "Failed to validate registration link");
}

export async function consumeRegisterToken(token: string): Promise<SubmitResponse> {
  const { data } = await apiClient.post<SubmitResponse>(
    SHEETS_ENDPOINT,
    {},
    { params: { sheet: "tokens", action: "consume", id: token } },
  );

  return data;
}