import type { Plugin, Hooks } from "@opencode-ai/plugin";
import { homedir } from "os";
import { mkdir } from "fs/promises";
import { join } from "path";
import { syncContent } from "./sync";

const CACHE_DIR = join(homedir(), ".config", "opencode", "sno");

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
