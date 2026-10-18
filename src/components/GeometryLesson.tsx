import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CircleHelp, Play, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { Button, Card, inputCls } from "./ui";
import { getTopic, LEARNING_STAGES } from "../data/module6Lessons";

const STORAGE_KEY = "module6:learn-progress";

type Progress = Record<string, number>;

type Point = {
  label: string;
  x: number;
  y: number;
};

type HullStep = {
  title: string;
  note: string;
  stack: string[];
  triple?: [string, string, string];
};

const INITIAL_POINTS: Point[] = [
  { label: "A", x: 1, y: 1 },
  { label: "B", x: 6, y: 1 },
  { label: "C", x: 3, y: 5 },
];

const HULL_POINTS: Point[] = [
  { label: "A", x: 1, y: 1 },
  { label: "B", x: 3, y: 1 },
  { label: "C", x: 5, y: 4 },
  { label: "D", x: 4, y: 2 },
  { label: "E", x: 2, y: 5 },
];

const HULL_TRACE: HullStep[] = [
  { title: "Seed the scan", note: "Start with the two leftmost points A and B.", stack: ["A", "B"] },
  { title: "Inspect C", note: "A → B → C is a left turn, so keep C on the candidate hull.", stack: ["A", "B", "C"], triple: ["A", "B", "C"] },
  { title: "Inspect D", note: "B → C → D is a right turn. C bends inward, so pop C from the scan.", stack: ["A", "B"], triple: ["B", "C", "D"] },
  { title: "Re-check D", note: "After the pop, A → B → D is a left turn, so keep D.", stack: ["A", "B", "D"], triple: ["A", "B", "D"] },
  { title: "Inspect E", note: "B → D → E is a left turn, so keep E and continue the scan.", stack: ["A", "B", "D", "E"], triple: ["B", "D", "E"] },
];

function readProgress(): Progress {
  if (typeof window === "undefined") return {};
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? (parsed as Progress) : {};
  } catch {
    return {};
  }
}

function saveProgress(topicId: string, stage: number) {
  if (typeof window === "undefined") return;
  try {
    const previous = readProgress();
    const prior = Number(previous[topicId]);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...previous,
        [topicId]: Math.max(Number.isFinite(prior) ? prior : 0, stage),
      }),
    );
  } catch {
    // The lesson remains usable when storage is unavailable.
  }
}

