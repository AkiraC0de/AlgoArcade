import { useState } from "react";
import { ArrowDown, ArrowRight, Check, GitBranch, Minus, Plus } from "lucide-react";
import { Card } from "./ui";

type VisualKind = "overview" | "rules" | "residual" | "bottleneck" | "cut";

const nodeStyle = "fill-white stroke-primary";

function NetworkSvg({ highlight }: { highlight?: "upper" | "lower" | "cut" }) {
  const upper = highlight === "upper" || highlight === "cut";
  const lower = highlight === "lower" || highlight === "cut";
  return <svg viewBox="0 0 420 190" className="w-full h-44" role="img" aria-label="Maximum flow network with source, sink, capacities, and highlighted paths">
    <defs>
      <marker id="mf-arrow-idle" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#9cc8ab" /></marker>
      <marker id="mf-arrow-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#b45309" /></marker>
    </defs>
    <path d="M55 95 L170 43 L350 95" fill="none" stroke={upper ? "#b45309" : "#9cc8ab"} strokeWidth={upper ? 6 : 3} markerEnd={upper ? "url(#mf-arrow-active)" : "url(#mf-arrow-idle)"} />
    <path d="M55 95 L170 147 L350 95" fill="none" stroke={lower ? "#b45309" : "#9cc8ab"} strokeWidth={lower ? 6 : 3} markerEnd={lower ? "url(#mf-arrow-active)" : "url(#mf-arrow-idle)"} />
    <line x1="170" y1="43" x2="170" y2="147" stroke="#c9dcc6" strokeWidth="2" strokeDasharray="4 6" />
    {[{x:55,y:95,label:"S",role:"SOURCE"},{x:170,y:43,label:"A"},{x:170,y:147,label:"B"},{x:350,y:95,label:"T",role:"SINK"}].map((node) => <g key={node.label}><circle cx={node.x} cy={node.y} r="20" className={nodeStyle} strokeWidth="3"/><text x={node.x} y={node.y+5} textAnchor="middle" fontSize="14" fontWeight="800" fill="#16281d">{node.label}</text>{node.role && <text x={node.x} y={node.y+35} textAnchor="middle" fontSize="9" fontWeight="800" fill={node.label === "S" ? "#047857" : "#b45309"}>{node.role}</text>}</g>)}
    <g fontSize="11" fontWeight="800" textAnchor="middle"><rect x="105" y="53" width="38" height="20" rx="7" fill="white" stroke={upper ? "#b45309" : "#c9dcc6"}/><text x="124" y="67" fill={upper ? "#b45309" : "#4d5c50"}>10</text><rect x="250" y="53" width="38" height="20" rx="7" fill="white" stroke={upper ? "#b45309" : "#c9dcc6"}/><text x="269" y="67" fill={upper ? "#b45309" : "#4d5c50"}>7</text><rect x="105" y="117" width="38" height="20" rx="7" fill="white" stroke={lower ? "#b45309" : "#c9dcc6"}/><text x="124" y="131" fill={lower ? "#b45309" : "#4d5c50"}>10</text><rect x="250" y="117" width="38" height="20" rx="7" fill="white" stroke={lower ? "#b45309" : "#c9dcc6"}/><text x="269" y="131" fill={lower ? "#b45309" : "#4d5c50"}>10</text></g>
    {highlight === "cut" && <><line x1="215" y1="12" x2="215" y2="178" stroke="#d97706" strokeWidth="3" strokeDasharray="8 7"/><text x="215" y="12" textAnchor="middle" fontSize="10" fontWeight="800" fill="#b45309">CUT</text></>}
  </svg>;
}

