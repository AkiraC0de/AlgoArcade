import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "cyan" | "magenta" | "yellow" | "green" | "dim";

const V: Record<Variant, string> = {
  cyan: "border-neon-cyan text-neon-cyan",
  magenta: "border-neon-magenta text-neon-magenta",
  yellow: "border-neon-yellow text-neon-yellow",
  green: "border-neon-green text-neon-green",
  dim: "border-grid text-dim",
};

export function PixelButton({
  variant = "cyan",
  active = false,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; active?: boolean }) {
  return (
    <button
      {...rest}
      className={`font-pixel text-[10px] leading-none px-3 py-2.5 border-2 transition-transform
        ${V[variant]} ${active ? "bg-panel2 shadow-[0_0_12px_0_currentColor]" : "bg-panel"}
        hover:enabled:brightness-125 active:enabled:translate-y-0.5
        disabled:opacity-35 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-yellow
        ${className}`}
    />
  );
}

export function Panel({
  title,
  children,
  accent = "border-grid",
  className = "",
}: {
  title?: ReactNode;
  children: ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <section className={`pixel-border bg-panel ${accent} ${className}`}>
      {title !== undefined && (
        <h2 className="font-pixel text-[11px] text-neon-yellow border-b-2 border-grid px-3 py-2 tracking-wide">
          {title}
        </h2>
      )}
      <div className="p-3">{children}</div>
    </section>
  );
}

export function Chip({ children, color = "text-neon-cyan" }: { children: ReactNode; color?: string }) {
  return (
    <span className={`font-pixel text-[9px] border border-current px-2 py-1 ${color}`}>{children}</span>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <span aria-label={`${n} of 3 stars`} className="text-neon-yellow tracking-widest">
      {"★".repeat(n)}
      <span className="text-grid">{"★".repeat(Math.max(0, 3 - n))}</span>
    </span>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-dim">
      <span className="font-pixel text-[9px]">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "bg-crt border-2 border-grid px-2 py-1.5 font-term text-sm text-neon-green focus:border-neon-cyan focus-visible:outline-none";