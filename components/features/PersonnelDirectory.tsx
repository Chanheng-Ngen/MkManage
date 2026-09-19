"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as GoIcon,
  LayoutGrid,
  Search,
  Table2,
  Users,
} from "lucide-react";
import { fetchPersonnelList } from "@/lib/api";
import type { PersonnelRecord } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";
import { cn, displayName, isDeleted } from "@/lib/utils";

type StatusFilter = "all" | "active" | "deleted";
type ViewMode = "card" | "table";

interface PersonnelDirectoryProps {
  search: string;
  onSearchChange: (query: string) => void;
  onSelect: (personnelId: string) => void;
}

const VIEW_STORAGE_KEY = "makara.directoryView";

function initialView(): ViewMode {
  if (typeof window === "undefined") return "card";
  try {
    return window.localStorage.getItem(VIEW_STORAGE_KEY) === "table" ? "table" : "card";
  } catch {
    return "card";
  }
}

function DirectoryTable({
  items,
  onSelect,
}: {
  items: PersonnelRecord[];
  onSelect: (personnelId: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="bg-app-input/70">
            <tr>
              <th className="thead-cell">{t("directory.no")}</th>
              <th className="thead-cell">{t("directory.personnelCol")}</th>
              <th className="thead-cell">{t("directory.id")}</th>
              <th className="thead-cell">{t("directory.gender")}</th>
              <th className="thead-cell">{t("directory.rank")}</th>
              <th className="thead-cell">{t("directory.unit")}</th>
              <th className="thead-cell">{t("common.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {items.map((item, index) => (
              <tr
                key={item.Personnel_ID}
                onClick={() => onSelect(item.Personnel_ID)}
                className="cursor-pointer transition-colors hover:bg-app-card2/60"
              >
                <td className="tbody-cell text-app-muted">{index + 1}</td>
                <td className="tbody-cell">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={displayName(item)}
                      personnelId={item.Personnel_ID}
                      photoUrl={item["រូបថត Link"]}
                      size="sm"
                    />
                    <span className="font-semibold text-app-text">{displayName(item)}</span>
                  </div>
                </td>
                <td className="tbody-cell font-mono text-xs text-app-accent">{item.Personnel_ID}</td>
                <td className="tbody-cell">{item["ភេទ"] || "—"}</td>
                <td className="tbody-cell">{item["ឋាននិរនាម/មុខតំណែងបច្ចុប្បន្ន"] || "—"}</td>
                <td className="tbody-cell">{item["កងឯកភាព"] || "—"}</td>
                <td className="tbody-cell">
                  <Badge tone={isDeleted(item) ? "danger" : "success"} title={t("common.status")}>
                    {item.Status ?? "ACTIVE"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PersonnelDirectory({
  search,
  onSearchChange,
  onSelect,
}: PersonnelDirectoryProps) {
  const { lang, t } = useLanguage();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<StatusFilter>("active");
  const [view, setView] = useState<ViewMode>(initialView);

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch {
      /* ignore */
    }
  }, [view]);

  const filterLabel: Record<StatusFilter, string> = {
    all: t("directory.filterAll"),
    active: "ACTIVE",
    deleted: "DELETED",
  };

  const listQuery = useQuery({
    queryKey: ["personnel", page, search, filter],
    queryFn: () =>
      fetchPersonnelList({
        page,
        limit: 12,
        q: search || undefined,
        includeDeleted: filter === "all" || filter === "deleted",
      }),
  });

  const items = (listQuery.data?.items ?? []).filter((item) =>
    filter === "deleted" ? isDeleted(item) : true,
  );

  const pagination = listQuery.data?.pagination;
  const showBar = Boolean(pagination && !listQuery.isLoading && items.length > 0);
  const resultWord = lang === "en" ? (pagination?.total === 1 ? "result" : "results") : t("directory.result");

  const changeSearch = (value: string) => {
    onSearchChange(value);
    setPage(1);
  };

  const changeFilter = (value: StatusFilter) => {
    setFilter(value);
    setPage(1);
  };

  return (
    <div className={cn("space-y-5", showBar && "pb-36 lg:pb-24")}>
      <div className="flex rounded-xl border border-app-border bg-app-input p-1">
        {(["all", "active", "deleted"] as StatusFilter[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => changeFilter(id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
              filter === id
                ? "bg-app-accent/15 text-app-accent"
                : "text-app-muted hover:text-app-text",
            )}
          >
            {filterLabel[id]}
          </button>
        ))}
          <button
          type="button"
          onClick={() => setView("card")}
          aria-label={t("directory.viewCards")}
          title={t("directory.viewCards")}
          className={cn(
            "flex items-center rounded-lg px-2.5 py-1.5 transition-colors",
            view === "card" ? "bg-app-accent/15 text-app-accent" : "text-app-muted hover:text-app-text",
          )}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setView("table")}
          aria-label={t("directory.viewTable")}
          title={t("directory.viewTable")}
          className={cn(
            "flex items-center rounded-lg px-2.5 py-1.5 transition-colors",
            view === "table" ? "bg-app-accent/15 text-app-accent" : "text-app-muted hover:text-app-text",
          )}
        >
          <Table2 className="h-4 w-4" />
        </button>
      </div>
      {listQuery.isLoading ? (
        <Loader label={t("directory.loading")} />
      ) : listQuery.isError ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title={t("directory.loadFailed")}
          description={listQuery.error instanceof Error ? listQuery.error.message : t("common.unknownError")}
          action={<Button variant="add" onClick={() => listQuery.refetch()}>{t("common.retry")}</Button>}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title={t("directory.noResults")}
          description={t("directory.noResultsDesc")}
        />
      ) : view === "table" ? (
        <DirectoryTable items={items} onSelect={onSelect} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item: PersonnelRecord) => (
            <button
              key={item.Personnel_ID}
              type="button"
              onClick={() => onSelect(item.Personnel_ID)}
              className="group relative overflow-hidden rounded-2xl border border-app-border bg-app-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-app-accent/50 hover:shadow-xl hover:shadow-app-accent/5"
            >
              <div className="flex items-start gap-4">
                <Avatar
                  name={displayName(item)}
                  personnelId={item.Personnel_ID}
                  photoUrl={item["រូបថត Link"]}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-app-text group-hover:text-app-accent">
                    {displayName(item)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-app-muted">{item.Personnel_ID}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge tone={isDeleted(item) ? "danger" : "success"} title={t("common.status")}>
                      {item.Status ?? "ACTIVE"}
                    </Badge>
                    {item["ភេទ"] ? <Badge tone="muted">{item["ភេទ"]}</Badge> : null}
                  </div>
                </div>
                <GoIcon className="mt-1 h-4 w-4 shrink-0 text-app-muted transition-transform group-hover:translate-x-0.5 group-hover:text-app-accent" />
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-app-border/60 pt-3 text-[0.72rem] text-app-muted">
                <span className="truncate">
                  {item["ឋាននិរនាម/មុខតំណែងបច្ចុប្បន្ន"] || t("common.noPosition")}
                </span>
                <span className="truncate">{item["កងឯកភាព"] || t("common.noUnit")}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {showBar ? (
        <div className="fixed inset-x-0 bottom-[4.75rem] z-30 flex justify-center px-4 lg:bottom-4">
          <div className="flex items-center gap-2 rounded-2xl border border-app-border bg-app-surface/95 px-3 py-2 shadow-2xl shadow-black/50 backdrop-blur sm:gap-3 sm:px-4">
            <Button
              variant="add"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination?.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
              {t("directory.prev")}
            </Button>
            <p className="whitespace-nowrap px-1 text-xs text-app-muted">
              {t("directory.page")}{" "}
              <span className="font-bold text-app-text">{page}</span>{" "}
              /{" "}
              <span className="font-bold text-app-text">{pagination?.totalPages}</span> ·{" "}
              {pagination?.total} {resultWord}
            </p>
            <Button
              variant="add"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination?.hasNextPage}
            >
              {t("directory.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}