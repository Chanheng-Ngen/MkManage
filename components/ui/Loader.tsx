import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Loader({
  label = "Loading...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-14 text-app-muted",
        className,
      )}
    >
      <Loader2 className="h-7 w-7 animate-spin text-app-accent" />
      <p className="text-sm">{label}</p>
    </div>
  );
}