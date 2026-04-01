import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { mkdtemp, readFile, writeFile, mkdir, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { syncContent } from "./sync";

let cacheDir: string;

beforeEach(async () => {
  cacheDir = await mkdtemp(join(tmpdir(), "sno-sync-test-"));
});

afterEach(async () => {
  await rm(cacheDir, { recursive: true, force: true });
  mock.restore();
});

describe("syncContent", () => {
  it("writes fetched content to cache on 200", async () => {
    const fakeBody = "# Fetched Principles\nHello from GitHub.";
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () =>
      new Response(fakeBody, {
        status: 200,
        headers: { etag: '"abc123"' },
      }),
    );

    try {
      await syncContent(cacheDir);

      const content = await readFile(join(cacheDir, "CLAUDE.md"), "utf-8");
      expect(content).toBe(fakeBody);

      const etags = JSON.parse(
        await readFile(join(cacheDir, ".etags.json"), "utf-8"),
      );
      expect(etags["CLAUDE.md"].etag).toBe('"abc123"');
      expect(etags["CLAUDE.md"].lastFetch).toBeGreaterThan(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("uses cached content when fetch fails and does not throw", async () => {
    // Pre-populate cache
    const cachedContent = "# Cached principles";
    await writeFile(join(cacheDir, "CLAUDE.md"), cachedContent, "utf-8");

    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => {
      throw new Error("network down");
    });

    try {
      // Should not throw
      await syncContent(cacheDir);

      // Cached file should still be intact
      const content = await readFile(join(cacheDir, "CLAUDE.md"), "utf-8");
      expect(content).toBe(cachedContent);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("skips fetch when cache is fresh (within TTL)", async () => {
    // Pre-populate etags with a recent timestamp
    const etags = {
      "CLAUDE.md": {
        etag: '"xyz"',
        lastFetch: Date.now(), // just now — well within 24h TTL
      },
    };
    await writeFile(
      join(cacheDir, ".etags.json"),
      JSON.stringify(etags),
      "utf-8",
    );
    await writeFile(join(cacheDir, "CLAUDE.md"), "# cached", "utf-8");

    const originalFetch = globalThis.fetch;
    const fetchMock = mock(async () => new Response("should not be called"));
    globalThis.fetch = fetchMock;

    try {
      await syncContent(cacheDir);

      // fetch should never have been called
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("bumps timestamp without rewriting content on 304 Not Modified", async () => {
    // Pre-populate cache and etags with an old timestamp
    const cachedContent = "# Existing cached principles";
    await writeFile(join(cacheDir, "CLAUDE.md"), cachedContent, "utf-8");
    const oldTimestamp = Date.now() - 48 * 60 * 60 * 1000; // 48h ago (stale)
    const etags = {
      "CLAUDE.md": { etag: '"existing-etag"', lastFetch: oldTimestamp },
    };
    await writeFile(
      join(cacheDir, ".etags.json"),
      JSON.stringify(etags),
      "utf-8",
    );

    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async (url: string, init?: RequestInit) => {
      // Verify If-None-Match header is sent
      expect(init?.headers).toBeDefined();
      const h = init!.headers as Record<string, string>;
      expect(h["If-None-Match"]).toBe('"existing-etag"');
      return new Response(null, { status: 304 });
    });

    try {
      await syncContent(cacheDir);

      // Content should be unchanged
      const content = await readFile(join(cacheDir, "CLAUDE.md"), "utf-8");
      expect(content).toBe(cachedContent);

      // Timestamp should be bumped
      const updatedEtags = JSON.parse(
        await readFile(join(cacheDir, ".etags.json"), "utf-8"),
      );
      expect(updatedEtags["CLAUDE.md"].lastFetch).toBeGreaterThan(oldTimestamp);
      expect(updatedEtags["CLAUDE.md"].etag).toBe('"existing-etag"');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("falls back to cache on non-OK HTTP status (e.g. 500)", async () => {
    const cachedContent = "# Cached principles";
    await writeFile(join(cacheDir, "CLAUDE.md"), cachedContent, "utf-8");

    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () =>
      new Response("Internal Server Error", { status: 500 }),
    );

    try {
      await syncContent(cacheDir);

      // Cached file should still be intact
      const content = await readFile(join(cacheDir, "CLAUDE.md"), "utf-8");
      expect(content).toBe(cachedContent);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("writes bundled fallback when fetch fails and no cache exists", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => {
      throw new Error("network down");
    });

    try {
      await syncContent(cacheDir);

      const content = await readFile(join(cacheDir, "CLAUDE.md"), "utf-8");
      // Should contain fallback content
      expect(content).toContain("sno");
      expect(content).toContain("Smallest Diff");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
