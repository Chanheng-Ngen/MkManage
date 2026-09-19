import { ArchiveRestore, LayoutDashboard, UserPlus, Users } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
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

interface MobileNavProps {
  active: DashboardView;
  onNavigate: (view: DashboardView) => void;
}

export function MobileNav({ active, onNavigate }: MobileNavProps) {
  const { lang } = useLanguage();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-app-border bg-app-bg/90 pb-[max(env(safe-area-inset-bottom),0.375rem)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.id];
          const isActive = active === item.id;
          const label = lang === "en" ? item.label : (item.khmer ?? item.label);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-[0.65rem] font-semibold transition-colors",
                isActive ? "text-app-accent" : "text-app-muted hover:text-app-text",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                  isActive ? "bg-app-accent/15 text-app-accent" : "bg-transparent",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}