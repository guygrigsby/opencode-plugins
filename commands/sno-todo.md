---
description: "Add, list, or manage parking lot items for later. Usage: /sno-todo [item to add]"
argument-hint: "[item to add]"
tools:
  read: true
  bash: true
  grep: true
  glob: true
  write: true
  edit: true
---

<objective>
Manage the sno todo list stored at `.sno/todos.md`.
</objective>

<execution_context>
@~/.config/opencode/sno/CLAUDE.md
</execution_context>

<context>
$ARGUMENTS
</context>

<process>
## What to do

**If the user provides an item** (via `$ARGUMENTS` or in their message):
1. Create `.sno/` and `.sno/todos.md` if they don't exist.
2. Append the item as a checkbox line: `- [ ] <item>`
3. Confirm: "Added to todo list. You have N items."

**If no item is provided** (just `/sno-todo` with empty `$ARGUMENTS`):
1. Read `.sno/todos.md`. If it doesn't exist or is empty, say "Todo list is empty."
2. Display the list.
3. Ask the user what they want to do:
   - Add an item
   - Remove/complete an item (mark with `[x]` or delete)
   - Promote an item to a new sno cycle (start `/sno-learn` with it as context)

## File format

```markdown
# Todo

- [ ] Item one
- [ ] Item two
- [x] Completed item
```

## Rules
- Keep it simple. This is a parking lot, not a project management tool.
- Items should be short - one line each.
- Don't auto-organize, categorize, or prioritize unless asked.
</process>
