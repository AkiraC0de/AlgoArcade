import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { SiteFooter } from "./components/SiteFooter";
import { useGameStore } from "./state/gameStore";
import Home from "./pages/HomeRefactored";
import StringsPage from "./pages/strings/StringsPage";
import MaxFlowPage from "./pages/maxflow/MaxFlowPage";
import PlayerPage from "./pages/PlayerPage";
import HashingPage from "./pages/hashing/HashingPage";
import GeometryPage from "./pages/geometry/GeometryPage";
import ParallelPage from "./pages/parallel/ParallelPage";
import Module6Page from "./pages/Module6Page";

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
          <Route path="/strings" element={<Navigate to="/strings/learn" replace />} />
          <Route path="/strings/learn" element={<StringsPage />} />
          <Route path="/strings/playground" element={<StringsPage />} />
          <Route path="/strings/exercise" element={<StringsPage />} />
          <Route path="/maxflow" element={<Navigate to="/maxflow/learn" replace />} />
          <Route path="/maxflow/learn" element={<MaxFlowPage />} />
          <Route path="/maxflow/playground" element={<MaxFlowPage />} />
          <Route path="/maxflow/exercise" element={<MaxFlowPage />} />
          <Route path="/player" element={<PlayerPage />} />
          <Route path="/hashing" element={<Navigate to="/hashing/learn" replace />} />
          <Route path="/hashing/learn" element={<HashingPage />} />
          <Route path="/hashing/playground" element={<HashingPage />} />
          <Route path="/hashing/exercise" element={<HashingPage />} />
          <Route path="/geometry" element={<Navigate to="/geometry/learn" replace />} />
          <Route path="/geometry/learn" element={<GeometryPage />} />
          <Route path="/geometry/playground" element={<GeometryPage />} />
          <Route path="/geometry/exercise" element={<GeometryPage />} />
          <Route path="/parallel" element={<Navigate to="/parallel/learn" replace />} />
          <Route path="/parallel/learn" element={<ParallelPage />} />
          <Route path="/parallel/playground" element={<ParallelPage />} />
          <Route path="/parallel/exercise" element={<ParallelPage />} />
          <Route path="/module6" element={<Module6Page />} />
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
        <div className="min-h-screen bg-surface text-ink">
          <AppHeader />
          <main className="mx-auto max-w-6xl px-4 py-6 pb-20">
            <AnimatedRoutes />
          </main>
          <SiteFooter />
        </div>
      </BrowserRouter>
    </MotionConfig>
  );
}
