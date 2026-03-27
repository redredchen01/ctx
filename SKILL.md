---
name: ctx
version: 0.1.0
description: |
  Context window auto-manager for 200K free-tier agents (OpenClaw, Claude Code, Cline, etc).
  Tracks usage, auto-checkpoints, prevents context loss. Say "ctx" to see status.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
---

# ctx — Context Window Manager

Track and protect your 200K context window. Auto-checkpoint before you lose anything.

## Always-On Behavior

After every 5 tool calls, mentally estimate context usage and show a one-line status:

`[ctx: ~45% | 12r 5w | 🟢]`

## Thresholds

| % | Status | Action |
|---|--------|--------|
| < 40% | 🟢 | Normal. No action. |
| 40%-60% | 🟡 | Use line-range reads. Consolidate tool calls. Show status. |
| 60%-80% | 🟠 | **Auto-checkpoint**: save key context to `.ctx/checkpoints/`. Alert user. |
| > 80% | 🔴 | **Emergency**: minimal responses, save everything, suggest new session. |

## Estimation Signals

| Signal | Weight |
|--------|--------|
| User turns × 800 tokens | medium |
| Tool results × 1500 tokens | high |
| File reads × lines × 15 tokens | high |
| Your responses × 600 tokens | medium |
| `[compacted]` system message | = already at limit |

## Checkpoint Format

Write to `.ctx/checkpoints/ctx-checkpoint-YYYYMMDD-HHmmss.md`:

```
---
type: checkpoint
percentage: 60
threshold: orange
timestamp: ISO-8601
---
## Checkpoint at 60%
Summary of current work, key decisions, modified files.
```

## Platforms

| Platform | Context | Memory Path |
|----------|---------|-------------|
| OpenClaw | 200K | ~/.openclaw/workspace/memory/ |
| Claude Code | 200K | ~/.claude/projects/*/memory/ |
| Cline/Kilo | 200K | .cline/memory/ or .kilo/memory/ |
| Cursor | 128K | .cursor/memory/ |
| Fallback | 200K | .ai-memory/ |

## Rules

- Status line < 80 chars, show every 5 tool calls
- Checkpoint files < 50 lines
- Never re-read a file already in context
- At 🟠: save progress before continuing
- At 🔴: stop coding, save everything, recommend new session
