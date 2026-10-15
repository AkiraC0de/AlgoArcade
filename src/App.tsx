import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Hud } from "./components/Hud";
import { useGameStore } from "./state/gameStore";
import Home from "./pages/Home";
import StringsPage from "./pages/strings/StringsPage";
import MaxFlowPage from "./pages/maxflow/MaxFlowPage";
import PlayerPage from "./pages/PlayerPage";

export default function App() {
  const settings = useGameStore((s) => s.data.settings);
  return (
    <BrowserRouter>
      <div
        className={`min-h-screen ${settings.scanlines ? "scanlines" : ""} ${
          settings.reducedMotion ? "reduced-motion" : ""
        }`}
      >
        <Hud />
        <main className="mx-auto max-w-6xl px-3 py-4 pb-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/strings" element={<StringsPage />} />
            <Route path="/maxflow" element={<MaxFlowPage />} />
            <Route path="/player" element={<PlayerPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}