---
name: ctx
version: 0.4.1
description: |
  Context window auto-manager for 200K free-tier agents (OpenClaw, Claude Code, Cline, etc).
  Tracks usage, deduplicates file reads, controls response budget, auto-checkpoints.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
---

# ctx — Context Window Manager

Protect your 200K context. Deduplicate reads, budget responses, auto-checkpoint.

## Always-On: Status + File Dedup

Every 5 tool calls show: `[ctx: ~45% | 12r 5w | 0dup | 🟢]`

Before ANY file read:
1. Already read? → **Don't re-read.** Use memory.
2. Need specific lines? → Use `offset`+`limit`.
3. Large file (>200 lines)? → Read only relevant section.

## Thresholds + Response Budget

| % | Status | Response limit | Action |
|---|--------|---------------|--------|
| < 40% | 🟢 | Normal | No action |
| 40-60% | 🟡 | ~300 words | Line-range reads. Consolidate tool calls. |
| 60-80% | 🟠 | ~150 words | **Auto-checkpoint** to `.ctx/checkpoints/`. Action-only replies. |
| > 80% | 🔴 | ~50 words | **Emergency**: save all, suggest new session. |

## Estimation

| Signal | Tokens |
|--------|--------|
| User turn | ~800 |
| Your response | ~600 |
| Tool result | ~1500 |
| File read | lines × 15 |
| `[compacted]` | At limit — save immediately |

## Checkpoint

Write `.ctx/checkpoints/ctx-checkpoint-YYYYMMDD-HHmmss.md`:
```
---
type: checkpoint
percentage: N
threshold: color
timestamp: ISO-8601
---
Task summary, key files, decisions, what's left.
```

## Platforms

| Platform | Context | Memory Path |
|----------|---------|-------------|
| OpenClaw | 200K | ~/.openclaw/workspace/memory/ |
| Claude Code | 200K | ~/.claude/projects/*/memory/ |
| Cline/Kilo | 200K | .cline/memory/ or .kilo/memory/ |
| Cursor | 128K | .cursor/memory/ |

## Rules

- Never re-read a file already in context
- Status line < 80 chars, every 5 tool calls
- Checkpoint files < 50 lines
- At 🟠: save before continuing
- At 🔴: stop coding, save everything, new session
