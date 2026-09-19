"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  Plus,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import {
  generateRegisterToken,
  saveSheetRecord,
  submitBioToSheets,
  updateSheetRows,
} from "@/lib/api";
import { DETAIL_SHEET_DEFS, DETAIL_SHEET_KEYS, SHEET_DEF_MAP } from "@/lib/constants";
import type { DetailSheetKey, FullProfileDraft, Row, SheetKey } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { useDragToScroll } from "@/lib/useDragToScroll";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FieldEditor } from "@/components/ui/FieldEditor";
import { cn, blankPersonnel, blankSheetRow, buildPayload, formatSheetLabel } from "@/lib/utils";

interface SoldierBioFormProps {
  initialDraft?: FullProfileDraft;
  selectedPersonnelId?: string | null;
  onSaved?: () => void;
  showRegistrationControl?: boolean;
}

type Feedback = { type: "success" | "error"; message: string };

function blankSheets(): Record<DetailSheetKey, Row[]> {
  return {
    familyBackground: [],
    parents: [],
    spouse: [],
    childrenInfo: [],
    educationTimeline: [],
    rankPositionHistory: [],
    combatServiceLog: [],
    conductRecord: [],
  };
}

function sheetHasInput(sheet: SheetKey, draft: FullProfileDraft): boolean {
  const def = SHEET_DEF_MAP[sheet];
  if (!def) return true;
  const keys = def.fields
    .map((f) => f.key)
    .filter((k) => k !== "Personnel_ID" && k !== "Record_ID");
  if (!keys.length) return true;
  if (sheet === "personnel") {
    return keys.some((k) => String(draft.personnel[k] ?? "").trim() !== "");
  }
  const rows = draft.sheets[sheet as DetailSheetKey] ?? [];
  return rows.some((row) => keys.some((k) => String(row[k] ?? "").trim() !== ""));
}

