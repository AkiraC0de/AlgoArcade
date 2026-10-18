import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, ChevronDown, GitBranch, GraduationCap, Hash, Home, Network, ScanSearch, Triangle, Zap } from "lucide-react";
import { useGameStore } from "../state/gameStore";
import { levelFor } from "../storage/schema";

const LESSONS = [
  { to: "/maxflow", label: "Maximum Flow", description: "Capacities, paths, and bottlenecks", Icon: Network },
  { to: "/strings", label: "String Matching", description: "Search, compare, and shift", Icon: ScanSearch },
  { to: "/hashing", label: "Hashing", description: "Keys, slots, and collisions", Icon: Hash },
  { to: "/geometry", label: "Computational Geometry", description: "Coordinates, turns, and shapes", Icon: Triangle },
  { to: "/parallel", label: "Parallel Algorithms", description: "Divide work across processors", Icon: GitBranch },
];

export function AppHeader() {
  const data = useGameStore((s) => s.data);
  const loc = useLocation();
  const level = levelFor(data.progress.xp);
  const [lessonsOpen, setLessonsOpen] = useState(false);
  const lessonsRef = useRef<HTMLDivElement>(null);
  const lessonActive = LESSONS.some((lesson) => loc.pathname === lesson.to);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (lessonsRef.current && !lessonsRef.current.contains(event.target as Node)) setLessonsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLessonsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

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

        <nav aria-label="Main" className="flex items-center gap-1.5 order-3 sm:order-2 w-full sm:w-auto sm:ml-4">
          <Link
            to="/"
            aria-current={loc.pathname === "/" ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-xl font-display font-semibold text-sm transition-colors duration-200 ${loc.pathname === "/" ? "bg-primary text-primary-fg shadow-clay-sm" : "text-muted-fg hover:bg-muted hover:text-ink"}`}
          >
            <Home className="w-4 h-4" aria-hidden />
            <span>Home</span>
          </Link>

          <div ref={lessonsRef} className="relative">
            <button
              type="button"
              aria-expanded={lessonsOpen}
              aria-haspopup="menu"
              onClick={() => setLessonsOpen((open) => !open)}
              className={`inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-xl font-display font-semibold text-sm transition-colors duration-200 cursor-pointer ${lessonActive || lessonsOpen ? "bg-primary text-primary-fg shadow-clay-sm" : "text-muted-fg hover:bg-muted hover:text-ink"}`}
            >
              <BookOpen className="w-4 h-4" aria-hidden />
              <span>Lessons</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${lessonsOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>

            {lessonsOpen && (
              <div className="absolute left-0 top-[calc(100%+0.5rem)] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border-2 border-line bg-card p-2 shadow-clay-sm" role="menu">
                <div className="px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-primary font-display font-black">Module 6 lessons</p>
                  <p className="text-xs text-muted-fg mt-1">Learn, run, and practice each topic.</p>
                </div>
                {LESSONS.map(({ to, label, description, Icon }) => (
                  <Link key={to} to={to} role="menuitem" onClick={() => setLessonsOpen(false)} className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${loc.pathname === to ? "bg-primary/10" : "hover:bg-muted"}`}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="w-4 h-4" aria-hidden /></span>
                    <span><span className="block font-display font-bold text-sm text-ink">{label}</span><span className="block text-xs text-muted-fg mt-0.5">{description}</span></span>
                  </Link>
                ))}

              </div>
            )}
          </div>

          <Link
            to="/player"
            aria-current={loc.pathname === "/player" ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-xl font-display font-semibold text-sm transition-colors duration-200 ${loc.pathname === "/player" ? "bg-primary text-primary-fg shadow-clay-sm" : "text-muted-fg hover:bg-muted hover:text-ink"}`}
          >
            <GraduationCap className="w-4 h-4" aria-hidden />
            <span>Progress</span>
          </Link>
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
