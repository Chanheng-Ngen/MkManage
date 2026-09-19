import { useMemo, useState } from "react";
import Image from "next/image";
import { Languages, RefreshCw, Search } from "lucide-react";
import { APP_TITLE, NAV_ITEMS } from "@/lib/constants";
import type { DashboardView } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface TopbarProps {
  active: DashboardView;
  onRefresh: () => void;
  refreshing?: boolean;
  onSearch: (query: string) => void;
}

export function Topbar({
  active,
  onRefresh,
  refreshing,
  onSearch,
}: TopbarProps) {
  const [query, setQuery] = useState("");
  const { lang, toggleLanguage, t } = useLanguage();
  const current = useMemo(() => NAV_ITEMS.find((item) => item.id === active) ?? null, [active]);
  const currentLabel = useMemo(() => {
    if (!current) return { primary: t("topbar.dashboard"), secondary: t("topbar.dashboard") };
    if (lang === "en") return { primary: current.label, secondary: current.khmer ?? "" };
    return { primary: current.khmer ?? current.label, secondary: current.label };
  }, [current, lang, t]);

  return (
    <header className="sticky top-0 z-30 border-b border-app-border bg-app-bg/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        <div className="hidden min-w-0 items-center gap-2.5 sm:flex">
          <Image
            src="/images/logo.jpg"
            alt="Logo"
            width={200}
            height={100}
            priority
            className="h-9 w-auto rounded-lg object-contain"
          />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold text-app-text">{APP_TITLE}</p>
          </div>
        </div>

        <div className="mx-2 h-6 w-px bg-app-border" />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-app-text">{currentLabel.primary}</p>
        </div>

        <form
          className="relative hidden md:block"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch(query.trim());
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("topbar.searchPlaceholder")}
            className="h-10 w-56 rounded-xl border border-app-border bg-app-input pl-9 pr-3 text-sm text-app-text outline-none transition-colors placeholder:text-app-muted/60 focus:border-app-accent lg:w-72"
          />
        </form>

        <button
          type="button"
          onClick={toggleLanguage}
          aria-label="Switch language"
          title={lang === "en" ? "ខ្មែរ" : "English"}
          className="flex items-center gap-1.5 rounded-xl border border-app-border bg-app-input px-3 py-2 text-xs font-semibold text-app-muted transition-colors hover:border-app-accent/50 hover:text-app-text"
        >
          <Languages className="h-4 w-4" />
          <span>{lang === "en" ? "ខ្មែរ" : "EN"}</span>
        </button>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className={cn(
            "flex items-center gap-2 rounded-xl border border-app-border bg-app-input px-3 py-2 text-xs font-semibold text-app-muted transition-colors hover:border-app-accent/50 hover:text-app-text disabled:opacity-60",
          )}
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          <span className="hidden sm:inline">{t("topbar.refresh")}</span>
        </button>
      </div>
    </header>
  );
}