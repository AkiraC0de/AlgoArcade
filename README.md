# AlgoArcade

Interactive learning platform for **Module 6: Advanced Algorithms**.

AlgoArcade helps students move from an abstract algorithm idea to a visible, testable understanding. Each topic combines concise explanations, visual models, interactive controls, algorithm traces, and exercises.

> **Open source:** [github.com/AkiraC0de/AlgoArcade](https://github.com/AkiraC0de/AlgoArcade)

## What students can learn

The platform currently covers five topics:

- **Maximum Flow** — capacities, conservation, residual graphs, augmenting paths, bottlenecks, and Ford–Fulkerson.
- **String Matching** — Naive matching, Rabin–Karp rolling hashes, and Boyer–Moore shifts.
- **Hashing** — hash functions, modulo indexing, collisions, chaining, open addressing, and hash computation traces.
- **Computational Geometry** — distance, cross products, orientation, area, convex hulls, intersections, and point-in-polygon reasoning.
- **Parallel Algorithms** — data, task, and pipeline parallelism, worker allocation, MapReduce, load balancing, and synchronization.

Every topic is organized into three areas:

1. **Learn** — guided stages with short explanations and visual aids.
2. **Playground** — change inputs and watch the algorithm or model respond.
3. **Exercises** — practice questions with explanations, hints, completion tracking, and XP.

## Learning experience

The guided flow follows a consistent loop:

```text
See the idea → Move the model → Watch it run → Prove what you understand
```

Lesson stages are:

1. Discover
2. Understand
3. Interact
4. Watch the algorithm
5. Test understanding
6. Reflect and continue

The Home page acts as a learning gateway rather than a topic directory. The Progress page shows the learner’s current level, XP, completed exercises, topic progress, and level milestones.

## Progress and XP

Progress is stored locally in the browser through the Zustand store and `localStorage`.

- Completing an exercise awards XP once.
- Reaching a new lesson stage awards XP once for each newly reached stage.
- Repeating a completed exercise does not award XP again.
- Level progress is calculated from XP.
- Resetting progress clears the saved challenge, lesson, XP, and exercise state.

The app does not use stars or coins as progression currencies. The progression experience is centered on learning momentum and levels.

## Technology

- React
- TypeScript
- Vite
- Tailwind CSS v4
- Zustand
- Motion for React animations
- Lucide React icons
- Vitest
- Browser `localStorage` persistence

## Project structure

```text
src/
├── App.tsx                    # Router, shared shell, and footer
├── components/
│   ├── AppHeader.tsx          # Desktop navigation
│   ├── SiteFooter.tsx         # Open-source and contributor footer
│   ├── TopicPageShell.tsx     # Learn / Playground / Exercises layout
│   ├── TopicExercises.tsx    # Module 6 exercise experience
│   ├── StepLog.tsx            # Fixed-height execution trace log
│   ├── PlaybackControls.tsx  # Trace playback controls
│   └── ...
├── data/
│   ├── module6Lessons.ts      # Topic metadata and lesson stages
│   └── topicChallenges.ts     # Five banks of ten exercises
├── engine/
│   ├── maxflow/               # Ford–Fulkerson engine and presets
│   ├── strings/               # Naive, Rabin–Karp, and Boyer–Moore engines
│   └── hashing/               # Hash function implementations
├── hooks/                     # Playback, keyboard, and bookmark hooks
├── pages/                     # Home, topic, playground, and progress pages
├── state/
│   └── gameStore.ts           # Canonical XP, lesson, and exercise state
├── storage/
│   ├── schema.ts              # Save data model and level calculations
│   └── storage.ts             # localStorage read/write normalization
└── theme/
    └── index.css              # Green-centered design tokens and blue accent
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Student-focused Home page |
| `/maxflow/learn` | Maximum Flow learning stages |
| `/maxflow/playground` | Maximum Flow interactive trace |
| `/maxflow/exercise` | Maximum Flow exercises |
| `/strings/learn` | String Matching learning stages |
| `/strings/playground` | String Matching interactive trace |
| `/strings/exercise` | String Matching exercises |
| `/hashing/learn` | Hashing learning stages |
| `/hashing/playground` | Hashing interactive lab |
| `/hashing/exercise` | Hashing exercises |
| `/geometry/learn` | Computational Geometry learning stages |
| `/geometry/playground` | Computational Geometry interactive lab |
| `/geometry/exercise` | Computational Geometry exercises |
| `/parallel/learn` | Parallel Algorithms learning stages |
| `/parallel/playground` | Parallel Algorithms interactive lab |
| `/parallel/exercise` | Parallel Algorithms exercises |
| `/player` | Progress and level journey |
| `/module6` | Compatibility route for the older Module 6 entry point |

## Getting started

### Requirements

- Node.js 18 or newer
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Vite will print the local development URL in the terminal.

### Run the checks

```bash
npm run build
npm test -- --run
```

The repository also supports the direct commands used during development:

```bash
npx tsc --noEmit
npx vitest run
npx vite build --clearScreen false
```

## Design principles

- **Show the mechanism.** Visuals should explain what changes, not decorate a paragraph.
- **Keep explanations short but sufficient.** Each lesson states the idea, the decision rule, and the relevant complexity.
- **Make the algorithm observable.** Real engines drive traces where available; deterministic simulations explain the remaining models.
- **Keep logic separate from presentation.** Algorithm engines live under `src/engine/`; visual components render their state.
- **Protect the visual focus.** Execution logs stay fixed-height and update internally without pulling the page away from the main visualization.
- **Use accessible controls.** Interactive elements use semantic buttons or links, visible focus states, labels, and keyboard-friendly interactions.
- **Prefer learning momentum over game clutter.** XP and levels communicate progress without distracting currencies.

## Contributors

- **Bodonia, Ella Joy L.** — Maximum Flow presenter
- **Fernandez, Mcraven Akira S.** — Developer · String Matching presenter
  - GitHub: [AkiraC0de](https://github.com/AkiraC0de/)
- **Ebrado, Ralph Oliver N.** — Hashing presenter
- **Naelgas, Sherwin Lloyd N.** — Computational Geometry presenter
- **Ellorinco, Dhan Renz D.C.** — Parallel Algorithms presenter

## Study assistant configuration

The repository includes a floating Akira Study Assistant using the supplied `src/assets/AlgoArcadeBot.png` avatar. It is restricted by the AI's topic-scope instructions to the Module 6 topics: Maximum Flow, String Matching, Hashing, Computational Geometry, and Parallel Algorithms. The model checks each message against the current topic, lesson context, and recent conversation instead of requiring keyword matches, so short follow-ups such as `yes` and `continue` can work. It answers naturally in Taglish or matches the student's Tagalog/English preference, with a maximum response budget of 700 output tokens. Rate-limited provider requests receive a short Taglish fallback message.

Configure the server-side Vercel Function locally by copying `.env.example` to `.env` and setting:

```env
XKIRO_API_KEY=your_xkiro_key
XKIRO_MODEL=mistralai/mistral-large-4-0
```

These variables intentionally do **not** use the `VITE_` prefix. The key is read only by `api/study-assistant.ts` and is never bundled into the browser. Add the same `XKIRO_API_KEY` and optional `XKIRO_MODEL` variables in Vercel Project Settings → Environment Variables, then redeploy. The browser calls the same-origin `/api/study-assistant` endpoint, so XKIRO CORS is not involved. The client also applies topic filtering as a usability safeguard, while the server repeats the validation before calling XKIRO.

## Contributing

1. Create a branch for your change.
2. Keep algorithm logic separate from UI presentation.
3. Add or update relevant tests when changing an engine or state transition.
4. Keep lesson content concise, visual, and tied to the actual topic.
5. Run TypeScript, tests, and a production build before opening a pull request.
6. Describe behavior changes and verification results in the pull request.

## License and attribution

AlgoArcade is an open-source educational project maintained by the student group listed above. See the repository for the current license and contribution history.
