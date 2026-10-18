import { TopicPageShell } from "../../components/TopicPageShell";
import { HashingPlayground } from "../../components/HashingPlayground";

export default function HashingPage() {
  return <TopicPageShell topic="hashing" title="Hashing" description="Learn how keys become table locations, experiment with collisions, and practice modulo-based lookup decisions." playground={<HashingPlayground />} />;
}
