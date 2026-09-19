import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "accent" | "gold" | "success" | "danger" | "muted";

const tones: Record<Tone, string> = {
  default: "border-app-border bg-app-input/70 text-app-text",
  accent: "border-app-accent/40 bg-app-accent/10 text-app-accent",
  gold: "border-app-gold/40 bg-app-gold/10 text-app-gold",
  success: "border-app-success/40 bg-app-success/10 text-app-success",
  danger: "border-app-danger/40 bg-app-danger/10 text-app-danger",
  muted: "border-app-border bg-app-input/40 text-app-muted",
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Badge({ tone = "default", children, className, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}