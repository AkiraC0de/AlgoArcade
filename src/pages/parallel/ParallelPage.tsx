import { TopicPageShell } from "../../components/TopicPageShell";
import { TopicInteractiveLab } from "../../components/TopicInteractiveLab";

export default function ParallelPage() {
  return <TopicPageShell topic="parallel" title="Parallel Algorithms" description="Learn how work is divided among processors, simulate worker allocation, and practice data-parallel reasoning." playground={<TopicInteractiveLab topic="parallel" />} />;
}
