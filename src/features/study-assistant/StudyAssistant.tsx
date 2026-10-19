import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, Check, Cloud, LoaderCircle, MessageCircle, Minimize2, RotateCcw, Send, X } from "lucide-react";
import avatar from "../../assets/AlgoArcadeBot.png";
import { useLocation } from "react-router-dom";
import { getTopic, type TopicId } from "../../data/module6Lessons";
import { Button } from "../../components/ui";
import { requestStudyAssistant, type StudyChatMessage } from "./api";
import { StudyAssistantMarkdown } from "./StudyAssistantMarkdown";

const TOPIC_FROM_PATH: Record<string, TopicId> = { maxflow: "maxflow", strings: "strings", hashing: "hashing", geometry: "geometry", parallel: "parallel" };
const SUGGESTIONS: Record<TopicId, string[]> = {
  maxflow: ["Explain the bottleneck", "What is a residual graph?", "Give me a practice question"],
  strings: ["Compare Naive and Boyer-Moore", "How does Rabin–Karp hash?", "Give me a matching example"],
  hashing: ["Why do collisions happen?", "Explain chaining", "Calculate 8 mod 3"],
  geometry: ["What does the cross product tell us?", "Explain convex hulls", "Give me an orientation example"],
  parallel: ["Compare the three parallel types", "Explain MapReduce", "What is coordination overhead?"],
};

function currentTopic(pathname: string) {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment ? TOPIC_FROM_PATH[segment] : undefined;
}

export function StudyAssistant() {
  const location = useLocation();
  const topic = currentTopic(location.pathname);
  const topicData = topic ? getTopic(topic) : undefined;
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<StudyChatMessage[]>([
    { role: "assistant", content: "Hi! I’m Akira Study Assistant, created by AkiraC0de. Ask me about the algorithms and lessons in this app, and I’ll help you understand them step by step." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const suggestions = topic ? SUGGESTIONS[topic] : ["What topics can I study here?", "Explain maximum flow", "Give me an algorithm practice question"];
  const context = useMemo(() => topicData ? { topicTitle: topicData.title, objective: topicData.objective, explanation: topicData.summary } : undefined, [topicData]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, loading, open]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const submit = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    const nextHistory = [...messages, { role: "user" as const, content: text }];
    setMessages(nextHistory);
    setLoading(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const answer = await requestStudyAssistant(text, messages, context, controller.signal);
      setMessages((current) => [...current, { role: "assistant", content: answer }]);
    } catch (caught) {
      if ((caught as Error).name !== "AbortError") setError((caught as Error).message || "Could not reach the study assistant.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submit(); }
  };

  return <>
    <motion.button type="button" aria-label="Open study assistant" onClick={() => { setOpen(true); setMinimized(false); }} whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }} className="fixed bottom-5 right-5 z-[60] flex h-16 w-16 items-center justify-center rounded-[22px] border-2 border-primary bg-primary text-white shadow-[0_12px_26px_rgba(4,120,87,.28)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:bottom-7 sm:right-7" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <Cloud className="absolute h-10 w-10 opacity-20" aria-hidden /><img src={avatar} alt="" className="relative h-14 w-14 object-contain" /><span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-accent"><MessageCircle className="h-2.5 w-2.5" aria-hidden /></span>
    </motion.button>
    <AnimatePresence>
      {open && <motion.section initial={{ opacity: 0, y: 18, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: .96 }} transition={{ duration: .2 }} aria-label="Akira study assistant" className={`fixed bottom-24 right-4 z-[59] flex w-[min(392px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border-2 border-primary/25 bg-card shadow-[0_24px_70px_rgba(22,40,29,.2)] sm:bottom-28 sm:right-7 ${minimized ? "h-auto" : "h-[min(650px,calc(100vh-8rem))]"}`}>
        <header className="flex items-center gap-3 border-b-2 border-line bg-gradient-to-r from-primary/10 via-card to-accent/10 px-4 py-3"><div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-primary/10"><img src={avatar} alt="Akira Study Assistant" className="h-full w-full object-cover" /></div><div className="min-w-0 flex-1"><h2 className="truncate font-display text-sm font-black text-ink">Akira Study Assistant</h2><p className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-ok"><span className="h-1.5 w-1.5 rounded-full bg-ok" /> Topic study mode</p></div><button type="button" aria-label={minimized ? "Expand study assistant" : "Minimize study assistant"} onClick={() => setMinimized((value) => !value)} className="rounded-lg p-2 text-muted-fg hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"><Minimize2 className="h-4 w-4" aria-hidden /></button><button type="button" aria-label="Close study assistant" onClick={() => setOpen(false)} className="rounded-lg p-2 text-muted-fg hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"><X className="h-4 w-4" aria-hidden /></button></header>
        {!minimized && <><div className="flex items-center gap-2 border-b border-line px-4 py-2 text-[11px] text-muted-fg"><Bot className="h-3.5 w-3.5 text-primary" aria-hidden /> Created by AkiraC0de · {topicData ? topicData.title : "Module 6 topics only"}</div><div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>{message.role === "assistant" && <img src={avatar} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-lg object-cover" />}<div className={`max-w-[84%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === "user" ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-muted text-ink"}`}><StudyAssistantMarkdown content={message.content} /></div></div>)}{loading && <div className="flex items-center gap-2 text-xs text-muted-fg"><LoaderCircle className="h-4 w-4 animate-spin text-primary" aria-hidden /> Thinking about the lesson…</div>}{error && <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger" role="alert"><p>{error}</p><button type="button" onClick={() => setError(null)} className="mt-2 inline-flex items-center gap-1 font-bold underline"><RotateCcw className="h-3 w-3" aria-hidden /> Dismiss</button></div>}<div ref={endRef} /></div><div className="border-t border-line bg-card p-3"><div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => void submit(suggestion)} className="shrink-0 rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary">{suggestion}</button>)}</div><div className="flex items-end gap-2 rounded-2xl border-2 border-line bg-muted/50 p-2 focus-within:border-primary"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} rows={2} maxLength={1600} placeholder="Ask about this algorithm…" aria-label="Study assistant message" className="min-h-10 flex-1 resize-none bg-transparent px-2 py-1 text-sm text-ink outline-none placeholder:text-muted-fg" /><Button type="button" aria-label="Send study question" onClick={() => void submit()} disabled={!input.trim() || loading} className="h-10 min-h-10 w-10 px-0"><Send className="h-4 w-4" aria-hidden /></Button></div><p className="mt-1 text-[10px] text-muted-fg">Enter to send · Shift+Enter for a new line</p></div></>}
      </motion.section>}
    </AnimatePresence>
  </>;
}
