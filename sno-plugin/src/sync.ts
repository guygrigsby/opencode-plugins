import { readFile, writeFile, rename, stat } from "fs/promises";
import { join } from "path";

const RAW_BASE =
  "https://raw.githubusercontent.com/guygrigsby/claude-plugins/main/plugins/sno";

const CONTENT_FILES = ["CLAUDE.md"];

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const FETCH_TIMEOUT_MS = 3_000;

interface ETagStore {
  [filename: string]: {
    etag: string;
    lastFetch: number; // epoch ms
  };
}

// Bundled fallback content, read lazily
let _fallbackPrinciples: string | undefined;
function getFallbackPrinciples(): string {
  if (_fallbackPrinciples === undefined) {
    // Use require.resolve-style import; bun handles this at bundle time.
    // We read synchronously from the bundled fallback directory.
    const path = join(import.meta.dir, "fallback", "principles.md");
    // Lazy-load: if it fails, return a minimal string
    try {
      const { readFileSync } = require("fs");
      _fallbackPrinciples = readFileSync(path, "utf-8") as string;
    } catch {
      _fallbackPrinciples = "# sno principles\nSmallest diff. PoLA. DDD. 5NF.";
    }
  }
  return _fallbackPrinciples;
}

async function loadEtags(cacheDir: string): Promise<ETagStore> {
  try {
    const raw = await readFile(join(cacheDir, ".etags.json"), "utf-8");
    return JSON.parse(raw) as ETagStore;
  } catch {
    return {};
  }
}

async function saveEtags(
  cacheDir: string,
  store: ETagStore,
): Promise<void> {
  const target = join(cacheDir, ".etags.json");
  const tmp = target + ".tmp";
  await writeFile(tmp, JSON.stringify(store, null, 2), "utf-8");
  await rename(tmp, target);
}

async function atomicWrite(filePath: string, content: string): Promise<void> {
  const tmp = filePath + ".tmp";
  await writeFile(tmp, content, "utf-8");
  await rename(tmp, filePath);
}

function isFresh(entry: ETagStore[string] | undefined): boolean {
  if (!entry) return false;
  return Date.now() - entry.lastFetch < TTL_MS;
}

async function fetchOne(
  cacheDir: string,
  filename: string,
  etags: ETagStore,
): Promise<void> {
  const url = `${RAW_BASE}/${filename}`;
  const cached = etags[filename];

  // Build headers
  const headers: Record<string, string> = {};
  if (cached?.etag) {
    headers["If-None-Match"] = cached.etag;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, { headers, signal: controller.signal });

    if (res.status === 304) {
      // Content unchanged — just bump timestamp
      etags[filename] = { etag: cached!.etag, lastFetch: Date.now() };
      return;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching ${url}`);
    }

    const body = await res.text();
    await atomicWrite(join(cacheDir, filename), body);

    const newEtag = res.headers.get("etag") ?? "";
    etags[filename] = { etag: newEtag, lastFetch: Date.now() };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Sync shared principles/instructions from the sno GitHub repo.
 * Non-blocking with 3s timeout. Falls back to cache, then bundled fallback.
 */
export async function syncContent(cacheDir: string): Promise<void> {
  const etags = await loadEtags(cacheDir);

  for (const filename of CONTENT_FILES) {
    // Skip if cache is fresh
    if (isFresh(etags[filename])) {
      continue;
    }

    try {
      await fetchOne(cacheDir, filename, etags);
    } catch (err) {
      console.warn(`[sno-plugin] fetch failed for ${filename}:`, err);

      // Check if we have a cached copy already
      const cachedPath = join(cacheDir, filename);
      try {
        await stat(cachedPath);
        // Cached file exists — nothing to do, we'll use it
      } catch {
        // No cache — write bundled fallback
        if (filename === "CLAUDE.md") {
          await atomicWrite(cachedPath, getFallbackPrinciples());
        }
      }
    }
  }

  await saveEtags(cacheDir, etags);
}
