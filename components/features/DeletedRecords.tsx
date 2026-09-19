"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArchiveRestore, Search, ShieldCheck, Trash2 } from "lucide-react";
import { fetchPersonnelList, restorePersonnel } from "@/lib/api";
import type { PersonnelRecord } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";
import { displayName, isDeleted } from "@/lib/utils";

export function DeletedRecords() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["deleted", search],
    queryFn: () =>
      fetchPersonnelList({ limit: 100, q: search || undefined, includeDeleted: true }),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restorePersonnel(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["deleted"] });
      await queryClient.invalidateQueries({ queryKey: ["personnel"] });
      await queryClient.invalidateQueries({ queryKey: ["profiles"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const deleted = (query.data?.items ?? []).filter(isDeleted);

  if (query.isLoading) {
    return <Loader label={t("deleted.loading")} />;
  }

  if (query.isError) {
    return (
      <EmptyState
        icon={<Trash2 className="h-10 w-10" />}
        title={t("deleted.loadFailed")}
        description={query.error instanceof Error ? query.error.message : t("common.unknownError")}
      />
    );
  }

  return (
    <div className="space-y-5">

      {deleted.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="h-10 w-10" />}
          title={t("deleted.emptyTitle")}
          description={t("deleted.emptyDesc")}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {deleted.map((item: PersonnelRecord) => (
            <div
              key={item.Personnel_ID}
              className="rounded-2xl border border-app-danger/30 bg-app-card p-5"
            >
              <div className="flex items-start gap-4">
                <Avatar
                  name={displayName(item)}
                  personnelId={item.Personnel_ID}
                  photoUrl={item["រូបថត Link"]}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-app-text">{displayName(item)}</p>
                  <p className="mt-0.5 font-mono text-xs text-app-muted">{item.Personnel_ID}</p>
                  <div className="mt-2">
                    <Badge tone="danger">
                      <ArchiveRestore className="h-3 w-3" />
                      {item.Status ?? "DELETED"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-app-border/60 pt-3">
                <Button variant="add" onClick={() => restoreMutation.mutate(item.Personnel_ID)} disabled={restoreMutation.isPending} className="w-full !text-xs">
                  <ArchiveRestore className="mr-1.5 h-4 w-4" />
                  {t("deleted.restore")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}