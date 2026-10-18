import { TopicPageShell } from "../../components/TopicPageShell";
import { TopicInteractiveLab } from "../../components/TopicInteractiveLab";

export default function HashingPage() {
  return <TopicPageShell topic="hashing" title="Hashing" description="Learn how keys become table locations, experiment with collisions, and practice modulo-based lookup decisions." playground={<TopicInteractiveLab topic="hashing" />} />;
}
