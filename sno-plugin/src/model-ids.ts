// Verified model IDs for opencode provider registry
// Source: `opencode models` output as of 2026-04-01
// Format: provider/model-variant
//
// To refresh: run `opencode models [provider]` and update accordingly.
// No "GPT-4.3" exists in the registry. The latest GPT-4.x is gpt-4.1;
// GPT-5.4 is the newest general-purpose OpenAI model available.

// ---------------------------------------------------------------------------
// Research / Learn / Plan agents
// ---------------------------------------------------------------------------
// User asked for "GPT-4.3" but it does not exist. gpt-5.4 is the latest
// general-purpose OpenAI model; gpt-4.1 is the latest GPT-4 family model.
export const RESEARCH_MODEL = "openai/gpt-5.4";
export const RESEARCH_MODEL_FALLBACK = "openai/gpt-4.1";

// ---------------------------------------------------------------------------
// Build / Coding agents
// ---------------------------------------------------------------------------
// openai/codex-mini-latest is a lightweight option; gpt-5.3-codex is the
// most capable dedicated coding model in the registry.
export const BUILD_MODEL = "openai/gpt-5.3-codex";
export const BUILD_MODEL_FALLBACK = "openai/codex-mini-latest";

// ---------------------------------------------------------------------------
// Gemini reviewer agent
// ---------------------------------------------------------------------------
// google/gemini-3.1-pro-preview is available; the stable fallback is 2.5-pro.
export const GEMINI_MODEL = "google/gemini-3.1-pro-preview";
export const GEMINI_MODEL_FALLBACK = "google/gemini-2.5-pro";
