import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "add" | "danger" | "secondary";

const variants: Record<ButtonVariant, string> = {
  primary:
    "w-full max-w-150 h-12 rounded-lg text-white font-bold text-base cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed bg-linear-to-r from-[#00b4db] to-[#0083b0]",
  add: "inline-flex h-11 items-center justify-center rounded-lg border border-dashed border-app-accent bg-transparent px-4 font-semibold text-app-accent cursor-pointer hover:bg-app-accent/5 transition-colors disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-app-border bg-app-card px-3 sm:px-4 text-sm font-bold text-app-text cursor-pointer transition-all hover:border-app-accent/50 hover:text-app-accent disabled:cursor-not-allowed disabled:border-app-border disabled:text-app-muted/50 disabled:hover:border-app-border disabled:hover:text-app-muted/50",
  danger:
    "w-7 h-7 rounded-full border border-app-danger text-app-danger bg-app-danger/10 cursor-pointer hover:bg-app-danger/20 transition-colors",
};

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(variants[variant], className)}
      {...props}
    />
  );
}