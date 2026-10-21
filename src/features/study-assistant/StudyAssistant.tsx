import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Bot,
  Cloud,
  LoaderCircle,
  MessageCircle,
  Minimize2,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import avatar from "../../assets/AlgoArcadeBot.png";
import { useLocation } from "react-router-dom";
import { getTopic, type TopicId } from "../../data/module6Lessons";
import { Button } from "../../components/ui";
import { requestStudyAssistant, type StudyChatMessage } from "./api";
import { StudyAssistantMarkdown } from "./StudyAssistantMarkdown";

const TOPIC_FROM_PATH: Record<string, TopicId> = {
  maxflow: "maxflow",
  strings: "strings",
  hashing: "hashing",
  geometry: "geometry",
  parallel: "parallel",
};
const SUGGESTIONS: Record<TopicId, string[]> = {
  maxflow: [
    "Explain the bottleneck",
    "What is a residual graph?",
    "Give me a practice question",
  ],
  strings: [
    "Compare Naive and Boyer-Moore",
    "How does Rabin–Karp hash?",
    "Give me a matching example",
  ],
  hashing: [
    "Why do collisions happen?",
    "Explain chaining",
    "Calculate 8 mod 3",
  ],
  geometry: [
    "What does the cross product tell us?",
    "Explain convex hulls",
    "Give me an orientation example",
  ],
  parallel: [
    "Compare the three parallel types",
    "Explain MapReduce",
    "What is coordination overhead?",
  ],
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
    {
      role: "assistant",
      content:
        "Hi! I’m Akira Study Assistant, created by AkiraC0de. Ask me about the algorithms and lessons in this app, and I’ll help you understand them step by step.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const suggestions = topic
    ? SUGGESTIONS[topic]
    : [
        "What topics can I study here?",
        "Explain maximum flow",
        "Give me an algorithm practice question",
      ];
  const context = useMemo(
    () =>
      topicData
        ? {
            topicTitle: topicData.title,
            objective: topicData.objective,
            explanation: topicData.summary,
          }
        : undefined,
    [topicData],
  );
  const reduceMotion = useReducedMotion();
  const panelVariants = reduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        hidden: { opacity: 0, y: 14, scale: 0.975 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring" as const,
            stiffness: 420,
            damping: 32,
            mass: 0.72,
          },
        },
        exit: {
          opacity: 0,
          y: 10,
          scale: 0.985,
          transition: { duration: 0.16, ease: [0.4, 0, 1, 1] as const },
        },
      };
  const messageTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const isMobileViewport = typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;

  useEffect(() => {
    if (!isMobileViewport || typeof window === "undefined" || !window.visualViewport) return;
    const viewport = window.visualViewport;
    const updateKeyboardOffset = () => {
      const offset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setKeyboardOffset(Math.round(offset));
    };
    updateKeyboardOffset();
    viewport.addEventListener("resize", updateKeyboardOffset);
    viewport.addEventListener("scroll", updateKeyboardOffset);
    return () => {
      viewport.removeEventListener("resize", updateKeyboardOffset);
      viewport.removeEventListener("scroll", updateKeyboardOffset);
    };
  }, [isMobileViewport]);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
    });
  }, [messages, loading, open, reduceMotion, keyboardOffset]);

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
      const answer = await requestStudyAssistant(
        text,
        messages,
        context,
        controller.signal,
      );
      setMessages((current) => [
        ...current,
        { role: "assistant", content: answer },
      ]);
    } catch (caught) {
      if ((caught as Error).name !== "AbortError")
        setError(
          (caught as Error).message || "Could not reach the study assistant.",
        );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <>
      <motion.button
        type="button"
        aria-label="Open study assistant"
        onClick={() => {
          setOpen(true);
          setMinimized(false);
        }}
        whileHover={reduceMotion ? undefined : { y: -3 }}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="fixed bottom-5 right-5 z-[60] flex h-16 w-16 items-center justify-center rounded-[22px] border-2 border-primary bg-primary text-white shadow-[0_12px_26px_rgba(4,120,87,.28)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:bottom-7 sm:right-7"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Cloud className="absolute h-10 w-10 opacity-20" aria-hidden />
        <motion.img
          src={avatar}
          alt=""
          className="relative h-14 w-14 object-contain"
          animate={
            reduceMotion ? undefined : { y: [0, -1.5, 0], rotate: [0, -1, 0] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-accent">
          <MessageCircle className="h-2.5 w-2.5" aria-hidden />
        </span>
      </motion.button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.section
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-label="Akira study assistant"
            className={`fixed right-4 z-[59] flex w-[min(392px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border-2 border-primary/25 bg-card shadow-[0_24px_70px_rgba(22,40,29,.2)] sm:bottom-28 sm:right-7 ${minimized ? "bottom-24 h-auto" : "bottom-4 h-[min(650px,calc(100dvh-1rem))] sm:bottom-28 sm:h-[min(650px,calc(100vh-8rem))]"}`} style={keyboardOffset > 0 ? { bottom: `${keyboardOffset + 8}px`, height: `calc(100vh - ${keyboardOffset + 16}px)` } : undefined}>
            <header className="flex items-center gap-3 border-b-2 border-line bg-gradient-to-r from-primary/10 via-card to-accent/10 px-4 py-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-primary/10">
                <motion.img
                  src={avatar}
                  alt="Akira Study Assistant"
                  className="h-full w-full object-cover"
                  initial={
                    reduceMotion ? undefined : { opacity: 0, scale: 0.85 }
                  }
                  animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                  transition={messageTransition}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-display text-sm font-black text-ink">
                  Akira Study Assistant
                </h2>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-ok">
                  <motion.span
                    className="h-1.5 w-1.5 rounded-full bg-ok"
                    animate={
                      reduceMotion ? undefined : { opacity: [0.45, 1, 0.45] }
                    }
                    transition={
                      reduceMotion
                        ? undefined
                        : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                    }
                  />{" "}
                  Topic study mode
                </p>
              </div>
              <button
                type="button"
                aria-label={
                  minimized
                    ? "Expand study assistant"
                    : "Minimize study assistant"
                }
                onClick={() => setMinimized((value) => !value)}
                className="rounded-lg p-2 text-muted-fg transition-colors duration-150 hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
              >
                <Minimize2 className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Close study assistant"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-muted-fg transition-colors duration-150 hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </header>
            {!minimized && (
              <>
                <motion.div
                  initial={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={
                    reduceMotion
                      ? undefined
                      : { ...messageTransition, delay: 0.05 }
                  }
                  className="flex items-center gap-2 border-b border-line px-4 py-2 text-[11px] text-muted-fg"
                >
                  <Bot className="h-3.5 w-3.5 text-primary" aria-hidden />{" "}
                  Created by AkiraC0de ·{" "}
                  {topicData ? topicData.title : "Module 6 topics only"}
                </motion.div>
                <div
                  className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
                  aria-live="polite"
                >
                  {messages.map((message, index) => (
                    <motion.div
                      key={`${message.role}-${index}`}
                      initial={
                        reduceMotion
                          ? undefined
                          : { opacity: 0, y: 8, scale: 0.985 }
                      }
                      animate={
                        reduceMotion
                          ? undefined
                          : { opacity: 1, y: 0, scale: 1 }
                      }
                      transition={
                        reduceMotion
                          ? undefined
                          : {
                              ...messageTransition,
                              delay: Math.min(index * 0.025, 0.12),
                            }
                      }
                      className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <img
                          src={avatar}
                          alt=""
                          className="mt-1 h-7 w-7 shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <div
                        className={`max-w-[84%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === "user" ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-muted text-ink"}`}
                      >
                        <StudyAssistantMarkdown content={message.content} />
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div
                      initial={reduceMotion ? undefined : { opacity: 0, y: 5 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-xs text-muted-fg"
                    >
                      <span
                        className="flex gap-1 rounded-full bg-muted px-2.5 py-2"
                        aria-label="Akira is thinking"
                      >
                        <motion.span
                          className="h-1.5 w-1.5 rounded-full bg-primary"
                          animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
                          transition={
                            reduceMotion
                              ? undefined
                              : { duration: 0.8, repeat: Infinity, delay: 0 }
                          }
                        />
                        <motion.span
                          className="h-1.5 w-1.5 rounded-full bg-primary"
                          animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
                          transition={
                            reduceMotion
                              ? undefined
                              : { duration: 0.8, repeat: Infinity, delay: 0.12 }
                          }
                        />
                        <motion.span
                          className="h-1.5 w-1.5 rounded-full bg-primary"
                          animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
                          transition={
                            reduceMotion
                              ? undefined
                              : { duration: 0.8, repeat: Infinity, delay: 0.24 }
                          }
                        />
                      </span>
                      <span>Thinking about the lesson…</span>
                    </motion.div>
                  )}
                  {error && (
                    <motion.div
                      initial={reduceMotion ? undefined : { opacity: 0, y: 5 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger"
                      role="alert"
                    >
                      <p>{error}</p>
                      <button
                        type="button"
                        onClick={() => setError(null)}
                        className="mt-2 inline-flex items-center gap-1 font-bold underline"
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden /> Dismiss
                      </button>
                    </motion.div>
                  )}
                  <div ref={endRef} />
                </div>
                <div className="border-t border-line bg-card p-3">
                  <motion.div
                    initial={reduceMotion ? undefined : { opacity: 0, y: 5 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={
                      reduceMotion
                        ? undefined
                        : { ...messageTransition, delay: 0.1 }
                    }
                    className="mb-2 flex gap-1.5 overflow-x-auto pb-1"
                  >
                    {suggestions.map((suggestion) => (
                      <motion.button
                        type="button"
                        key={suggestion}
                        onClick={() => void submit(suggestion)}
                        whileHover={reduceMotion ? undefined : { y: -1 }}
                        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="shrink-0 rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1.5 text-[11px] font-bold text-primary transition-colors duration-150 hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </motion.div>
                  <div className="flex items-end gap-2 rounded-2xl border-2 border-line bg-muted/50 p-2 transition-colors duration-150 focus-within:border-primary">
                    <textarea
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onFocus={(event) => {
                        window.setTimeout(() => event.currentTarget.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" }), 120);
                      }}
                      onKeyDown={handleKeyDown}
                      rows={2}
                      maxLength={1600}
                      placeholder="Ask about this algorithm…"
                      aria-label="Study assistant message"
                      className="min-h-10 flex-1 resize-none bg-transparent px-2 py-1 text-sm text-ink outline-none placeholder:text-muted-fg"
                    />
                    <motion.div
                      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                    >
                      <Button
                        type="button"
                        aria-label="Send study question"
                        onClick={() => void submit()}
                        disabled={!input.trim() || loading}
                        className="h-8 min-h-8 w-10 "
                        style={{padding: "10px" }}
                      >
                        <Send aria-hidden />
                      </Button>
                    </motion.div>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-fg">
                    Enter to send · Shift+Enter for a new line
                  </p>
                </div>
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
