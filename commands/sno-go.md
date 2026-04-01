---
description: "Quick mode for small tasks. Skip the full ceremony - describe what you want, get it done."
argument-hint: "<task description>"
tools:
  read: true
  bash: true
  grep: true
  glob: true
  write: true
  edit: true
---

<objective>
Go mode - the fast path for small, well-understood tasks that don't need the full sno loop.
</objective>

<execution_context>
@~/.config/opencode/sno/CLAUDE.md
</execution_context>

<context>
$ARGUMENTS
</context>

<process>
## What to do

1. If `$ARGUMENTS` is empty, tell the user: "What should I do? Usage: `/sno-go <task description>`" and stop.

2. Read the user's task description from `$ARGUMENTS`.

3. **Assess scope.** If the task involves:
   - More than ~5 files
   - New bounded contexts or aggregates
   - Significant architectural decisions
   - Tell the user: "This looks big enough for the full loop. Run `/sno-new` instead." Stop here.

4. **Scout the codebase.** Quickly read the relevant files to understand existing patterns and conventions. Don't spawn research agents - just read what you need.

5. **Plan in your head.** Don't write a plan file. Just figure out what to change and in what order.

6. **Do the work.** Make the changes directly. Follow existing patterns in the codebase.

7. **Write tests.** Write tests for your changes following existing test patterns in the codebase. Changes without tests break shit.

8. **Verify.** Run tests/build/lint. If something breaks, fix it. Confirm both existing and new tests pass.

9. **Report.** Tell the user what you did, briefly. Mention any judgment calls you made.

10. **Don't commit.** Leave that to the user. If they want to ship it through sno, they can run `/sno-ship`.

## Rules
- No `.sno/` state is created or modified. Go mode is stateless.
- No spec, no plan file, no research directory. This is fire-and-forget.
- Follow existing codebase patterns. Don't introduce new conventions for a quick task.
- If you hit something surprising or ambiguous, ask rather than guess. Quick doesn't mean sloppy.
- Quick doesn't mean untested. Write tests even in go mode. The only exception is if the user explicitly says to skip tests.
- Smallest diff that works. Change only what's needed to accomplish the task. Don't refactor nearby code, don't "improve" things while you're in there.
- Write comments. Public APIs get docstrings, new files get module-level descriptions, non-obvious logic gets inline "why" comments. Match the existing comment style in the codebase.
- Keep it small. If scope creeps, suggest moving to the full loop.
</process>
