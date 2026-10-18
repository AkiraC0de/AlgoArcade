import { useMemo, useState } from "react";
import { CheckCircle2, Hash, Play, RotateCcw } from "lucide-react";
import { runHash, HASH_ALGORITHMS, type HashAlgorithmId, type HashStep } from "../engine/hashing/hashFunctions";
import { usePlayback } from "../hooks/usePlayback";
import { PlaybackControls } from "./PlaybackControls";
import { TimelineScrubber } from "./TimelineScrubber";
import { StepLog } from "./StepLog";
import { Button, Card, Field, inputCls } from "./ui";

function CharacterStrip({ input, step }: { input: string; step: HashStep | null }) {
  const activeIndex = step?.kind === "character" ? step.index : -1;
  return <div className="overflow-x-auto rounded-xl border-2 border-info/20 bg-info/5 p-4"><div className="min-w-max"><p className="text-xs uppercase tracking-wide text-muted-fg font-display font-black mb-3">Input characters → accumulator</p><div className="flex gap-1.5">{Array.from(input).map((character, index) => <div key={`${character}-${index}`} className={`w-14 rounded-xl border-2 p-2 text-center transition-all ${index === activeIndex ? "border-accent bg-accent/10 scale-105 shadow-clay-sm" : index < activeIndex ? "border-primary/30 bg-primary/5" : "border-line bg-card"}`}><span className="block font-display font-black text-lg text-ink">{character === " " ? "·" : character}</span><span className="block text-[10px] font-mono text-muted-fg">{character.codePointAt(0) ?? 0}</span><span className="block text-[10px] text-muted-fg mt-1">{index}</span></div>)}</div>{step?.kind === "character" && <div className="mt-3 flex items-center gap-2 text-sm"><span className="rounded-lg bg-card border-2 border-primary/20 px-3 py-2 font-mono text-primary">{step.before}</span><span className="text-muted-fg">→</span><span className="rounded-lg bg-accent/10 border-2 border-accent/30 px-3 py-2 font-mono text-accent">{step.formula}</span></div>}</div></div>;
}

export function HashingPlayground() {
  const [input, setInput] = useState("CAT");
  const [algorithm, setAlgorithm] = useState<HashAlgorithmId>("polynomial");
  const [tableSize, setTableSize] = useState(8);
  const [hasRun, setHasRun] = useState(false);
  const pb = usePlayback<HashStep>(1400);
  const result = useMemo(() => runHash(input, algorithm, tableSize), [input, algorithm, tableSize]);
  const activeResult = hasRun ? result : null;
  const run = () => { pb.setSteps(result.steps); setHasRun(true); window.setTimeout(() => pb.play(), 0); };
  const reset = () => { pb.setSteps([]); setHasRun(false); };
  const info = HASH_ALGORITHMS.find((item) => item.id === algorithm) ?? HASH_ALGORITHMS[0];
  const visibleStep = activeResult ? pb.step : null;

  return <div className="space-y-4">
    <Card title="Input & hash configuration" accent="border-info/40"><div className="grid grid-cols-1 md:grid-cols-[1fr_240px_150px] gap-3 items-end"><Field label="String to hash"><input className={inputCls} value={input} maxLength={32} onChange={(event) => { setInput(event.target.value); reset(); }} aria-label="String to hash" /></Field><Field label="Hash function"><select className={`${inputCls} cursor-pointer`} value={algorithm} onChange={(event) => { setAlgorithm(event.target.value as HashAlgorithmId); reset(); }} aria-label="Select hash function">{HASH_ALGORITHMS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field><Field label="Table size"><input className={inputCls} type="number" min="1" max="64" value={tableSize} onChange={(event) => { setTableSize(Math.min(64, Math.max(1, Number(event.target.value) || 1))); reset(); }} aria-label="Hash table size" /></Field></div><div className="mt-4 rounded-xl bg-muted/60 p-3"><p className="font-display font-bold text-sm text-ink">{info.label}</p><p className="text-sm text-muted-fg mt-1 leading-relaxed">{info.description}</p><code className="inline-block mt-2 rounded-lg bg-ink px-3 py-2 text-xs text-white">{info.formula}</code></div><div className="flex flex-wrap gap-2 mt-4"><Button variant="accent" onClick={run} disabled={!input}><Play className="w-4 h-4" aria-hidden /> Run hash</Button><Button variant="ghost" onClick={reset}><RotateCcw className="w-4 h-4" aria-hidden /> Reset</Button></div></Card>

    <Card title="Computation viewer" accent="border-primary/40">{!activeResult ? <div className="rounded-xl border-2 border-dashed border-line bg-muted/40 p-8 text-center"><Hash className="w-8 h-8 mx-auto text-primary" aria-hidden /><p className="font-display font-bold text-ink mt-3">Enter a string and run the selected hash function.</p><p className="text-sm text-muted-fg mt-1">The viewer will highlight one character at a time and show the accumulator formula.</p></div> : <div className="space-y-4"><CharacterStrip input={input} step={visibleStep}/><div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-4"><div className="rounded-xl bg-muted/50 p-4"><p className="text-xs uppercase tracking-wide text-primary font-display font-black">Current computation</p><p className="font-display font-bold text-lg text-ink mt-2">{visibleStep?.note ?? "Trace ready"}</p>{visibleStep?.formula && <code className="block mt-3 rounded-lg bg-ink p-3 text-sm text-white overflow-x-auto">{visibleStep.formula}</code>}</div><div className="rounded-xl border-2 border-ok/30 bg-ok/10 p-4"><p className="text-xs uppercase tracking-wide text-muted-fg font-display font-black">Result</p><p className="font-display font-black text-3xl text-ok mt-2">{activeResult.hash}</p><p className="font-mono text-xs text-muted-fg mt-1">{activeResult.hex}</p><div className="mt-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-ok" aria-hidden /><span className="text-sm text-ink">bucket {activeResult.bucket} of {activeResult.tableSize}</span></div></div></div><PlaybackControls pb={pb}/><TimelineScrubber pb={pb}/></div>}</Card>

    {activeResult && <Card title="Execution log" accent="border-amber-300"><StepLog notes={activeResult.steps.map((step) => step.note)} current={pb.index}/></Card>}
  </div>;
}
