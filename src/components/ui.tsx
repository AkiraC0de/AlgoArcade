import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "accent" | "ghost" | "danger";

const V: Record<Variant, string> = {
  primary: "bg-primary text-primary-fg border-primary",
  secondary: "bg-card text-primary border-primary",
  accent: "bg-accent text-accent-fg border-accent",
  ghost: "bg-muted text-ink border-line hover:bg-line/60",
  danger: "bg-card text-danger border-danger",
};

export function Button({
  variant = "primary",
  active = false,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; active?: boolean }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0
        font-display font-bold text-sm leading-none min-h-11 px-4 py-2.5 rounded-xl border-2
        transition-all duration-200 cursor-pointer
        ${V[variant]} ${active ? "ring-2 ring-offset-2 ring-primary shadow-clay-sm" : "shadow-clay-sm"}
        hover:enabled:brightness-105 hover:enabled:-translate-y-px active:enabled:translate-y-0.5
        disabled:opacity-40 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
        ${className}`}
    />
  );
}

/** Compat alias — old consumers import PixelButton. */
export const PixelButton = Button;

export function Card({
  title,
  children,
  accent = "",
  className = "",
}: {
  title?: ReactNode;
  children: ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <section className={`clay ${accent} ${className}`}>
      {title !== undefined && (
        <h2 className="font-display font-bold text-base text-ink border-b-2 border-muted px-5 py-3 tracking-wide">
          {title}
        </h2>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/** Compat alias. */
export const Panel = Card;

export function Badge({ children, tone = "text-primary bg-primary/10" }: { children: ReactNode; tone?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 font-display font-bold text-xs rounded-full px-3 py-1 ${tone}`}>
      {children}
    </span>
  );
}

/** Compat alias. */
export function Chip({ children, color = "text-primary" }: { children: ReactNode; color?: string }) {
  return <Badge tone={`${color} bg-transparent border border-current`}>{children}</Badge>;
}


export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-muted-fg">
      <span className="font-display font-bold text-xs uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "bg-card border-2 border-line rounded-xl px-3.5 py-2.5 font-body text-base text-ink " +
  "focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-colors";

export function ProgressBar({
  value,
  max,
  tone = "bg-primary",
  label,
}: {
  value: number;
  max: number;
  tone?: string;
  label?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label ?? "progress"}
    >
      <div className={`h-full rounded-full ${tone} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}
