---
description: "Execute the plan in parallel waves. Independent tasks run as concurrent agents, dependent tasks wait."
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
Run the sno build phase: execute the plan as fast as possible by parallelizing independent tasks.
</objective>

<execution_context>
@~/.config/opencode/sno/CLAUDE.md
</execution_context>

<context>$ARGUMENTS</context>

<process>
When executing this sno command, follow sno's own agent dispatch instructions. Do not use the GSD routing table.

Check if `$ARGUMENTS` contains `--auto`. If so, enable auto mode.

Read `.sno/state.json` from disk — do not rely on conversation history.

1. Read `.sno/plan.md` using the read tool. If it doesn't exist, tell the user to run `/sno-plan` first.

2. **Parse the dependency graph.** Tasks use the structured format — each task is a `### N. Title (depends: ...)` heading with `status`, `files`, `verify`, and `done` fields. Group remaining unchecked tasks (status `[ ]`) into waves:
   - **Wave 1**: all tasks with `(depends: none)` or whose dependencies are already complete `[x]`
   - **Wave 2**: tasks whose dependencies are all in wave 1
   - **Wave 3**: tasks whose dependencies are all in waves 1-2
   - ...and so on.

3. **Execute one wave at a time.** For each wave:
   - If the wave has **one task**, just do it directly — don't invoke a separate agent for a single task.
   - If the wave has **multiple tasks**, invoke them as **parallel agents** using the task tool. Call the task tool multiple times in a SINGLE response to run these agents concurrently. Do NOT wait for one to finish before starting the next.

     Before spawning, emit: "Launching N agents: sno-builder (task X), sno-builder (task Y)..."

     Each **sno-builder** agent invocation via the task tool should include in its prompt:
     - The task description, number, and `done` criterion
     - The files it should touch (from the task's `files` field)
     - The verification step (from the task's `verify` field)
     - The relevant spec sections (read from `.sno/spec.md`)
     - Existing code context (read the files it depends on so it has the types/interfaces)

     Tell each sno-builder agent:
     - Only touch the files listed in your task. Smallest diff that works — no drive-by refactors, no adjacent cleanup.
     - Implement exactly what the task describes. Nothing more.
     - **Write tests alongside your implementation.** Tests are part of "done" — a task without tests is not complete. Follow the test patterns and framework described in the spec's Test Strategy section (or match existing test patterns in the codebase). If your task modifies behavior, test that behavior.
     - **Verify your work** using the task's `verify` field — run the specified check before reporting success. Ensure all tests (both existing and new) pass.
     - **Self-review before reporting success.** After verifying, re-read all code you wrote or modified with fresh eyes. Look for: typos, wrong variable names, off-by-one errors, missing error handling, null/undefined paths, resource leaks, copy-paste artifacts. If you find something, fix it before reporting success.
     - **Write comments.** Every public function, type, and interface must have a docstring. Every new file must have a module-level comment describing its purpose. Add inline comments on non-obvious logic — explain *why*, not *what*. Match the comment style already used in the codebase (JSDoc, GoDoc, Python docstrings, etc.).
     - Do not refactor, improve, or clean up adjacent code.
     - If something is blocked or wrong, return with a description of the problem instead of guessing.

   - As each agent completes, emit: "[sno-builder task N] complete. N remaining."
   - If a task tool invocation fails, report: the failing agent name, the error description, and offer options: (1) retry, (2) fix manually, (3) skip and continue.
   - Wait for all agents in the wave to complete.
   - **Mark all completed tasks** as `[x]` in `.sno/plan.md` using the edit tool.
   - **Commit the wave.** Stage all files modified in this wave and commit with message: `sno: wave N [tasks 1,2,3] — <brief summary of what the wave did>`. Include the task numbers from the plan so git history links back to plan tasks. Do NOT include `.sno/` files.
   - Report what was done.

4. **Move to next wave.** Repeat until all tasks are complete.

## Bottleneck tasks
If the plan identifies bottleneck tasks (tasks with the most downstream dependents), verify those first after a wave completes. If a bottleneck task failed, fix it before spawning the next wave — its failure cascades to everything downstream.

5. When all tasks are done, update `.sno/state.json` phase to `check`. Then tell the user: "Run `/sno-check` to verify the work."

**STOP.** Do not proceed to the check phase. Do not start verifying anything. Your job ends here — return control to the user. The next phase starts only when the user explicitly runs `/sno-check`.

## Rules
- Never run dependent tasks in the same wave. Respect the dependency graph.
- If an agent returns with a problem, stop the current wave. Report to the user and let them decide how to proceed. Don't auto-fix.
- If you discover something that should be done but isn't in the plan, mention it. Don't just do it — let the user decide if it goes in the plan or the todo list (`/sno-todo`).
- Smallest diff that works. Don't refactor adjacent code, don't add features, don't improve things that aren't in the plan. If you see something that could be better, mention it — don't fix it.
- If the user says "just do it all", execute all waves without pausing between them. Still parallelize within each wave.
- If there's only one task remaining, just do it — don't spin up an agent for a single task.

## --auto flag

The STOP gate above does NOT apply when `--auto` is set. With `--auto`:
- Execute all waves without pausing between them (same as "just do it all").
- If an agent returns with a problem, attempt a reasonable fix once. If that fails, log the problem in `.sno/todos.md` and continue with remaining tasks.
- When all tasks are done, immediately advance to the check phase. Continue through remaining phases without stopping.
</process>
