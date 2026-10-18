import { ExternalLink, Github, Heart, LockKeyhole, Sparkles } from "lucide-react";

const MEMBERS = [
  { name: "Bodonia, Ella Joy L.", role: "Maximum Flow presenter" },
  { name: "Fernandez, Mcraven Akira S.", role: "Developer · String Matching presenter", github: "https://github.com/AkiraC0de/" },
  { name: "Ebrado, Ralph Oliver N.", role: "Hashing presenter" },
  { name: "Naelgas, Sherwin Lloyd N.", role: "Computational Geometry presenter" },
  { name: "Ellorinco, Dhan Renz D.C.", role: "Parallel Algorithms presenter" },
];

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-line bg-card" aria-labelledby="site-footer-title">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <section>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-fg shadow-clay-sm">
                <Sparkles className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h1 className="text-xs font-display font-bold uppercase tracking-[0.14em] text-primary">Module 6 · ALGORITHM AND COMPLEXITY</h1>
              </div>
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-fg">
              An interactive learning space for turning advanced algorithms into ideas you can see, explore, and explain.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://github.com/AkiraC0de/AlgoArcade" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl border-2 border-primary bg-primary px-3.5 py-2 font-display text-sm font-bold text-primary-fg shadow-clay-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <Github className="h-4 w-4" aria-hidden /> Open-source repository
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
              <a href="https://github.com/AkiraC0de/" target="_blank" rel="noreferrer" aria-label="Open AkiraC0de GitHub profile" className="inline-flex min-h-10 w-10 items-center justify-center rounded-xl border-2 border-line bg-surface text-ink transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <Github className="h-5 w-5" aria-hidden />
              </a>
            </div>
          </section>

          <section aria-labelledby="contributors-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-display font-black uppercase tracking-[0.14em] text-accent">Built together</p>
                <h2 id="contributors-title" className="mt-1 font-display text-xl font-black text-ink">The people behind the module</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-display font-bold text-primary"><Heart className="h-3.5 w-3.5" aria-hidden /> Team project</span>
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2" role="list">
              {MEMBERS.map((member) => (
                <li key={member.name} className="rounded-xl border-2 border-line bg-surface p-3 transition-colors hover:border-primary/40">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/30 font-display text-sm font-black text-primary" aria-hidden>{member.name.charAt(0)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-black text-ink">{member.name}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-fg">{member.role}</p>
                    </div>
                    {member.github && <a href={member.github} target="_blank" rel="noreferrer" aria-label={`${member.name} GitHub profile`} className="rounded-lg p-1.5 text-muted-fg transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"><Github className="h-4 w-4" aria-hidden /></a>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t-2 border-line pt-4 text-xs text-muted-fg sm:flex-row sm:items-center sm:justify-between">
          <p>Designed for learning algorithms by making the invisible visible.</p>
          <p className="inline-flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5" aria-hidden /> Progress stays in your browser · Open source on GitHub</p>
        </div>
      </div>
    </footer>
  );
}
