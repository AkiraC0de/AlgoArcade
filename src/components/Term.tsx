import { useState } from "react";
import { GLOSSARY } from "../data/glossary";

interface TermProps {
  children: string;
}

export function Term({ children }: TermProps) {
  const [show, setShow] = useState(false);
  const def = GLOSSARY[children.toLowerCase()];
  if (!def) return <span>{children}</span>;

  return (
    <span className="relative inline-block">
      <button
        className="text-neon-cyan underline decoration-dotted decoration-1 underline-offset-2 cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        aria-describedby={`term-${children.replace(/\s+/g, "-").toLowerCase()}`}
      >
        {children}
      </button>
      {show && (
        <span
          id={`term-${children.replace(/\s+/g, "-").toLowerCase()}`}
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-crt border border-neon-cyan text-[11px] font-term text-white leading-snug shadow-lg"
        >
          {def}
        </span>
      )}
    </span>
  );
}
