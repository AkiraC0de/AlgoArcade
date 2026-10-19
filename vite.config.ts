/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import studyAssistantHandler from "./api/study-assistant";

function studyAssistantDevApi(mode: string): Plugin {
  const env = loadEnv(mode, ".", "");
  const runtimeProcess = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
  const processEnv = runtimeProcess.process?.env;
  if (processEnv && env.XKIRO_API_KEY && !processEnv.XKIRO_API_KEY) processEnv.XKIRO_API_KEY = env.XKIRO_API_KEY;
  if (processEnv && env.XKIRO_MODEL && !processEnv.XKIRO_MODEL) processEnv.XKIRO_MODEL = env.XKIRO_MODEL;

  return {
    name: "study-assistant-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/study-assistant", studyAssistantHandler as any);
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), studyAssistantDevApi(mode)],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
}));