import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-app-border bg-app-input/30 px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? <div className="text-app-muted">{icon}</div> : null}
      <div>
        <p className="font-semibold text-app-text">{title}</p>
        {description ? <p className="mt-1 max-w-md text-sm text-app-muted">{description}</p> : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}