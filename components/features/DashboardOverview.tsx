"use client";

import { useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BadgeCheck,
  Database,
  HeartHandshake,
  Layers,
  ShieldCheck,
  ShieldX,
  UserPlus,
  Users,
} from "lucide-react";
import { fetchAllProfiles } from "@/lib/api";
import { DETAIL_SHEET_DEFS } from "@/lib/constants";
import type { DashboardView, SoldierProfileDetail } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, formatSheetLabel, isDeleted } from "@/lib/utils";

interface OverviewProps {
  onNavigate: (view: DashboardView, personnelId?: string) => void;
}

function Donut({
  active,
  deleted,
  total,
}: {
  active: number;
  deleted: number;
  total: number;
}) {
  const { t } = useLanguage();
  const C = 2 * Math.PI * 64;
  const denom = Math.max(total, 1);
  const a = (active / denom) * C;
  const d = (deleted / denom) * C;

  return (
    <div className="relative h-40 w-40 shrink-0 sm:h-44 sm:w-44">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle
          cx="80"
          cy="80"
          r="64"
          fill="none"
          strokeWidth="22"
          className="stroke-app-input"
        />
        {active > 0 ? (
          <circle
            cx="80"
            cy="80"
            r="64"
            fill="none"
            strokeWidth="22"
            className="stroke-app-success"
            strokeDasharray={`${a} ${C - a}`}
            strokeDashoffset={0}
          />
        ) : null}
        {deleted > 0 ? (
          <circle
            cx="80"
            cy="80"
            r="64"
            fill="none"
            strokeWidth="22"
            className="stroke-app-danger"
            strokeDasharray={`${d} ${C - d}`}
            strokeDashoffset={-a}
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold text-app-text">{total}</p>
        <p className="px-2 text-center text-[0.68rem] uppercase tracking-wide text-app-muted">
          {t("overview.totalPersonnel")}
        </p>
      </div>
    </div>
  );
}

function LegendRow({
  icon,
  tone,
  toneClass,
  bgClass,
  label,
  hint,
  value,
}: {
  icon: ReactNode;
  tone: string;
  toneClass: string;
  bgClass: string;
  label: string;
  hint: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", bgClass, toneClass)}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-app-text">{label}</p>
        <p className="text-xs text-app-muted">{hint}</p>
      </div>
      <p className={toneClass}>
        <span className="text-xl font-bold">{value}</span>
        <span className="ml-1 text-xs font-semibold text-app-muted">{tone}</span>
      </p>
    </div>
  );
}

function ProgressRow({
  icon,
  label,
  hint,
  value,
  total,
  toneClass,
  bgClass,
  barClass,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
  value: number;
  total: number;
  toneClass: string;
  bgClass: string;
  barClass: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", bgClass, toneClass)}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-app-text">{label}</p>
          <p className="truncate text-xs text-app-muted">{hint}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold leading-none text-app-text">{value}</p>
          <p className={cn("mt-1 text-xs font-semibold", toneClass)}>{pct}%</p>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-app-input">
        <div
          className={cn("h-full rounded-full transition-all", barClass)}
          style={{ width: `${Math.max(pct, value > 0 ? 3 : 0)}%` }}
        />
      </div>
    </div>
  );
}

function groupCount<T>(items: T[], keyOf: (item: T) => string | undefined) {
  const map = new Map<string, number>();
  items.forEach((item) => {
    const key = keyOf(item)?.trim();
    if (!key) return;
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function BarList({
  title,
  subtitle,
  items,
  tone = "accent",
  icon,
}: {
  title: string;
  subtitle?: string;
  items: { label: string; value: number }[];
  tone?: "accent" | "gold" | "success" | "danger";
  icon?: ReactNode;
}) {
  const { t } = useLanguage();
  const max = Math.max(...items.map((item) => item.value), 1);
  const barColor = {
    accent: "bg-app-accent/70",
    gold: "bg-app-gold/70",
    success: "bg-app-success/70",
    danger: "bg-app-danger/70",
  }[tone];
  const iconTone = {
    accent: "bg-app-accent/10 text-app-accent",
    gold: "bg-app-gold/10 text-app-gold",
    success: "bg-app-success/10 text-app-success",
    danger: "bg-app-danger/10 text-app-danger",
  }[tone];

  return (
    <div className="panel flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-app-border px-5 py-4">
        {icon ? (
          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", iconTone)}>
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-app-text">{title}</h3>
          {subtitle ? <p className="truncate text-xs text-app-muted">{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex-1 space-y-3 p-5">
        {items.length === 0 ? (
          <p className="text-sm text-app-muted">{t("overview.noData")}</p>
        ) : (
          items.slice(0, 8).map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-app-text">{item.label}</span>
                <span className="shrink-0 text-xs font-semibold text-app-muted">{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-app-input">
                <div
                  className={cn("h-full rounded-full transition-all", barColor)}
                  style={{ width: `${Math.max((item.value / max) * 100, 3)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


function computeStats(profiles: SoldierProfileDetail[]): {
  total: number;
  active: number;
  deleted: number;
  totalRecords: number;
  genders: { label: string; value: number }[];
  units: { label: string; value: number }[];
  positions: { label: string; value: number }[];
  sheetCounts: {
    key: string;
    label: string;
    shortLabel: string;
    description: string;
    descriptionEn?: string;
    count: number;
  }[];
  withFamily: number;
  complete9: number;
} {
  const withPersonnel = profiles.filter((p) => p.personnel);
  const active = withPersonnel.filter((p) => !isDeleted(p.personnel));
  const deleted = withPersonnel.length - active.length;

  let totalRecords = 0;
  const sheetTotals = DETAIL_SHEET_DEFS.map((def) => {
    const rows = profiles.reduce((sum, p) => sum + (p[def.key]?.length ?? 0), 0);
    totalRecords += rows;
    return {
      key: def.key,
      label: formatSheetLabel(def.label),
      shortLabel: def.shortLabel,
      description: def.description,
      descriptionEn: def.descriptionEn,
      count: rows,
    };
  });

  totalRecords += withPersonnel.length;

  const genders = groupCount(withPersonnel, (p) => p.personnel!["ភេទ"]);
  const units = groupCount(withPersonnel, (p) => p.personnel!["កងឯកភាព"]);
  const positions = groupCount(withPersonnel, (p) => p.personnel!["ឋាននិរនាម/មុខតំណែងបច្ចុប្បន្ន"]);

  const withFamily = profiles.filter((p) => (p.familyBackground?.length ?? 0) > 0).length;

  return {
    total: withPersonnel.length,
    active: active.length,
    deleted,
    totalRecords,
    genders,
    units,
    positions,
    sheetCounts: [
      {
        key: "personnel",
        label: "01_Personnel",
        shortLabel: "Personnel",
        description: "ព័ត៌មានផ្ទាល់ខ្លួនយោធិន",
        descriptionEn: "Soldier personal information",
        count: withPersonnel.length,
      },
      ...sheetTotals,
    ],
    withFamily,
    complete9: profiles.filter((p) =>
      DETAIL_SHEET_DEFS.every((def) => (p[def.key]?.length ?? 0) > 0),
    ).length,
  };
}

export function DashboardOverview({ onNavigate }: OverviewProps) {
  const { lang, t } = useLanguage();
  const profilesQuery = useQuery({
    queryKey: ["profiles"],
    queryFn: fetchAllProfiles,
  });

  const stats = useMemo(() => computeStats(profilesQuery.data ?? []), [profilesQuery.data]);

  if (profilesQuery.isLoading) {
    return <Loader label={t("overview.loading")} />;
  }

  if (profilesQuery.isError) {
    return (
      <EmptyState
        icon={<ShieldX className="h-10 w-10" />}
        title={t("overview.loadFailed")}
        description={profilesQuery.error instanceof Error ? profilesQuery.error.message : t("common.unknownError")}
        action={<Button variant="add" onClick={() => profilesQuery.refetch()}>{t("common.retry")}</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-app-border bg-gradient-to-br from-app-card via-app-card to-app-surface p-6 shadow-xl shadow-black/20 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-app-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-app-gold/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-app-gold/30 bg-app-gold/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-app-gold">
              <Activity className="h-3.5 w-3.5" />
              {t("overview.commandCenter")}
            </span>
            <h2 className="mt-4 text-2xl font-bold text-app-text sm:text-3xl">
              {t("overview.welcome")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-app-muted">
              {t("overview.byline")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end" >
            <Button
              variant="add"
              onClick={() => onNavigate("directory")}
              className="bg-app-accent/10 text-app-accent"
            >
              <Users className="mr-1.5 h-4 w-4" />
              {t("overview.directoryBtn")}
            </Button>
            <Button
              variant="add"
              onClick={() => onNavigate("composer")}
              className="bg-app-gold/10 text-app-gold"
            >
              <UserPlus className="mr-1.5 h-4 w-4" />
              {t("overview.newRecordBtn")}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="panel overflow-hidden">
          <div className="flex items-center gap-3 border-b border-app-border px-5 py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-app-gold/10 text-app-gold">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-app-text">{t("overview.breakdown")}</h3>
              <p className="text-xs text-app-muted">{t("overview.breakdownSubtitle")}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-6 p-5 sm:flex-row sm:gap-8">
            <Donut active={stats.active} deleted={stats.deleted} total={stats.total} />
            <div className="w-full flex-1 space-y-4">
              <LegendRow
                icon={<ShieldCheck className="h-4 w-4" />}
                tone="ACTIVE"
                toneClass="text-app-success"
                bgClass="bg-app-success/10"
                label={t("overview.active")}
                hint={t("overview.activeHint")}
                value={stats.active}
              />
              <LegendRow
                icon={<ShieldX className="h-4 w-4" />}
                tone="DELETED"
                toneClass="text-app-danger"
                bgClass="bg-app-danger/10"
                label={t("overview.deleted")}
                hint={t("overview.deletedHint")}
                value={stats.deleted}
              />
              <LegendRow
                icon={<Layers className="h-4 w-4" />}
                tone="ALL"
                toneClass="text-app-gold"
                bgClass="bg-app-gold/10"
                label={t("overview.records")}
                hint={t("overview.recordsHint")}
                value={stats.totalRecords}
              />
            </div>
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="flex items-center gap-3 border-b border-app-border px-5 py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-app-success/10 text-app-success">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-app-text">{t("overview.completeness")}</h3>
              <p className="text-xs text-app-muted">{t("overview.completenessSubtitle")}</p>
            </div>
          </div>
          <div className="space-y-6 p-5">
            <ProgressRow
              icon={<HeartHandshake className="h-4 w-4" />}
              label={t("overview.withFamily")}
              hint={t("overview.withFamilyHint")}
              value={stats.withFamily}
              total={stats.total}
              toneClass="text-app-gold"
              bgClass="bg-app-gold/10"
              barClass="bg-app-gold/70"
            />
            <ProgressRow
              icon={<BadgeCheck className="h-4 w-4" />}
              label={t("overview.completeProfiles")}
              hint={t("overview.completeProfilesHint")}
              value={stats.complete9}
              total={stats.total}
              toneClass="text-app-success"
              bgClass="bg-app-success/10"
              barClass="bg-app-success/70"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <BarList
          title={t("overview.genderSplit")}
          subtitle={t("overview.genderSplit", undefined, lang === "en" ? "km" : "en")}
          items={stats.genders}
          tone="accent"
          icon={<Users className="h-4 w-4" />}
        />
        <BarList
          title={t("overview.topUnits")}
          subtitle={t("overview.topUnits", undefined, lang === "en" ? "km" : "en")}
          items={stats.units}
          tone="gold"
          icon={<Database className="h-4 w-4" />}
        />
        <BarList
          title={t("overview.rankPosition")}
          subtitle={t("overview.rankPosition", undefined, lang === "en" ? "km" : "en")}
          items={stats.positions}
          tone="success"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}