function RulesVisual() {
  return <div className="grid sm:grid-cols-3 gap-2"><div className="rounded-xl bg-primary/10 p-3"><p className="text-xs uppercase font-display font-black text-primary">Capacity</p><p className="font-mono text-sm text-ink mt-2">flow ≤ capacity</p><div className="h-2 bg-muted rounded mt-3 overflow-hidden"><div className="h-full w-2/3 bg-primary rounded" /></div></div><div className="rounded-xl bg-info/10 p-3"><p className="text-xs uppercase font-display font-black text-info">Conservation</p><div className="flex items-center justify-center gap-2 mt-4 text-sm font-display font-bold text-ink"><ArrowRight className="w-4 h-4 text-info" aria-hidden /> in = out <ArrowRight className="w-4 h-4 text-info" aria-hidden /></div></div><div className="rounded-xl bg-accent/10 p-3"><p className="text-xs uppercase font-display font-black text-accent">Bottleneck</p><div className="flex items-center gap-1 mt-3"><span className="h-7 flex-1 rounded bg-accent/30"/><Minus className="w-4 h-4 text-accent" aria-hidden/><span className="font-display font-black text-accent">min</span></div></div></div>;
}

function ResidualVisual() {
  return <div className="grid sm:grid-cols-2 gap-3"><div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4"><p className="text-xs uppercase font-display font-black text-primary">Before push</p><div className="flex items-center gap-3 mt-4"><span className="font-display font-black text-ink">A</span><div className="flex-1"><div className="h-2 rounded bg-primary"/><p className="text-xs text-muted-fg mt-1">10 available</p></div><span className="font-display font-black text-ink">T</span></div></div><div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-4"><p className="text-xs uppercase font-display font-black text-accent">After pushing 6</p><div className="flex items-center gap-3 mt-3"><span className="font-display font-black text-ink">A</span><div className="flex-1 space-y-2"><div className="h-2 rounded bg-primary/40"/><div className="h-2 rounded bg-accent"/><p className="text-xs text-muted-fg">4 forward · 6 reverse</p></div><span className="font-display font-black text-ink">T</span></div></div></div>;
}

function BottleneckVisual() {
  return <div className="rounded-2xl bg-muted p-4"><div className="flex items-center gap-2"><span className="rounded-lg bg-white border-2 border-line px-3 py-2 font-mono text-sm">S → A</span><span className="font-display font-black text-primary">10</span><ArrowRight className="w-4 h-4 text-muted-fg" aria-hidden/><span className="rounded-lg bg-white border-2 border-accent px-3 py-2 font-mono text-sm">A → T</span><span className="font-display font-black text-accent">7</span></div><div className="flex items-center gap-2 mt-4"><Check className="w-5 h-5 text-ok" aria-hidden/><p className="font-display font-black text-ink">Push min(10, 7) = 7 units</p></div></div>;
}

export function MaxFlowConceptVisual({ kind }: { kind: VisualKind }) {
  if (kind === "rules") return <RulesVisual />;
  if (kind === "residual") return <ResidualVisual />;
  if (kind === "bottleneck") return <BottleneckVisual />;
  return <NetworkSvg highlight={kind === "cut" ? "cut" : undefined} />;
}

export function MaxFlowPathLab() {
  const [path, setPath] = useState<"upper" | "lower">("upper");
  const bottleneck = path === "upper" ? 7 : 10;
  return <Card title="Interact · choose an augmenting path" accent="border-info/30"><p className="text-sm text-muted-fg leading-relaxed">Choose a route. The highlighted network and bottleneck update together.</p><div className="mt-3"><NetworkSvg highlight={path} /></div><div className="flex flex-wrap gap-2 mt-2"><button onClick={() => setPath("upper")} className={`min-h-11 rounded-xl border-2 px-4 font-display font-bold text-sm cursor-pointer ${path === "upper" ? "border-accent bg-accent/10 text-accent" : "border-line bg-card text-muted-fg"}`}>S → A → T</button><button onClick={() => setPath("lower")} className={`min-h-11 rounded-xl border-2 px-4 font-display font-bold text-sm cursor-pointer ${path === "lower" ? "border-accent bg-accent/10 text-accent" : "border-line bg-card text-muted-fg"}`}>S → B → T</button></div><div className="mt-3 rounded-xl bg-primary/10 px-4 py-3"><p className="text-xs uppercase font-display font-black text-primary">Current bottleneck</p><p className="font-display font-black text-xl text-ink mt-1">{bottleneck} units</p><p className="text-xs text-muted-fg mt-1">The narrowest edge decides how much this iteration can push.</p></div></Card>;
}
