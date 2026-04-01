---
description: "Commit the work, open a PR to main, and close out the cycle."
argument-hint: "[--auto]"
tools:
  read: true
  bash: true
  grep: true
  glob: true
  write: true
  edit: true
  task: true
---

<objective>
Run the sno ship phase: commit remaining work, open a PR, and close the cycle.
</objective>

<execution_context>
@~/.config/opencode/sno/CLAUDE.md
</execution_context>

<context>$ARGUMENTS</context>

<process>
When executing this sno command, follow sno's own agent dispatch instructions. Do not use the GSD routing table.

Check if `$ARGUMENTS` contains `--auto`. If so, enable auto mode.

Read `.sno/state.json` from disk — do not rely on conversation history.

1. Read `.sno/spec.md` using the read tool for context on what was built.

2. **Stage and commit** any remaining changes:
   - Review what's changed with `git status` and `git diff` using the bash tool.
   - Note: build waves may have already committed most changes. Only stage and commit what's left (e.g., README updates from check phase, any manual fixes).
   - Stage the relevant files (not `.sno/` — that's local state).
   - If there are unstaged changes, write a clear commit message based on the spec's goal. Ask the user before committing.
   - If nothing to commit (waves already covered everything), skip to step 3.

3. **Create PR**:
   - Check the current branch name using the bash tool. If it starts with `sno/`, push the branch and create a PR to `main`:
     - `git push -u origin <branch>`
     - Use `gh pr create --base main` with the spec's goal as the title and requirements as the body.
   - If the branch does NOT start with `sno/`, skip this step.
   - If `gh pr create` fails (e.g., PR already exists), note the error and continue — don't block the cycle close.

4. **Close the cycle**:
   - Update `.sno/state.json` phase to `done`.
   - Tell the user the cycle is complete.
   - If there are items in `.sno/todos.md`, mention them: "You have N items in the todo list for next time."

## Rules
- On `sno/` branches, push and create a PR to main automatically — no confirmation needed.
- On non-sno branches, never push without explicit user confirmation.
- Smallest diff that works. Before committing, review the diff — if you see changes beyond the spec (drive-by refactors, unplanned improvements), flag them to the user.
- Don't commit `.sno/` files — they're local workflow state.
- Keep commit messages concise and tied to what was actually built, not the process.

## --auto flag

If `--auto` is set:
- Stage and commit without asking. Write the commit message from the spec's goal.
- Create the PR (same as step 3 — push and `gh pr create` on `sno/` branches).
- Close the cycle immediately.
</process>
