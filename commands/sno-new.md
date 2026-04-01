---
description: "Start a new sno cycle. Pulls latest, creates a branch, and initializes .sno/ state."
tools:
  read: true
  bash: true
  grep: true
  glob: true
  write: true
  edit: true
---

<objective>
Initialize sno in the current project. Pull latest, create a feature branch, and set up .sno/ state.
</objective>

<execution_context>
@~/.config/opencode/sno/CLAUDE.md
</execution_context>

<context>
$ARGUMENTS
</context>

<process>
## What to do

1. Check if `.sno/state.json` already exists. If it does:
   - Read it. If phase is `done`, **archive the old cycle** before re-initializing:
     - Create `.sno/archive/` if it doesn't exist.
     - Move the current cycle's files into `.sno/archive/<N>/` where N is the next available number (1, 2, 3...).
     - Files to archive: `spec.md`, `plan.md`, `todos.md`, `research/` (everything except `state.json` and `archive/`).
     - Keep only the last 5 archived cycles. If there are more than 5, delete the oldest.
   - If phase is NOT `done`, tell the user: "sno is already initialized. Current phase: **<phase>**. Run `/sno` to continue." Stop here.

2. **Pull latest and create a branch.**
   - Run `git pull` on the current branch to get latest changes.
   - Ask the user what they're working on (one short phrase). Use it to create a branch name: `sno/<slugified-phrase>` (e.g., `sno/add-retry-logic`).
   - Run `git checkout -b sno/<branch-name>`.
   - If the branch already exists, tell the user and ask them to pick a different name.

3. Create `.sno/state.json` (or overwrite after archiving):
   ```json
   {"phase": "learn", "started": "<ISO date>"}
   ```

4. Check if `.gitignore` exists. If it does, check whether `.sno/` is already in it. If not, append `.sno/` to `.gitignore`. If no `.gitignore` exists, create one with `.sno/` in it.

5. Tell the user:
   - "sno initialized on branch `sno/<branch-name>`. Run `/sno-learn` to start, or `/sno` to see where you are."
   - If a cycle was archived, mention: "Previous cycle archived to `.sno/archive/<N>/`."

That's it. Don't start the learn phase, don't do anything else beyond these steps.
</process>
