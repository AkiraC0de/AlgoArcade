import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Hud } from "./components/Hud";
import { useGameStore } from "./state/gameStore";
import Home from "./pages/Home";
import StringsPage from "./pages/strings/StringsPage";
import MaxFlowPage from "./pages/maxflow/MaxFlowPage";
import PlayerPage from "./pages/PlayerPage";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/strings" element={<StringsPage />} />
          <Route path="/maxflow" element={<MaxFlowPage />} />
          <Route path="/player" element={<PlayerPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const settings = useGameStore((s) => s.data.settings);
  return (
    <MotionConfig reducedMotion={settings.reducedMotion ? "always" : "user"}>
      <BrowserRouter>
        <div className={`min-h-screen ${settings.scanlines ? "scanlines" : ""}`}>
          <Hud />
          <main className="mx-auto max-w-6xl px-3 py-4 pb-16">
            <AnimatedRoutes />
          </main>
        </div>
      </BrowserRouter>
    </MotionConfig>
  );
}