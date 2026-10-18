import { useMemo } from "react";
import { GitBranch, Hash, Network, ScanSearch, Triangle } from "lucide-react";
import { useGameStore } from "../state/gameStore";
import { TOPIC_CHALLENGES } from "../data/topicChallenges";
import { levelFor } from "../storage/schema";
import { ContinueLearningCard } from "../components/home/ContinueLearningCard";
import { HomeHero } from "../components/home/HomeHero";
import { LearningLoop } from "../components/home/LearningLoop";
import { TopicGallery, type HomeTopic } from "../components/home/TopicGallery";
import { TrophyPreview } from "../components/home/TrophyPreview";

const TOPIC_DEFS = [
  { id: "maxflow", name: "Maximum Flow", to: "/maxflow", summary: "Move capacity through a network", description: "Find paths, push bottlenecks, and understand why the residual graph matters.", Icon: Network, tone: "text-primary", surface: "bg-primary/10" },
  { id: "strings", name: "String Matching", to: "/strings", summary: "Search smarter, not harder", description: "Compare Naive, Rabin–Karp, and Boyer–Moore with real character-level traces.", Icon: ScanSearch, tone: "text-accent", surface: "bg-accent/10" },
  { id: "hashing", name: "Hashing", to: "/hashing", summary: "Turn keys into useful locations", description: "Watch characters become hash values, buckets, and collision decisions.", Icon: Hash, tone: "text-info", surface: "bg-info/10" },
  { id: "geometry", name: "Computational Geometry", to: "/geometry", summary: "Make shapes computable", description: "Use coordinates, orientation, distance, and area to make geometric decisions.", Icon: Triangle, tone: "text-violet-700", surface: "bg-violet-100" },
  { id: "parallel", name: "Parallel Algorithms", to: "/parallel", summary: "Coordinate many workers", description: "Divide work, respect dependencies, and combine partial results safely.", Icon: GitBranch, tone: "text-ok", surface: "bg-ok/10" },
] as const;

function readLessonProgress(): Record<string, number> {
  try {
    const raw = localStorage.getItem("module6:learn-progress");
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export default function HomeRefactored() {
  const data = useGameStore((state) => state.data);
  const progress = data.lessons;
  const legacyProgress = useMemo(readLessonProgress, []);
  const mergedProgress = { ...legacyProgress, ...progress };
  const topicStats = useMemo(() => Object.fromEntries(TOPIC_DEFS.map((topic) => {
    const list = TOPIC_CHALLENGES.filter((challenge) => challenge.topic === topic.id);
    const done = list.filter((challenge) => data.challenges[challenge.id]?.completed === true);
    return [topic.id, { done: done.length, total: list.length }];
  })), [data.challenges]);
  const nextTopic = TOPIC_DEFS.find((topic) => (mergedProgress[topic.id] ?? 0) < 5) ?? TOPIC_DEFS[0];
  const nextStage = ["Discover", "Understand", "Interact", "Watch the algorithm", "Test understanding", "Reflect and continue"][mergedProgress[nextTopic.id] ?? 0];
  const started = Object.values(mergedProgress).some((value) => Number(value) > 0);
  const nextTopicData = { name: nextTopic.name, to: nextTopic.to, description: nextTopic.summary };
  const topics: HomeTopic[] = TOPIC_DEFS.map((topic) => ({
    ...topic,
    ...(topicStats[topic.id] as { done: number; total: number }),
  }));
  const mastery = TOPIC_CHALLENGES.length
    ? Math.round((TOPIC_CHALLENGES.filter((challenge) => data.challenges[challenge.id]?.completed === true).length / TOPIC_CHALLENGES.length) * 100)
    : 0;

  return (
    <div className="space-y-7">
      <HomeHero started={started} nextTopic={nextTopicData} nextStage={nextStage} />
      {started && <ContinueLearningCard topic={nextTopicData} stage={nextStage} percent={Math.round(((mergedProgress[nextTopic.id] ?? 0) / 5) * 100)} />}
      <TopicGallery topics={topics} />
      <LearningLoop />
      <TrophyPreview level={levelFor(data.progress.xp)} xp={data.progress.xp} mastery={mastery} />
      <p className="text-center text-xs text-muted-fg">Your learning progress is saved in this browser only.</p>
    </div>
  );
}
