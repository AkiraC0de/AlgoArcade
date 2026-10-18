import { StringsPlayground } from "./StringsPlayground";
import { RaceMode } from "./RaceMode";
import { TopicPageShell } from "../../components/TopicPageShell";

export default function StringsPage() {
  return <TopicPageShell topic="strings" title="String Matching" description="Learn how search algorithms align, compare, hash, and skip through text, then compare their real traces." playground={<><StringsPlayground /><div className="mt-4"><RaceMode /></div></>} />;
}
