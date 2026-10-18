import { MaxFlowPlayground } from "./MaxFlowPlayground";
import { TopicPageShell } from "../../components/TopicPageShell";

export default function MaxFlowPage() {
  return <TopicPageShell topic="maxflow" title="Maximum Flow" description="Learn how networks move capacity from source to sink, experiment with real traces, and practice bottleneck decisions." playground={<MaxFlowPlayground />} />;
}
