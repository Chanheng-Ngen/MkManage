"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Link2, ShieldCheck } from "lucide-react";
import { consumeRegisterToken, validateRegisterToken } from "@/lib/api";
import { APP_TITLE } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n";
import type { DetailSheetKey, FullProfileDraft, Row } from "@/lib/types";
import { SoldierBioForm } from "@/components/features/SoldierBioForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";
import { blankPersonnel } from "@/lib/utils";

function blankDraft(personnelId?: string): FullProfileDraft {
  const sheets: Record<DetailSheetKey, Row[]> = {
    familyBackground: [],
    parents: [],
    spouse: [],
    childrenInfo: [],
    educationTimeline: [],
    rankPositionHistory: [],
    combatServiceLog: [],
    conductRecord: [],
  };
  const personnel = blankPersonnel();
  if (personnelId) personnel.Personnel_ID = personnelId;
  return { personnel, sheets };
}

function RegisterShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0a1120] via-[#0c1424] to-[#0a1120] text-app-text">
      <div className="bg-grid pointer-events-none fixed inset-0" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8 sm:px-6">
        <header className="mb-6 flex flex-col items-center gap-3 text-center">
          <Image
            src="/images/logo.jpg"
            alt="Logo"
            width={200}
            height={100}
            priority
            className="h-12 w-auto rounded-lg object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-app-text sm:text-2xl">{t("register.title")}</h1>
            <p className="mt-1 text-sm text-app-muted">{t("register.subtitle")}</p>
          </div>
        </header>
        <div className="panel relative overflow-hidden">{children}</div>
        <footer className="mt-6 pb-6 text-center text-xs text-app-muted/60">
          {APP_TITLE} · {t("layout.footer")}
        </footer>
      </div>
    </main>
  );
}

export function SelfRegistration({ token }: { token: string }) {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  const query = useQuery({
    queryKey: ["register-token", token],
    queryFn: () => validateRegisterToken(token),
    enabled: Boolean(token),
    retry: false,
  });

  const initialDraft = useMemo<FullProfileDraft | undefined>(() => {
    if (!query.data?.valid) return undefined;
    return blankDraft(query.data.record?.Personnel_ID);
  }, [query.data]);

  const handleSaved = () => {
    setSubmitted(true);
    void consumeRegisterToken(token).catch(() => {
      /* token consumption is best-effort */
    });
  };

  let body: ReactNode;

  if (!token) {
    body = (
      <div className="p-5 sm:p-8">
        <EmptyState
          icon={<Link2 className="h-10 w-10" />}
          title={t("register.missingError")}
          description={t("register.missingErrorDesc")}
          action={
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold text-app-accent transition-colors hover:bg-app-accent/10"
            >
              {t("register.backHome")}
            </Link>
          }
        />
      </div>
    );
  } else if (query.isLoading) {
    body = (
      <div className="p-5 sm:p-8">
        <Loader label={t("register.loading")} />
      </div>
    );
  } else if (query.isError || !query.data?.valid) {
    const used = query.isSuccess && query.data?.reason === "used";
    body = (
      <div className="p-5 sm:p-8">
        <EmptyState
          icon={<ShieldCheck className="h-10 w-10" />}
          title={used ? t("register.usedError") : t("register.invalidError")}
          description={used ? t("register.usedErrorDesc") : t("register.invalidErrorDesc")}
          action={
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold text-app-accent transition-colors hover:bg-app-accent/10"
            >
              {t("register.backHome")}
            </Link>
          }
        />
      </div>
    );
  } else if (submitted) {
    body = (
      <div className="p-5 sm:p-8">
        <EmptyState
          icon={<CheckCircle2 className="h-10 w-10" />}
          title={t("register.submittedTitle")}
          description={t("register.submittedDesc")}
        />
      </div>
    );
  } else {
    body = initialDraft ? (
      <div className="p-4 sm:p-6">
        <SoldierBioForm
          key={token}
          initialDraft={initialDraft}
          showRegistrationControl={false}
          onSaved={handleSaved}
        />
      </div>
    ) : (
      <Loader label={t("register.loading")} />
    );
  }

  return <RegisterShell>{body}</RegisterShell>;
}