export function SoldierBioForm({
  initialDraft,
  selectedPersonnelId,
  onSaved,
  showRegistrationControl = true,
}: SoldierBioFormProps) {
  const { lang, t } = useLanguage();
  const [draft, setDraft] = useState<FullProfileDraft>(() =>
    initialDraft ?? { personnel: blankPersonnel(), sheets: blankSheets() },
  );
  const [activeSheet, setActiveSheet] = useState<SheetKey>("personnel");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => submitBioToSheets(buildPayload(draft), selectedPersonnelId ?? undefined),
    onSuccess: (response) => {
      if (response.success || response.result === "success") {
        setFeedback({
          type: "success",
          message: selectedPersonnelId ? t("form.savedUpdate") : t("form.savedCreate"),
        });
        onSaved?.();
      } else {
        setFeedback({ type: "error", message: response.error ?? response.message ?? t("form.saveFailed") });
      }
    },
    onError: (error: unknown) => {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : t("common.unknownError"),
      });
    },
  });

  const sheetUpdateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPersonnelId) throw new Error(t("common.unknownError"));
      if (activeSheet === "personnel") {
        return saveSheetRecord("personnel", "update", draft.personnel, selectedPersonnelId);
      }
      return updateSheetRows(
        activeSheet,
        selectedPersonnelId,
        draft.sheets[activeSheet as DetailSheetKey] ?? [],
      );
    },
    onSuccess: (response) => {
      if (response.success || response.result === "success") {
        setFeedback({ type: "success", message: t("form.savedUpdate") });
        onSaved?.();
      } else {
        setFeedback({ type: "error", message: response.error ?? response.message ?? t("form.saveFailed") });
      }
    },
    onError: (error: unknown) => {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : t("common.unknownError"),
      });
    },
  });

  const allUpdateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPersonnelId) throw new Error(t("common.unknownError"));

      const personnelRes = await saveSheetRecord(
        "personnel",
        "update",
        draft.personnel,
        selectedPersonnelId,
      );

      if (!(personnelRes.success || personnelRes.result === "success")) {
        throw new Error(personnelRes.error ?? personnelRes.message ?? t("form.saveFailed"));
      }

      await Promise.all(
        DETAIL_SHEET_KEYS.map((sheet) =>
          updateSheetRows(sheet, selectedPersonnelId, draft.sheets[sheet] ?? []),
        ),
      );
    },
    onSuccess: () => {
      setFeedback({ type: "success", message: t("form.savedUpdate") });
      onSaved?.();
    },
    onError: (error: unknown) => {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : t("common.unknownError"),
      });
    },
  });

  const linkMutation = useMutation({
    mutationFn: () => generateRegisterToken(draft.personnel.Personnel_ID || undefined),
    onSuccess: (token) => {
      setLinkError(null);
      setGeneratedLink(`${window.location.origin}/register?token=${encodeURIComponent(token.Token)}`);
    },
    onError: (error: unknown) => {
      setLinkError(error instanceof Error ? error.message : t("common.unknownError"));
    },
  });

  const copyLink = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = generatedLink;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      } catch {
        /* ignore */
      }
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const detailSheets = useMemo(() => DETAIL_SHEET_DEFS, []);
  const isEditMode = Boolean(selectedPersonnelId);

  const incompleteSheets = useMemo(() => {
    const keys: SheetKey[] = isEditMode
      ? ["personnel"]
      : ["personnel", ...DETAIL_SHEET_KEYS];
    return keys.filter((key) => !sheetHasInput(key, draft));
  }, [draft, isEditMode]);

  const setRowValue = (sheet: DetailSheetKey, index: number, key: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      sheets: {
        ...prev.sheets,
        [sheet]: prev.sheets[sheet].map((row, i) => (i === index ? { ...row, [key]: value } : row)),
      },
    }));
  };

  const addRow = (sheet: DetailSheetKey) => {
    setDraft((prev) => ({
      ...prev,
      sheets: {
        ...prev.sheets,
        [sheet]: [...prev.sheets[sheet], blankSheetRow(sheet, draft.personnel.Personnel_ID ?? "")],
      },
    }));
  };

  const removeRow = (sheet: DetailSheetKey, index: number) => {
    setDraft((prev) => ({
      ...prev,
      sheets: {
        ...prev.sheets,
        [sheet]: prev.sheets[sheet].filter((_, i) => i !== index),
      },
    }));
  };

  const personnel = draft.personnel;

  const tabs = useMemo(
    () => [
      { key: "personnel" as SheetKey, label: "Personnel", count: 1 },
      ...detailSheets.map((def) => ({
        key: def.key as SheetKey,
        label: formatSheetLabel(def.label),
        count: draft.sheets[def.key as DetailSheetKey]?.length ?? 0,
      })),
    ],
    [detailSheets, draft.sheets],
  );

  const tabKeys = useMemo(() => tabs.map((tab) => tab.key), [tabs]);
  const activeIndex = tabKeys.indexOf(activeSheet);
  const goPrevSheet = () =>
    setActiveSheet(tabKeys[Math.max(0, activeIndex - 1)]);
  const goNextSheet = () =>
    setActiveSheet(tabKeys[Math.min(tabKeys.length - 1, activeIndex + 1)]);
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < tabKeys.length - 1;

  const {
    ref: tabStripRef,
    handlers: tabStripHandlers,
    consumeDrag: tabStripConsumeDrag,
  } = useDragToScroll<HTMLDivElement>();

  return (
    <div className="space-y-4">
      {feedback ? (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold",
            feedback.type === "success"
              ? "border-app-success/40 bg-app-success/10 text-app-success"
              : "border-app-danger/40 bg-app-danger/10 text-app-danger",
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <TriangleAlert className="h-4 w-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      ) : null}

      {!isEditMode && showRegistrationControl ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 rounded-2xl border border-app-border bg-app-card/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-app-accent" />
              <div>
                <p className="text-sm font-bold text-app-text">{t("form.registerInviteTitle")}</p>
                <p className="text-xs text-app-muted">{t("form.registerInviteDesc")}</p>
              </div>
            </div>
            <Button
              variant="add"
              className="shrink-0"
              onClick={() => linkMutation.mutate()}
              disabled={linkMutation.isPending}
            >
              <Link2 className="mr-1.5 h-4 w-4" />
              {linkMutation.isPending ? t("form.generatingLink") : t("form.generateLink")}
            </Button>
          </div>

          {linkError ? (
            <p className="rounded-xl border border-app-danger/40 bg-app-danger/10 px-4 py-2.5 text-xs font-semibold text-app-danger">
              {linkError}
            </p>
          ) : null}

          {generatedLink ? (
            <div className="rounded-xl border border-app-accent/30 bg-app-input/50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">
                {t("form.shareThisLink")}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  readOnly
                  value={generatedLink}
                  onFocus={(e) => e.currentTarget.select()}
                  className="min-w-0 flex-1 rounded-xl border border-app-border bg-app-input px-3.5 py-2.5 text-sm text-app-text outline-none transition-colors focus:border-app-accent"
                />
                <Button variant="add" className="shrink-0" onClick={copyLink}>
                  {copied ? (
                    <Check className="mr-1.5 h-4 w-4" />
                  ) : (
                    <Copy className="mr-1.5 h-4 w-4" />
                  )}
                  {copied ? t("form.linkCopied") : t("form.copyLink")}
                </Button>
              </div>
              <a
                href={generatedLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-app-accent transition-colors hover:text-app-text hover:underline"
              >
                {t("form.openPreview")}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        ref={tabStripRef}
        {...tabStripHandlers}
        className="scrollbar-none flex cursor-grab select-none gap-2 overflow-x-auto pb-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
onClick={() => {
                if (tabStripConsumeDrag()) return;
                setActiveSheet(tab.key);
              }}
            className={cn(
              "shrink-0 rounded-xl border px-4 py-2.5 text-left transition-all",
              activeSheet === tab.key
                ? "border-app-accent/50 bg-app-accent/10 text-app-accent"
                : "border-app-border bg-app-card text-app-muted hover:text-app-text",
            )}
          >
            <p className="flex items-center gap-1.5 text-xs font-bold leading-tight">
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  incompleteSheets.includes(tab.key) ? "bg-app-gold" : "bg-app-success",
                )}
              />
              {tab.label}
            </p>
          </button>
        ))}
      </div>

      {activeSheet === "personnel" ? (
        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              {/* <h3 className="text-base font-bold text-app-text">01_Personnel</h3>
              <p className="text-xs text-app-muted">{t("form.personnelSheetDesc")}</p> */}
            </div>
            <Badge tone={personnel.Personnel_ID ? "accent" : "danger"}>
              {personnel.Personnel_ID || t("form.autoId")}
            </Badge>
          </div>
          <div className="grid gap-3.5 md:grid-cols-2">
            {SHEET_DEF_MAP.personnel.fields.map((field) => (
              <FieldEditor
                key={field.key}
                field={field}
                value={personnel[field.key] ?? ""}
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, personnel: { ...prev.personnel, [field.key]: value } }))
                }
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="panel p-5">
          {detailSheets.map((def) => {
            if (def.key !== activeSheet) return null;
            const rows = draft.sheets[def.key as DetailSheetKey] ?? [];
            return (
              <div key={def.key} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-app-text">{formatSheetLabel(def.label)}</h3>
                    <p className="text-xs text-app-muted">
                      {lang === "en" ? (def.descriptionEn ?? def.description) : def.description}
                    </p>
                  </div>
                  <Button variant="add" onClick={() => addRow(def.key as DetailSheetKey)}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    {t("form.addRecord")}
                  </Button>
                </div>

                {rows.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-app-border bg-app-input/40 p-5 text-center text-sm text-app-muted">
                    {t("form.noRecordsYet")}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rows.map((row, index) => (
                      <div key={index} className="rounded-xl border border-app-border bg-app-input/30 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <Badge tone="muted">{t("form.recordNo", { n: index + 1 })}</Badge>
                          <button
                            type="button"
                            onClick={() => removeRow(def.key as DetailSheetKey, index)}
                            className="flex items-center gap-1 rounded-lg border border-app-danger/40 bg-app-danger/10 px-2.5 py-1.5 text-xs font-semibold text-app-danger transition-colors hover:bg-app-danger/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {t("common.remove")}
                          </button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {def.fields.map((field) => (
                            <FieldEditor
                              key={field.key}
                              field={field}
                              value={row[field.key] ?? ""}
                              onChange={(value) => setRowValue(def.key as DetailSheetKey, index, field.key, value)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="sticky bottom-0 z-30 -mx-4 overflow-hidden border-t border-app-border bg-app-bg/90 px-4 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2.5 backdrop-blur-xl lg:-mx-6 lg:px-6">
        {/* {incompleteSheets.length > 0 ? (
          <p className="mb-2 text-xs font-semibold text-app-gold">
            {t("form.allSheetsRequired")}{" "}
            {incompleteSheets
              .map(
                (key) =>
                  formatSheetLabel(SHEET_DEF_MAP[key].shortLabel ?? SHEET_DEF_MAP[key].label),
              )
              .join(", ")}
          </p>
        ) : null} */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="secondary"
              className="whitespace-nowrap px-2.5 sm:px-4"
              onClick={goPrevSheet}
              disabled={!canPrev}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t("form.prevSheet")}</span>
            </Button>
            <Button
              variant="secondary"
              className="whitespace-nowrap px-2.5 sm:px-4"
              onClick={goNextSheet}
              disabled={!canNext}
            >
              <span className="hidden sm:inline">{t("form.nextSheet")}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {isEditMode ? (
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none">
              <Button
                variant="secondary"
                className="whitespace-nowrap px-2.5 sm:px-4"
                onClick={() => sheetUpdateMutation.mutate()}
                disabled={
                  sheetUpdateMutation.isPending ||
                  allUpdateMutation.isPending ||
                  !sheetHasInput(activeSheet, draft)
                }
              >
                {sheetUpdateMutation.isPending ? t("form.saving") : t("form.updateSheet")}
              </Button>
              <Button
                className="min-w-0 flex-1 whitespace-nowrap sm:flex-none sm:min-w-40"
                onClick={() => allUpdateMutation.mutate()}
                disabled={
                  allUpdateMutation.isPending ||
                  sheetUpdateMutation.isPending ||
                  incompleteSheets.length > 0
                }
              >
                {allUpdateMutation.isPending ? t("form.saving") : t("form.updateAll")}
              </Button>
            </div>
          ) : (
            <Button
              className="min-w-0 flex-1 whitespace-nowrap sm:flex-none sm:min-w-56"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || incompleteSheets.length > 0}
            >
              {mutation.isPending ? t("form.saving") : t("form.saveProfile")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}