function crossProduct(a: Point, b: Point, c: Point) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function orientationText(value: number) {
  if (value > 0) return "left turn";
  if (value < 0) return "right turn";
  return "collinear";
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function pointToSvg(point: Point) {
  return { x: 38 + point.x * 34, y: 210 - point.y * 28 };
}

function CoordinatePlane({
  points,
  activeLabel,
  onPlaneClick,
  onPlaneKeyDown,
}: {
  points: Point[];
  activeLabel: string;
  onPlaneClick: (event: MouseEvent<SVGSVGElement>) => void;
  onPlaneKeyDown: (event: KeyboardEvent<SVGSVGElement>) => void;
}) {
  return (
    <svg
      viewBox="0 0 360 240"
      className="h-64 w-full rounded-2xl border-2 border-primary/15 bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      role="group"
      aria-label={`Interactive coordinate plane. Click to place point ${activeLabel}, or use the coordinate fields.`}
      tabIndex={0}
      onClick={onPlaneClick}
      onKeyDown={onPlaneKeyDown}
    >
      <title>Interactive coordinate plane</title>
      <desc>Three labeled points form a triangle. The selected point can be moved with a click or with its coordinate fields.</desc>
      {Array.from({ length: 9 }, (_, index) => {
        const x = 38 + index * 34;
        return <line key={`vertical-${index}`} x1={x} y1={14} x2={x} y2={210} stroke="#d7e7d7" strokeWidth="1" />;
      })}
      {Array.from({ length: 8 }, (_, index) => {
        const y = 210 - index * 28;
        return <line key={`horizontal-${index}`} x1={38} y1={y} x2={310} y2={y} stroke="#d7e7d7" strokeWidth="1" />;
      })}
      <line x1="38" y1="210" x2="326" y2="210" stroke="#477153" strokeWidth="2" />
      <line x1="38" y1="220" x2="38" y2="10" stroke="#477153" strokeWidth="2" />
      <polygon points={points.map((point) => { const svgPoint = pointToSvg(point); return `${svgPoint.x},${svgPoint.y}`; }).join(" ")} fill="#047857" fillOpacity=".12" stroke="#047857" strokeWidth="3" strokeLinejoin="round" />
      {points.map((point) => {
        const svgPoint = pointToSvg(point);
        const selected = point.label === activeLabel;
        return (
          <g key={point.label}>
            {selected && <circle cx={svgPoint.x} cy={svgPoint.y} r="12" fill="none" stroke="#b45309" strokeWidth="2" strokeDasharray="3 3" />}
            <circle cx={svgPoint.x} cy={svgPoint.y} r="7" fill={selected ? "#b45309" : "#047857"} stroke="#ffffff" strokeWidth="2" />
            <text x={svgPoint.x} y={svgPoint.y - 11} textAnchor="middle" fontSize="12" fontWeight="700" fill="#163b25">{point.label}</text>
          </g>
        );
      })}
      <text x="318" y="225" fontSize="11" fill="#477153">x</text>
      <text x="26" y="16" fontSize="11" fill="#477153">y</text>
    </svg>
  );
}

function GeometryConcepts() {
  const concepts = [
    ["Distance", "Measures separation: d = √((x₂ − x₁)² + (y₂ − y₁)²). It powers closest-pair searches."],
    ["Cross product / orientation", "The sign of cross(A,B,C) says how A → B → C turns: positive left, negative right, zero collinear."],
    ["Area", "For a triangle, area = |cross(A,B,C)| / 2. For a polygon, the shoelace formula adds signed cross-products."],
    ["Convex hull", "The smallest rubber band around the points. A Graham-style scan removes points that create a right turn."],
    ["Closest pair", "Find the two points with minimum distance. Divide-and-conquer avoids checking every pair at scale."],
    ["Intersection / point-in-polygon", "Orientation tests decide whether segments cross; ray casting or winding counts decide whether a point is inside."],
  ];

  return (
    <Card title="Mental model · coordinates become decisions" accent="border-primary/30">
      <div className="grid gap-3 sm:grid-cols-2">
        {concepts.map(([title, detail]) => (
          <div key={title} className="rounded-xl border-2 border-line bg-muted/40 p-4">
            <p className="font-display font-black text-ink">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-fg">{detail}</p>
          </div>
        ))}
      </div>
      <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl bg-ink p-4 font-mono text-sm text-white">cross = (xB−xA)(yC−yA) − (yB−yA)(xC−xA)
area triangle = |cross| / 2</pre>
    </Card>
  );
}

function InteractiveGeometry({ points, setPoints }: { points: Point[]; setPoints: (points: Point[]) => void }) {
  const [activeLabel, setActiveLabel] = useState("A");
  const pointA = points[0];
  const pointB = points[1];
  const pointC = points[2];
  const distance = Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
  const orientation = crossProduct(pointA, pointB, pointC);
  const area = Math.abs(orientation) / 2;

  const updatePoint = (label: string, axis: "x" | "y", rawValue: string) => {
    const parsed = Number(rawValue);
    const value = Number.isFinite(parsed) ? clamp(parsed, 0, axis === "x" ? 8 : 7) : 0;
    setPoints(points.map((point) => point.label === label ? { ...point, [axis]: value } : point));
  };

  const moveSelected = (x: number, y: number) => {
    setPoints(points.map((point) => point.label === activeLabel ? { ...point, x: clamp(x, 0, 8), y: clamp(y, 0, 7) } : point));
  };

  const handlePlaneClick = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const svgX = ((event.clientX - rect.left) / rect.width) * 360;
    const svgY = ((event.clientY - rect.top) / rect.height) * 240;
    moveSelected(Math.round(((svgX - 38) / 34) * 10) / 10, Math.round(((210 - svgY) / 28) * 10) / 10);
  };

  const handlePlaneKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const selected = points.find((point) => point.label === activeLabel);
    if (!selected) return;
    const delta = event.shiftKey ? 1 : 0.5;
    const moves: Record<string, [number, number]> = {
      ArrowUp: [0, delta],
      ArrowDown: [0, -delta],
      ArrowLeft: [-delta, 0],
      ArrowRight: [delta, 0],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    moveSelected(selected.x + move[0], selected.y + move[1]);
  };

  return (
    <Card title="Interact · move points on a coordinate plane" accent="border-info/40">
      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <div>
          <CoordinatePlane points={points} activeLabel={activeLabel} onPlaneClick={handlePlaneClick} onPlaneKeyDown={handlePlaneKeyDown} />
          <p className="mt-2 text-xs leading-relaxed text-muted-fg">Click the plane to place the selected point. Keyboard users can focus the plane and use arrow keys; Shift moves by one unit.</p>
        </div>
        <div className="space-y-2">
          {points.map((point) => (
            <div key={point.label} className={`rounded-xl border-2 p-3 ${activeLabel === point.label ? "border-accent/50 bg-accent/5" : "border-line bg-muted/40"}`}>
              <button
                type="button"
                aria-pressed={activeLabel === point.label}
                onClick={() => setActiveLabel(point.label)}
                className="font-display text-sm font-black text-ink underline decoration-primary/40 decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Point {point.label}
              </button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["x", "y"] as const).map((axis) => (
                  <label key={axis} className="text-xs font-display font-bold uppercase tracking-wide text-muted-fg">
                    {axis}
                    <input
                      className={`${inputCls} mt-1 w-full px-2.5 py-2 text-sm`}
                      type="number"
                      min={0}
                      max={axis === "x" ? 8 : 7}
                      step="0.5"
                      value={point[axis]}
                      aria-label={`${point.label} ${axis} coordinate`}
                      onChange={(event) => updatePoint(point.label, axis, event.target.value)}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-xl bg-primary/10 p-3 text-center"><p className="text-xs text-muted-fg">distance AB</p><p className="font-display text-xl font-black text-primary">{distance.toFixed(2)}</p></div>
        <div className="rounded-xl bg-accent/10 p-3 text-center"><p className="text-xs text-muted-fg">cross / orientation</p><p className="font-display text-xl font-black text-accent">{orientation} · {orientationText(orientation)}</p></div>
        <div className="rounded-xl bg-ok/10 p-3 text-center"><p className="text-xs text-muted-fg">triangle area</p><p className="font-display text-xl font-black text-ok">{area.toFixed(2)}</p></div>
      </div>
    </Card>
  );
}

function HullWatch() {
  const [traceStep, setTraceStep] = useState(0);
  const step = HULL_TRACE[traceStep];
  const lookup = (label: string) => HULL_POINTS.find((point) => point.label === label) ?? HULL_POINTS[0];
  const stackPoints = step.stack.map(lookup);
  const triplePoints = step.triple?.map(lookup) ?? [];
  const currentCross = triplePoints.length === 3 ? crossProduct(triplePoints[0], triplePoints[1], triplePoints[2]) : null;
  const color = currentCross === null ? "text-muted-fg" : currentCross > 0 ? "text-ok" : currentCross < 0 ? "text-accent" : "text-info";

  return (
    <Card title="Watch · orientation decisions in a hull-like scan" accent="border-ok/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-black text-ink">{step.title}</p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-fg">{step.note}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-display font-black text-primary">step {traceStep + 1}/{HULL_TRACE.length}</span>
      </div>
      <div className="mt-4 flex gap-1.5" aria-label="Orientation trace progress">
        {HULL_TRACE.map((item, index) => <span key={item.title} className={`h-2 flex-1 rounded-full ${index <= traceStep ? "bg-primary" : "bg-muted"}`} aria-hidden="true" />)}
      </div>
      <motion.div key={traceStep} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 grid gap-4 lg:grid-cols-[1fr_250px]" aria-live="polite">
        <svg viewBox="0 0 360 240" className="h-60 w-full rounded-2xl border-2 border-primary/15 bg-primary/5" role="img" aria-label={`Hull scan showing ${step.title}`}>
          <title>Convex hull scan trace</title>
          {Array.from({ length: 9 }, (_, index) => <line key={`trace-v-${index}`} x1={38 + index * 34} y1={14} x2={38 + index * 34} y2={210} stroke="#d7e7d7" strokeWidth="1" />)}
          {Array.from({ length: 8 }, (_, index) => <line key={`trace-h-${index}`} x1={38} y1={210 - index * 28} x2={310} y2={210 - index * 28} stroke="#d7e7d7" strokeWidth="1" />)}
          <line x1="38" y1="210" x2="326" y2="210" stroke="#477153" strokeWidth="2" />
          <line x1="38" y1="220" x2="38" y2="10" stroke="#477153" strokeWidth="2" />
          {stackPoints.length > 1 && <polyline points={stackPoints.map((point) => { const svgPoint = pointToSvg(point); return `${svgPoint.x},${svgPoint.y}`; }).join(" ")} fill="none" stroke="#047857" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />}
          {triplePoints.length === 3 && <polyline points={triplePoints.map((point) => { const svgPoint = pointToSvg(point); return `${svgPoint.x},${svgPoint.y}`; }).join(" ")} fill="none" stroke="#b45309" strokeWidth="3" strokeDasharray="6 4" />}
          {HULL_POINTS.map((point) => {
            const svgPoint = pointToSvg(point);
            const inStack = step.stack.includes(point.label);
            const inTriple = step.triple?.includes(point.label);
            return <g key={point.label}><circle cx={svgPoint.x} cy={svgPoint.y} r={inTriple ? 9 : 6} fill={inTriple ? "#b45309" : inStack ? "#047857" : "#91b5a0"} stroke="#ffffff" strokeWidth="2" /><text x={svgPoint.x} y={svgPoint.y - 11} textAnchor="middle" fontSize="12" fontWeight="700" fill="#163b25">{point.label}</text></g>;
          })}
        </svg>
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-line bg-muted/40 p-3">
            <p className="text-xs font-display font-black uppercase tracking-wide text-muted-fg">candidate stack</p>
            <p className="mt-2 font-mono text-lg font-bold text-primary">{step.stack.join(" → ")}</p>
          </div>
          <div className="rounded-xl border-2 border-line bg-muted/40 p-3">
            <p className="text-xs font-display font-black uppercase tracking-wide text-muted-fg">orientation test</p>
            {currentCross === null ? <p className="mt-2 text-sm text-muted-fg">Seed points first.</p> : <><p className="mt-2 font-mono text-sm text-ink">cross({step.triple?.join(", ")}) = {currentCross}</p><p className={`mt-1 font-display font-black ${color}`}>{orientationText(currentCross)}</p></>}
          </div>
        </div>
      </motion.div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => setTraceStep(0)} disabled={traceStep === 0}><RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset</Button>
        <Button onClick={() => setTraceStep((current) => Math.min(HULL_TRACE.length - 1, current + 1))} disabled={traceStep === HULL_TRACE.length - 1}><Play className="h-4 w-4" aria-hidden="true" /> Next decision</Button>
      </div>
    </Card>
  );
}

export function GeometryLesson() {
  const topic = getTopic("geometry");
  const [stage, setStage] = useState(() => {
    const saved = Number(readProgress()[topic.id]);
    return Number.isFinite(saved) ? Math.min(Math.max(saved, 0), LEARNING_STAGES.length - 1) : 0;
  });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [points, setPoints] = useState<Point[]>(INITIAL_POINTS);
  const current = topic.stages[stage];
  const answerCorrect = selectedAnswer === topic.check.answer;

  const moveToStage = (next: number) => {
    const bounded = Math.min(Math.max(next, 0), LEARNING_STAGES.length - 1);
    setStage(bounded);
    saveProgress(topic.id, bounded);
    setSelectedAnswer(null);
    setChecked(false);
  };

  return (
    <div className="space-y-4">
      <Card accent="border-primary/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-display font-black uppercase tracking-wide text-primary">Guided lesson · visual edition</p>
            <h2 className="mt-1 font-display text-2xl font-black text-ink">{topic.title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-fg">{topic.objective}</p>
          </div>
          <div className="rounded-xl bg-primary/10 px-3 py-2 text-center"><p className="text-xs text-muted-fg">Stage</p><p className="font-display text-xl font-black text-primary">{stage + 1}/6</p></div>
        </div>
        <nav className="mt-5 grid grid-cols-3 gap-1.5 sm:grid-cols-6" aria-label="Geometry lesson stages">
          {LEARNING_STAGES.map((item, index) => (
            <button key={item.id} type="button" onClick={() => moveToStage(index)} aria-current={stage === index ? "step" : undefined} className={`min-h-14 rounded-xl border-2 px-1 py-2 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${stage === index ? "border-primary bg-primary text-white" : stage > index ? "border-ok/30 bg-ok/10 text-ok" : "border-line bg-card text-muted-fg hover:border-primary/50"}`}>
              <span className="block text-[10px] font-display font-black">{item.number}</span><span className="mt-1 block text-[10px] font-display font-bold leading-tight">{item.title}</span>
            </button>
          ))}
        </nav>
      </Card>

      <motion.div key={stage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <Card title={`${LEARNING_STAGES[stage].number} · ${current.title}`} accent="border-primary/30">
          <p className="font-display font-bold text-primary">{current.lead}</p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink">{current.paragraphs.map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph}</p>)}</div>
          {current.bullets && <ul className="mt-4 grid gap-2 sm:grid-cols-2">{current.bullets.map((bullet) => <li key={bullet} className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm text-ink"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{bullet}</li>)}</ul>}
          {current.formula && <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl bg-ink p-4 font-mono text-sm text-white">{current.formula}</pre>}
        </Card>

        {stage === 0 && (
          <Card title="See the shape become data" accent="border-info/30">
            <svg viewBox="0 0 360 180" className="h-48 w-full rounded-2xl border-2 border-primary/15 bg-primary/5" role="img" aria-label="Triangle on a coordinate plane">
              <title>Coordinate geometry preview</title>
              <line x1="30" y1="150" x2="330" y2="150" stroke="#477153" strokeWidth="2" /><line x1="45" y1="165" x2="45" y2="15" stroke="#477153" strokeWidth="2" />
              <polygon points="80,125 290,125 175,35" fill="#047857" fillOpacity=".14" stroke="#047857" strokeWidth="4" strokeLinejoin="round" />
              {[{ x: 80, y: 125, label: "A" }, { x: 290, y: 125, label: "B" }, { x: 175, y: 35, label: "C" }].map((point) => <g key={point.label}><circle cx={point.x} cy={point.y} r="7" fill="#b45309" stroke="#ffffff" strokeWidth="2" /><text x={point.x} y={point.y - 12} textAnchor="middle" fontSize="12" fontWeight="700" fill="#163b25">{point.label}</text></g>)}
              <text x="180" y="170" textAnchor="middle" fontSize="11" fill="#477153">points → formulas → decisions</text>
            </svg>
            <div className="mt-4 grid gap-2 sm:grid-cols-3"><div className="rounded-xl bg-primary/10 p-3 text-center text-sm font-display font-bold text-primary">How far?</div><div className="rounded-xl bg-accent/10 p-3 text-center text-sm font-display font-bold text-accent">Which turn?</div><div className="rounded-xl bg-ok/10 p-3 text-center text-sm font-display font-bold text-ok">Inside or out?</div></div>
          </Card>
        )}
        {stage === 1 && <GeometryConcepts />}
        {stage === 2 && <InteractiveGeometry points={points} setPoints={setPoints} />}
        {stage === 3 && <HullWatch />}
        {stage === 4 && (
          <Card title="Test · read the orientation" accent="border-accent/30">
            <div className="flex gap-3"><CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" /><div className="min-w-0 flex-1"><p className="font-display text-lg font-black text-ink">{topic.check.question}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{topic.check.options.map((option, index) => <button key={option} type="button" disabled={checked} onClick={() => setSelectedAnswer(index)} className={`min-h-12 rounded-xl border-2 px-4 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selectedAnswer === index ? checked ? (answerCorrect ? "border-ok bg-ok/10 text-ok" : "border-danger bg-danger/10 text-danger") : "border-primary bg-primary/10 text-ink" : "border-line bg-card text-ink hover:border-primary/50"} disabled:cursor-not-allowed`}><span className="mr-2 font-display font-black">{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>{!checked ? <Button className="mt-4" variant="accent" disabled={selectedAnswer === null} onClick={() => setChecked(true)}>Check answer</Button> : <div className={`mt-4 rounded-xl p-4 text-sm leading-relaxed ${answerCorrect ? "bg-ok/10 text-ok" : "bg-amber-50 text-amber-900"}`} role="status"><p className="font-display font-bold">{answerCorrect ? "Correct." : "Use the sign of the cross product."}</p><p className="mt-1">{topic.check.explanation}</p></div>}</div></div>
          </Card>
        )}
        {stage === 5 && <Card title="Reflect · keep the useful idea" accent="border-ok/30"><div className="flex gap-3"><Trophy className="mt-0.5 h-6 w-6 shrink-0 text-ok" aria-hidden="true" /><div><p className="font-display text-xl font-black text-ink">{topic.takeaway}</p><div className="mt-4 grid gap-2 sm:grid-cols-2"><div className="rounded-xl bg-ok/10 p-3 text-sm font-display font-bold text-ok">Turn a picture into a sign.</div><div className="rounded-xl bg-primary/10 p-3 text-sm font-display font-bold text-primary">Reuse the primitive in a larger algorithm.</div></div><p className="mt-4 text-sm leading-relaxed text-muted-fg">When a geometry problem looks visual, name the primitive first: distance, orientation, area, intersection, or containment.</p></div></div></Card>}
      </motion.div>

      <div className="flex flex-wrap justify-between gap-2"><Button variant="ghost" disabled={stage === 0} onClick={() => moveToStage(stage - 1)}><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Previous</Button><div className="flex gap-2">{stage === 5 && <Button variant="secondary" onClick={() => moveToStage(0)}><RotateCcw className="h-4 w-4" aria-hidden="true" /> Restart</Button>}{stage < 5 && <Button variant="primary" disabled={stage === 4 && !checked} onClick={() => moveToStage(stage + 1)}>Continue <ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>}</div></div>
      <p className="flex items-center gap-2 text-xs text-muted-fg"><Sparkles className="h-4 w-4 text-primary" aria-hidden="true" /> Your furthest stage is saved locally for this topic.</p>
    </div>
  );
}
