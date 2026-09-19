import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { DEFAULT_PHOTO_PATH } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { SheetFieldDef } from "@/lib/types";

const base =
  "w-full rounded-xl border border-app-border bg-app-input px-3.5 py-2.5 text-sm text-app-text outline-none transition-colors placeholder:text-app-muted/60 focus:border-app-accent";

interface FieldEditorProps {
  field: SheetFieldDef;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface SelectFieldProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

function SelectField({ value, options, onChange, disabled }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const optList = ["", ...options];

  const close = useCallback(() => {
    setOpen(false);
    setHighlight(0);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const openMenu = () => {
    if (disabled) return;
    const idx = value ? optList.indexOf(value) : 0;
    setHighlight(idx < 0 ? 0 : idx);
    setOpen(true);
  };

  const choose = (opt: string) => {
    onChange(opt);
    close();
  };

  const onButtonKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) e.preventDefault();
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) openMenu();
      return;
    }
    if (e.key === "ArrowDown") setHighlight((h) => Math.min(optList.length - 1, h + 1));
    else if (e.key === "ArrowUp") setHighlight((h) => Math.max(0, h - 1));
    else if (e.key === "Enter") choose(optList[highlight]);
    else if (e.key === " ") close();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          base,
          "flex cursor-pointer items-center justify-between gap-2 text-left",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span className={cn("truncate", !value && "text-app-muted/60")}>
          {value || "—"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-app-muted transition-transform duration-200",
            open && "rotate-180 text-app-accent",
          )}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-app-border bg-app-surface/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl"
        >
          {optList.map((opt, i) => {
            const isSelected = value === opt;
            const isHighlighted = highlight === i;
            return (
              <li key={opt || "__clear__"}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => choose(opt)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    isSelected && "bg-app-accent/15 text-app-accent",
                    !isSelected && isHighlighted && "bg-app-card text-app-text",
                    !isSelected && !isHighlighted && "text-app-text hover:bg-app-card hover:text-app-accent",
                  )}
                >
                  <span className={cn("flex-1 truncate", opt === "" && "text-app-muted/60")}>
                    {opt || "—"}
                  </span>
                  {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

interface DateFieldProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? "");
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function DateField({ value, placeholder, onChange, disabled }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = useMemo(() => parseISODate(value), [value]);

  const [today] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  });

  const [view, setView] = useState(() => {
    const base = selected ?? new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  const openCalendar = () => {
    if (disabled) return;
    const base = selected ?? new Date();
    setView({ year: base.getFullYear(), month: base.getMonth() });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const trailing = (42 - firstWeekday - daysInMonth) % 7;
  const dayCells = [
    ...Array.from({ length: firstWeekday }, () => 0),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array.from({ length: trailing }, () => 0),
  ];

  const choose = (year: number, month: number, day: number) => {
    onChange(toISODate(year, month, day));
    setOpen(false);
  };

  const display = selected
    ? `${String(selected.getDate()).padStart(2, "0")}/${String(selected.getMonth() + 1).padStart(2, "0")}/${selected.getFullYear()}`
    : (placeholder ?? "YYYY-MM-DD");

  const isToday = (year: number, month: number, day: number) =>
    year === today.year && month === today.month && day === today.day;

  const isSelected = (year: number, month: number, day: number) =>
    !!selected && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={openCalendar}
        className={cn(
          base,
          "flex cursor-pointer items-center justify-between gap-2 text-left",
          !selected && "text-app-muted/60",
          disabled && "cursor-not-allowed opacity-60",
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="truncate">{display}</span>
        <Calendar
          className={cn(
            "h-4 w-4 shrink-0 text-app-muted transition-colors",
            open && "text-app-accent",
          )}
        />
      </button>

      <div className="absolute inset-y-0 right-2 flex items-center gap-0.5" onPointerDown={(e) => e.stopPropagation()}>
        {selected && !disabled ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => onChange("")}
            aria-label="Clear date"
            className="rounded-md p-1.5 text-app-muted transition-colors hover:text-app-danger"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <button
          type="button"
          tabIndex={-1}
          onClick={openCalendar}
          aria-label="Open calendar"
          className="rounded-md p-1.5 text-app-muted transition-colors hover:text-app-accent"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      {open ? (
        <div
          role="dialog"
          aria-label="Date picker"
          className="absolute right-0 z-50 mt-2 w-[18rem] overflow-hidden rounded-xl border border-app-border bg-app-surface/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-1 border-b border-app-border/70 p-2">
            <button
              type="button"
              onClick={() => setView((v) => ({ ...v, month: v.month - 1 }))}
              aria-label="Previous month"
              className="rounded-lg p-1.5 text-app-muted transition-colors hover:bg-app-card hover:text-app-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-bold text-app-text">
              {MONTHS[view.month]} <span className="text-app-accent">{view.year}</span>
            </p>
            <button
              type="button"
              onClick={() => setView((v) => ({ ...v, month: v.month + 1 }))}
              aria-label="Next month"
              className="rounded-lg p-1.5 text-app-muted transition-colors hover:bg-app-card hover:text-app-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 p-2">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="flex h-8 items-center justify-center text-[0.65rem] font-semibold uppercase tracking-wide text-app-muted/70"
              >
                {day}
              </span>
            ))}
            {dayCells.map((day, i) => {
              if (day === 0) return <span key={`blank-${i}`} className="h-8" />;
              const selectedInView = isSelected(view.year, view.month, day);
              const todayInView = isToday(view.year, view.month, day);
              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => choose(view.year, view.month, day)}
                  className={cn(
                    "flex h-8 items-center justify-center rounded-lg text-xs transition-colors",
                    selectedInView
                      ? "bg-app-accent font-bold text-app-bg"
                      : todayInView
                        ? "text-app-accent ring-1 ring-inset ring-app-accent/60"
                        : "text-app-text hover:bg-app-card hover:text-app-accent",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="border-t border-app-border/70 p-2">
            <button
              type="button"
              onClick={() => choose(today.year, today.month, today.day)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold text-app-accent transition-colors hover:bg-app-accent/10"
            >
              <Calendar className="h-3.5 w-3.5" />
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function FieldEditor({ field, value, onChange, disabled }: FieldEditorProps) {
  const label = field.label ? (
    <p className="mb-1.5 text-xs font-semibold text-app-muted">
      {field.key}
      <span className="ml-1.5 font-normal text-app-muted/70">{field.label}</span>
    </p>
  ) : (
    <p className="mb-1.5 text-xs font-semibold text-app-muted">{field.key}</p>
  );

  const shared = {
    className: cn(base, disabled && "cursor-not-allowed opacity-60"),
    disabled,
    value,
  };

  if (field.type === "textarea") {
    return (
      <div>
        {label}
        <textarea
          {...shared}
          className={cn(base, "min-h-[80px] resize-y", disabled && "cursor-not-allowed opacity-60")}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        {label}
        <SelectField
          value={value}
          options={field.options ?? []}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
    );
  }

  if (field.type === "photo") {
    return (
      <div>
        {label}
        <div className="flex gap-3">
          <input
            {...shared}
            placeholder="https://..."
            onChange={(e) => onChange(e.target.value)}
          />
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="preview"
              className="h-11 w-11 shrink-0 rounded-lg border border-app-border object-cover"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PHOTO_PATH;
              }}
            />
          ) : null}
        </div>
      </div>
    );
  }

  if (field.type === "date") {
    return (
      <div>
        {label}
        <DateField value={value} onChange={onChange} disabled={disabled} />
      </div>
    );
  }

  return (
    <div>
      {label}
      <input
        {...shared}
        type="text"
        inputMode={field.type === "year" ? "numeric" : undefined}
        placeholder={field.type === "year" ? "YYYY" : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}