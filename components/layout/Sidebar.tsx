import {
  ArchiveRestore,
  LayoutDashboard,
  ShieldHalf,
  UserPlus,
  Users,
} from "lucide-react";
import { APP_SHORT_TITLE, NAV_ITEMS } from "@/lib/constants";
import type { DashboardView } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const ICONS: Record<DashboardView, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  directory: Users,
  composer: UserPlus,
  deleted: ArchiveRestore,
  profile: Users,
};

interface SidebarProps {
  active: DashboardView;
  onNavigate: (view: DashboardView) => void;
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  const { lang, t } = useLanguage();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-app-border bg-app-surface lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between gap-3 border-b border-app-border px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-app-gold/40 bg-app-gold/10 text-app-gold">
              <ShieldHalf className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-app-text">{APP_SHORT_TITLE}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.id];
            const isActive = active === item.id;
            const primary = lang === "en" ? item.label : (item.khmer ?? item.label);
            const secondary = lang === "en" ? (item.khmer ?? "") : item.label;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                  isActive
                    ? "border border-app-accent/40 bg-app-accent/10 text-app-accent"
                    : "border border-transparent text-app-muted hover:bg-app-card hover:text-app-text",
                )}
              >
                <Icon className="h-[1.15rem] w-[1.15rem] shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{primary}</span>
                </span>
                {isActive ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-app-accent" />
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-app-border p-4">
          <p className="text-[0.7rem] leading-5 text-app-muted">{t("layout.footer")}</p>
        </div>
      </div>
    </aside>
  );
}