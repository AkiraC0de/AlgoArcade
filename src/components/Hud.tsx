import { Link, useLocation } from "react-router-dom";
import { useGameStore } from "../state/gameStore";
import { levelFor, xpIntoLevel, XP_PER_LEVEL } from "../storage/schema";

export function Hud() {
  const data = useGameStore((s) => s.data);
  const loc = useLocation();
  const level = levelFor(data.progress.xp);
  const into = xpIntoLevel(data.progress.xp);

  const nav = [
    { to: "/", label: "ARCADE" },
    { to: "/strings", label: "TEXT HUNTERS" },
    { to: "/maxflow", label: "PIPE WORKS" },
    { to: "/player", label: "PLAYER" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-crt/95 border-b-2 border-grid backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-3 py-2 flex flex-wrap items-center gap-3">
        <Link to="/" className="font-pixel text-[11px] text-neon-magenta neon-text whitespace-nowrap">
          M6·ARCADE
        </Link>
        <nav aria-label="Main" className="flex flex-wrap gap-1.5">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              aria-current={loc.pathname === n.to ? "page" : undefined}
              className={`font-pixel text-[8px] px-2 py-1.5 border ${
                loc.pathname === n.to
                  ? "border-neon-cyan text-neon-cyan"
                  : "border-grid text-dim hover:text-neon-cyan hover:border-neon-cyan"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 font-pixel text-[9px] whitespace-nowrap">
          <span className="text-neon-purple" aria-label={`Level ${level}`}>
            LV {level}
          </span>
          <span className="hidden sm:inline-block w-20 h-2 border border-grid" aria-hidden>
            <span
              className="block h-full bg-neon-purple"
              style={{ width: `${(into / XP_PER_LEVEL) * 100}%` }}
            />
          </span>
          <span className="text-neon-yellow">{data.progress.xp} XP</span>
          <span className="text-neon-yellow" aria-label={`${data.progress.coins} coins`}>
            ⬤ {data.progress.coins}
          </span>
        </div>
      </div>
    </header>
  );
}