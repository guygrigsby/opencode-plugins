# sno — opencode plugin

Spec-driven development for [opencode](https://opencode.ai). Port of the [sno Claude Code plugin](https://github.com/guygrigsby/claude-plugins).

## The Loop

`learn -> plan -> build -> check -> ship`

| Command | Purpose |
|---------|---------|
| `/sno` | Router — shows current phase, suggests next step |
| `/sno-new` | Start a new cycle (branch + state) |
| `/sno-learn` | Research, interview, write spec |
| `/sno-plan` | Break spec into dependency-tracked tasks |
| `/sno-build` | Execute tasks in parallel waves |
| `/sno-check` | Verify against spec + PR review |
| `/sno-ship` | Commit, push, create PR |
| `/sno-go` | Quick mode for small tasks |
| `/sno-todo` | Parking lot for deferred items |

## Install

```bash
git clone https://github.com/guygrigsby/opencode-plugins.git
cd opencode-plugins
./install.sh
```

Then add the plugin path to your `opencode.json`:

```json
{
  "plugin": ["./path/to/opencode-plugins/sno-plugin"],
  "permission": {
    "read": {
      "~/.config/opencode/sno/*": "allow"
    },
    "external_directory": {
      "~/.config/opencode/sno/*": "allow"
    }
  }
}
```

## Prerequisites

- [opencode](https://opencode.ai) v1.2.5+
- [bun](https://bun.sh) (for the TS plugin)
- [gh](https://cli.github.com/) (for PR creation in ship phase)
- OpenAI API key configured in opencode (GPT-5.4, Codex)
- Google AI API key configured in opencode (Gemini 3.1, optional)

## Models

| Role | Model | Fallback |
|------|-------|----------|
| Research/Learn/Plan | `openai/gpt-5.4` | `openai/gpt-4.1` |
| Build/Coding | `openai/gpt-5.3-codex` | `openai/codex-mini-latest` |
| Gemini Reviewer | `google/gemini-3.1-pro-preview` | `google/gemini-2.5-pro` |

## Shared Principles

The plugin fetches design principles from the [sno Claude Code plugin](https://github.com/guygrigsby/claude-plugins) on startup and caches them locally. One source of truth, no duplication.
