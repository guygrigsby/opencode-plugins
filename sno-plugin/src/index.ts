import type { Plugin, Hooks } from "@opencode-ai/plugin";
import { homedir } from "os";
import { mkdir } from "fs/promises";
import { join } from "path";

const CACHE_DIR = join(homedir(), ".config", "opencode", "sno");

/**
 * Sync shared principles and instructions from GitHub.
 * Stub — actual implementation comes in Task 3.
 */
async function syncContent(cacheDir: string): Promise<void> {
  // TODO(task-3): fetch shared instructions from GitHub and write to cacheDir
}

const plugin: Plugin = async (input) => {
  await mkdir(CACHE_DIR, { recursive: true });

  // Fire-and-forget: sync content in the background without blocking startup
  syncContent(CACHE_DIR).catch((err) => {
    console.error("[sno-plugin] background sync failed:", err);
  });

  const hooks: Hooks = {};
  return hooks;
};

export default plugin;
