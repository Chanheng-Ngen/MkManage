import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  subtitle?: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: "accent" | "gold" | "success" | "danger" | "muted";
  hint?: string;
  className?: string;
}

const iconTones = {
  accent: "bg-app-accent/10 text-app-accent border-app-accent/30",
  gold: "bg-app-gold/10 text-app-gold border-app-gold/30",
  success: "bg-app-success/10 text-app-success border-app-success/30",
  danger: "bg-app-danger/10 text-app-danger border-app-danger/30",
  muted: "bg-app-input/60 text-app-muted border-app-border",
};

export function StatCard({
  label,
  subtitle,
  value,
  icon,
  tone = "accent",
  hint,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-app-border bg-app-card/90 p-5 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:border-app-accent/40",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-app-accent/5 blur-2xl" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-app-muted">
            {label}
          </p>
          {subtitle ? <p className="mt-1 text-xs text-app-muted/80">{subtitle}</p> : null}
          <p className="mt-3 text-3xl font-bold tracking-tight text-app-text">{value}</p>
        </div>
        {icon ? (
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
              iconTones[tone],
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-3 text-[0.78rem] text-app-muted">{hint}</p> : null}
    </div>
  );
}