"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  PencilLine,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { fetchProfileDetail, softDeletePersonnel } from "@/lib/api";
import { DEFAULT_PHOTO_PATH, DETAIL_SHEET_DEFS, SHEET_DEF_MAP } from "@/lib/constants";
import type { DetailSheetKey, Row } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { useDragToScroll } from "@/lib/useDragToScroll";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";
import {
  cn,
  displayName,
  fieldValue,
  formatDate,
  formatSheetLabel,
  isDeleted,
  normalizeStatus,
} from "@/lib/utils";

interface ProfileViewerProps {
  personnelId: string;
  onBack: () => void;
  onEditPersonnel: (personnelId: string) => void;
}

function RecordsTable({ rows, sheet }: { rows: Row[]; sheet: DetailSheetKey }) {
  const { t } = useLanguage();
  const def = SHEET_DEF_MAP[sheet];
  const columns = def.fields.filter((field) => field.key !== "Personnel_ID");

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-app-border bg-app-input/40 px-4 py-6 text-center text-sm text-app-muted">
        {t("profile.noRecords", { sheet: formatSheetLabel(def.label) })}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-app-border">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead className="bg-app-input/70">
          <tr>
            <th className="thead-cell">{t("profile.recordColumn")}</th>
            {columns.map((field) => (
              <th key={field.key} className="thead-cell">
                {field.label ?? field.key}
              </th>
            ))}
            <th className="thead-cell">{t("common.status")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-app-border">
          {rows.map((row) => (
            <tr key={row.Record_ID ?? JSON.stringify(row)} className="transition-colors hover:bg-app-card2/60">
              <td className="tbody-cell font-mono text-xs text-app-accent">
                {row.Record_ID ?? "—"}
              </td>
              {columns.map((field) => {
                const value = fieldValue(row, field.key);
                return (
                  <td key={field.key} className="tbody-cell whitespace-pre-wrap">
                    {field.type === "date" || field.type === "year"
                      ? formatDate(value) || "—"
                      : value || "—"}
                  </td>
                );
              })}
              <td className="tbody-cell">
                <Badge tone={isDeleted(row) ? "danger" : "success"}>
                  {normalizeStatus(row)}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PersonnelDetailCard({ row }: { row: Row }) {
  const { t } = useLanguage();
  const def = SHEET_DEF_MAP.personnel;
  const photo = row["រូបថត Link"];
  const [photoErrored, setPhotoErrored] = useState(false);
  const photoSrc = photo && !photoErrored ? photo : DEFAULT_PHOTO_PATH;
  const core = def.fields.filter((field) =>
    [
      "នាមត្រកូល នាមខ្លួន",
      "អក្សរឡាតាំង",
      "ភេទ",
      "ថ្ងៃខែឆ្នាំកំណើត",
      "ឋាននិរនាម/មុខតំណែងបច្ចុប្បន្ន",
      "កងឯកភាព",
      "លេខទូរស័ព្ទ",
      "ទីលំនៅបច្ចុប្បន្ន",
    ].includes(field.key),
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-px overflow-hidden rounded-xl border border-app-border bg-app-border sm:grid-cols-2 lg:grid-cols-3">
        {core.map((field) => (
          <div key={field.key} className="bg-app-card p-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-app-muted">
              {field.label ?? field.key}
            </p>
            <p className="mt-1.5 break-words text-sm font-medium text-app-text">
              {fieldValue(row, field.key) || "—"}
            </p>
          </div>
        ))}
      </div>

      <h4 className="pt-2 text-sm font-bold text-app-text">{t("profile.otherInfo")}</h4>
      <div className="grid gap-px overflow-hidden rounded-xl border border-app-border bg-app-border sm:grid-cols-2 lg:grid-cols-3">
        {def.fields
          .filter((field) => !core.includes(field))
          .map((field) => (
            <div key={field.key} className="bg-app-card p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-app-muted">
                {field.label ?? field.key}
              </p>
              <p className="mt-1.5 break-words text-sm font-medium text-app-text">
                {fieldValue(row, field.key) || "—"}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

export function ProfileViewer({
  personnelId,
  onBack,
  onEditPersonnel,
}: ProfileViewerProps) {
  const { lang, t } = useLanguage();
  const [section, setSection] = useState<"personnel" | DetailSheetKey>("personnel");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const queryClient = useQueryClient();

  const {
    ref: sectionListRef,
    handlers: sectionListHandlers,
    consumeDrag: sectionListConsumeDrag,
  } = useDragToScroll<HTMLDivElement>();

  const profileQuery = useQuery({
    queryKey: ["profile", personnelId],
    queryFn: () => fetchProfileDetail(personnelId),
  });

  const sections = useMemo(
    () => [
      {
        key: "personnel" as const,
        label: lang === "en" ? "Personnel" : "ព័ត៌មានផ្ទាល់ខ្លួន",
        khmer: lang === "en" ? "ព័ត៌មានផ្ទាល់ខ្លួន" : "Personnel",
        count: profileQuery.data?.personnel ? 1 : 0,
      },
      ...DETAIL_SHEET_DEFS.map((def) => ({
        key: def.key as DetailSheetKey,
        label: formatSheetLabel(def.label),
        khmer: lang === "en" ? (def.descriptionEn ?? def.description) : def.description,
        count: profileQuery.data?.[def.key]?.length ?? 0,
      })),
    ],
    [profileQuery.data, lang],
  );

  const deleteMutation = useMutation({
    mutationFn: softDeletePersonnel,
    onSuccess: async (response) => {
      if (response.success || response.result === "success") {
        await queryClient.invalidateQueries({ queryKey: ["personnel"] });
        await queryClient.invalidateQueries({ queryKey: ["profile"] });
        await queryClient.invalidateQueries({ queryKey: ["profiles"] });
        await queryClient.invalidateQueries({ queryKey: ["sheet"] });
        onBack();
      }
    },
  });

  const profile = profileQuery.data;
  const personnel = profile?.personnel ?? null;

  if (profileQuery.isLoading) {
    return <Loader label={t("profile.loading")} />;
  }

  if (profileQuery.isError || !profile || !personnel) {
    return (
      <EmptyState
        icon={<Users className="h-10 w-10" />}
        title={t("profile.notFound")}
        description={profileQuery.error instanceof Error ? profileQuery.error.message : personnelId}
        action={<Button variant="add" onClick={onBack}>{t("common.back")}</Button>}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="panel overflow-hidden">
        <div className="flex flex-col gap-5 bg-gradient-to-br from-app-card via-app-surface to-app-bg p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5">
            {/* <button type="button" onClick={onBack} className="mt-1 text-app-muted hover:text-app-text" aria-label={t("common.back")}>
              <ArrowLeft className="h-5 w-5" />
            </button> */}
            <Avatar
              name={displayName(personnel)}
              personnelId={personnel.Personnel_ID}
              photoUrl={personnel["រូបថត Link"]}
              size="lg"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-app-text">{displayName(personnel)}</h2>
                <Badge tone={isDeleted(personnel) ? "danger" : "success"}>
                  {normalizeStatus(personnel)}
                </Badge>
              </div>
              <p className="mt-1 font-mono text-sm text-app-accent">{personnel.Personnel_ID}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="chip">
                  <UserRound className="h-3.5 w-3.5" />
                  {personnel["ឋាននិរនាម/មុខតំណែងបច្ចុប្បន្ន"] || t("common.noPosition")}
                </span>
                <span className="chip">{personnel["កងឯកភាព"] || t("common.noUnit")}</span>
                {personnel["ភេទ"] ? <Badge tone="muted">{personnel["ភេទ"]}</Badge> : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              variant="add"
              className="!h-11 !w-11 !rounded-xl !px-0"
              onClick={() => onEditPersonnel(personnel.Personnel_ID)}
              aria-label={t("profile.editPersonnel")}
              title={t("profile.editPersonnel")}
            >
              <PencilLine className="h-4 w-4" />
            </Button>
            <Button
              variant="danger"
              className="!h-11 !w-11 !rounded-xl !px-0 flex items-center justify-center"
              onClick={() => setConfirmDelete(true)}
              disabled={deleteMutation.isPending}
              aria-label={t("profile.softDelete")}
              title={t("profile.softDelete")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="border-t border-app-border">
          <div className="scrollbar-none flex cursor-grab select-none gap-1 overflow-x-auto p-2" ref={sectionListRef} {...sectionListHandlers}>
            {sections.map((sec) => (
              <button
                key={sec.key}
                type="button"
                onClick={() => {
                  if (sectionListConsumeDrag()) return;
                  setSection(sec.key);
                }}
                className={cn(
                  "shrink-0 rounded-xl px-4 py-2.5 text-left transition-all",
                  section === sec.key
                    ? "bg-app-accent/10 text-app-accent ring-1 ring-app-accent/40"
                    : "text-app-muted hover:bg-app-card hover:text-app-text",
                )}
              >
                <p className="text-[0.8rem] font-bold leading-tight">{sec.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="panel p-5">
        {section === "personnel" ? (
          <PersonnelDetailCard row={personnel} />
        ) : (
          <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-app-text">
                  {formatSheetLabel(SHEET_DEF_MAP[section].label)}
                </h3>
                <p className="text-sm text-app-muted">
                  {lang === "en"
                    ? (SHEET_DEF_MAP[section].descriptionEn ?? SHEET_DEF_MAP[section].description)
                    : SHEET_DEF_MAP[section].description}
                </p>
              </div>
              <RecordsTable
                rows={profile[section] as Row[]}
                sheet={section}
              />
            </div>
        )}
      </div>

      {deleteMutation.error ? (
        <p className="rounded-xl border border-app-danger/40 bg-app-danger/10 px-4 py-3 text-sm text-app-danger">
          {deleteMutation.error instanceof Error ? deleteMutation.error.message : t("profile.deleteFailed")}
        </p>
      ) : null}

      {confirmDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="panel w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("profile.deleteConfirmTitle")}
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-app-danger bg-app-danger/10 text-app-danger">
                <Trash2 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-app-text">{t("profile.deleteConfirmTitle")}</h3>
                <p className="mt-1.5 text-sm text-app-muted">
                  {t("profile.deleteConfirmMessage", { name: displayName(personnel) })}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(false)} disabled={deleteMutation.isPending}>
                {t("common.cancel")}
              </Button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(personnel.Personnel_ID)}
                disabled={deleteMutation.isPending}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-app-danger bg-app-danger/10 px-4 text-sm font-bold text-app-danger transition-colors hover:bg-app-danger/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {deleteMutation.isPending ? t("profile.deleting") : t("profile.softDelete")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}