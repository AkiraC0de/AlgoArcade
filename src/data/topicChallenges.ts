import type { TopicId } from "./module6Lessons";

export interface TopicChallenge {
  id: string;
  topic: TopicId;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  hint: string;
}

export const TOPIC_CHALLENGES: TopicChallenge[] = [
  { id:"hash-slot", topic:"hashing", prompt:"With h(k) = k mod 3, where does key 8 go?", options:["0","1","2","8"], answer:2, explanation:"8 divided by 3 leaves remainder 2, so the key maps to slot 2.", hint:"Calculate the remainder, not the quotient." },
  { id:"hash-collision", topic:"hashing", prompt:"What do keys 3, 6, and 9 demonstrate with m = 3?", options:["A perfect spread","A collision","Encryption","A sorted table"], answer:1, explanation:"All three keys leave remainder 0, so they collide in the same slot.", hint:"Try each key modulo 3." },
  { id:"geometry-turn", topic:"geometry", prompt:"A positive cross product for A → B → C means what?", options:["Right turn","Left turn","Collinear","No orientation"], answer:1, explanation:"The sign of the cross product identifies orientation: positive means left.", hint:"Remember the sign convention from the lesson." },
  { id:"geometry-distance", topic:"geometry", prompt:"What is the distance between A(1,2) and B(4,6)?", options:["4","5","6","7"], answer:1, explanation:"dx = 3 and dy = 4, so √(3² + 4²) = 5.", hint:"This is a 3–4–5 triangle." },
  { id:"parallel-data", topic:"parallel", prompt:"Which pattern applies the same operation to different data ranges?", options:["Task parallelism","Data parallelism","Pipeline parallelism","Serial search"], answer:1, explanation:"Data parallelism repeats the same operation across separate partitions.", hint:"Focus on what is repeated versus what is divided." },
  { id:"parallel-map", topic:"parallel", prompt:"In MapReduce, which stage combines partial results?", options:["Map","Reduce","Distribute","Pipeline"], answer:1, explanation:"Map creates partial results; Reduce combines them into the final result.", hint:"The stage name describes the final action." },
  { id:"flow-bottleneck", topic:"maxflow", prompt:"On a path with residual capacities 10 and 7, what can be pushed?", options:["3","7","10","17"], answer:1, explanation:"The bottleneck is the minimum residual capacity: 7.", hint:"The narrowest edge controls the path." },
  { id:"strings-index", topic:"strings", prompt:"Where does CONT begin in FLOODCONTROL?", options:["3","4","5","8"], answer:2, explanation:"FLOOD occupies indices 0–4, so CONT starts at index 5.", hint:"Count from zero." },
];
