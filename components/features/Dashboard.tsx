"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Topbar } from "@/components/layout/Topbar";
import { DashboardOverview } from "@/components/features/DashboardOverview";
import { PersonnelDirectory } from "@/components/features/PersonnelDirectory";
import { ProfileViewer } from "@/components/features/ProfileViewer";
import { SoldierBioForm } from "@/components/features/SoldierBioForm";
import { DeletedRecords } from "@/components/features/DeletedRecords";
import { fetchProfileDetail } from "@/lib/api";
import type { DashboardView } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { sheetRowsToDraft } from "@/lib/utils";

export function Dashboard() {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string | null>(null);
  const [directorySearch, setDirectorySearch] = useState("");
  const [composerPersonnelId, setComposerPersonnelId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const composerDraftQuery = useQuery({
    queryKey: ["composer-draft", composerPersonnelId],
    queryFn: () => fetchProfileDetail(composerPersonnelId as string),
    enabled: Boolean(composerPersonnelId),
  });

  const navigate = (view: DashboardView) => {
    setActiveView(view);
  };

  const handleSelectPersonnel = (personnelId: string) => {
    setSelectedPersonnelId(personnelId);
    setActiveView("profile");
  };

  const handleTopSearch = (query: string) => {
    setDirectorySearch(query);
    setActiveView("directory");
  };

  const handleEditPersonnel = (personnelId: string) => {
    setComposerPersonnelId(personnelId);
    setActiveView("composer");
  };

  const refreshAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    await queryClient.invalidateQueries({ queryKey: ["personnel"] });
    await queryClient.invalidateQueries({ queryKey: ["profiles"] });
    await queryClient.invalidateQueries({ queryKey: ["sheet"] });
    await queryClient.invalidateQueries({ queryKey: ["deleted"] });
  };

  const isRefreshing = queryClient.isFetching() > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1120] via-[#0c1424] to-[#0a1120] text-app-text">
      <div className="bg-grid pointer-events-none fixed inset-0" />
      <Sidebar active={activeView} onNavigate={navigate} />
      <MobileNav active={activeView} onNavigate={navigate} />

      <div className="relative min-h-screen lg:pl-64">
        <Topbar
          active={activeView}
          onRefresh={refreshAll}
          refreshing={isRefreshing}
          onSearch={handleTopSearch}
        />

        <main className="mx-auto w-full max-w-[1720px] px-4 pb-24 pt-6 lg:px-6 lg:pb-6">
          {activeView === "overview" ? (
            <DashboardOverview onNavigate={navigate} />
          ) : null}

          {activeView === "directory" ? (
            <PersonnelDirectory
              search={directorySearch}
              onSearchChange={setDirectorySearch}
              onSelect={handleSelectPersonnel}
            />
          ) : null}

          {activeView === "profile" && selectedPersonnelId ? (
            <ProfileViewer
              personnelId={selectedPersonnelId}
              onBack={() => setActiveView("directory")}
              onEditPersonnel={handleEditPersonnel}
            />
          ) : null}

          {activeView === "composer" ? (
            <div className="space-y-5">
              {composerPersonnelId && composerDraftQuery.isLoading ? (
                <Loader label={t("dashboard.loadingProfile")} />
              ) : composerPersonnelId && composerDraftQuery.isError ? (
                <EmptyState
                  icon={<></>}
                  title={t("dashboard.loadFailed")}
                  description={
                    composerDraftQuery.error instanceof Error
                      ? composerDraftQuery.error.message
                      : t("common.unknownError")
                  }
                  action={
                    <Button variant="add" onClick={() => setComposerPersonnelId(null)}>
                      {t("dashboard.createMode")}
                    </Button>
                  }
                />
              ) : (
                <SoldierBioForm
                  key={composerPersonnelId ?? "new"}
                  initialDraft={
                    composerPersonnelId
                      ? (composerDraftQuery.data
                          ? sheetRowsToDraft(composerDraftQuery.data)
                          : undefined)
                      : undefined
                  }
                  selectedPersonnelId={composerPersonnelId}
                  onSaved={() => {
                    void refreshAll();
                    setComposerPersonnelId(null);
                    setActiveView("directory");
                  }}
                />
              )}
            </div>
          ) : null}

          {activeView === "deleted" ? (
            <DeletedRecords onView={handleSelectPersonnel} />
          ) : null}
        </main>
      </div>
    </div>
  );
}