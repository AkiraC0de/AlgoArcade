import { TopicPageShell } from "../../components/TopicPageShell";
import { TopicInteractiveLab } from "../../components/TopicInteractiveLab";

export default function GeometryPage() {
  return <TopicPageShell topic="geometry" title="Computational Geometry" description="Learn how algorithms reason about coordinates, turns, distances, and shapes, then manipulate a live coordinate model." playground={<TopicInteractiveLab topic="geometry" />} />;
}
