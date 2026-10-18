import { useState } from "react";
import { GLOSSARY } from "../data/glossary";

interface TermProps {
  children: string;
}

export function Term({ children }: TermProps) {
  const [show, setShow] = useState(false);
  const def = GLOSSARY[children.toLowerCase()];
  if (!def) return <span>{children}</span>;
  const id = `term-${children.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="text-primary font-bold underline decoration-dotted decoration-2 underline-offset-2 cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        aria-describedby={id}
      >
        {children}
      </button>
      {show && (
        <span
          id={id}
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 bg-card border-2 border-line rounded-xl text-xs font-body text-ink leading-relaxed shadow-clay"
        >
          {def}
        </span>
      )}
    </span>
  );
}
