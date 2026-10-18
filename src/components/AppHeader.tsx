import { Link, useLocation } from "react-router-dom";
import { BookOpen, GraduationCap, Home, Network, ScanSearch, Zap } from "lucide-react";
import { useGameStore } from "../state/gameStore";
import { levelFor } from "../storage/schema";

const NAV = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/strings", label: "String Matching", Icon: ScanSearch },
  { to: "/maxflow", label: "Maximum Flow", Icon: Network },
  { to: "/player", label: "Progress", Icon: GraduationCap },
];

export function AppHeader() {
  const data = useGameStore((s) => s.data);
  const loc = useLocation();
  const level = levelFor(data.progress.xp);

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-sm border-b-2 border-line">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        <Link to="/" className="flex items-center gap-2 cursor-pointer" aria-label="Module 6 home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-fg shadow-clay-sm">
            <BookOpen className="w-5 h-5" aria-hidden />
          </span>
          <span className="font-display font-bold text-lg text-ink hidden sm:inline">
            Module 6 <span className="text-primary">Algorithms</span>
          </span>
        </Link>

        <nav aria-label="Main" className="flex flex-wrap gap-1.5 order-3 sm:order-2 w-full sm:w-auto sm:ml-4">
          {NAV.map(({ to, label, Icon }) => {
            const active = loc.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 min-h-11 px-3.5 rounded-xl font-display font-semibold text-sm transition-colors duration-200
                  ${active ? "bg-primary text-primary-fg shadow-clay-sm" : "text-muted-fg hover:bg-muted hover:text-ink"}`}
              >
                <Icon className="w-4 h-4" aria-hidden />
                <span className="hidden md:inline">{label}</span>
                <span className="md:hidden">{label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>

        <div className="order-2 sm:order-3 ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 clay-sm px-3 py-1.5 font-display font-semibold text-sm text-primary">
            <Zap className="w-4 h-4" aria-hidden />
            {data.progress.xp} XP
          </span>
          <span className="clay-sm px-3 py-1.5 font-display font-semibold text-sm text-accent">
            Level {level}
          </span>
        </div>
      </div>
    </header>
  );
}
