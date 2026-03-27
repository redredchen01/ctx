---
name: ctx
version: 0.5.0
description: |
  Context window auto-manager for 200K free-tier agents (OpenClaw, Claude Code, Cline, etc).
  Deduplicates reads, budgets responses, plans tasks, guards against compaction, optimizes tools.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
---

# ctx — Context Window Manager

Maximize your 200K. Deduplicate, budget, plan, guard, optimize.

## Always-On

Every 5 tool calls: `[ctx: ~45% | 12r 5w | 0dup | 🟢]`

Before ANY read: already read → use memory. Need part → use offset+limit. >200 lines → section only.

Tool optimization: batch parallel reads, cache grep results, combine operations.

## Thresholds + Response Budget

| % | Status | Response | Action |
|---|--------|----------|--------|
| <40% | 🟢 | Normal | No action |
| 40-60% | 🟡 | ~300 words | Line-range reads. Consolidate calls. |
| 60-80% | 🟠 | ~150 words | **Auto-checkpoint** + alert user. |
| >80% | 🔴 | ~50 words | **Emergency save**, suggest new session. |

## Task Budget (before multi-file tasks)

Before starting a task touching 3+ files, estimate:
- Files × lines × 15 tokens + responses × 600 + tool calls × 1500
- If estimate > remaining → warn + suggest splitting or prioritizing

## Compaction Guard

On these signals, **immediately save all context**:
- `[compacted]` system message
- Re-reading a file already in context (memory was pruned)
- System compression notice

Save to `.ctx/checkpoints/ctx-emergency-*.md` with: task, decisions, files, pending work.

## Tokens: turn ~800, response ~600, tool ~1500, file = lines×15

## Checkpoints → `.ctx/checkpoints/ctx-checkpoint-*.md`

## Platforms: OpenClaw/Claude Code/Cline/Kilo 200K, Cursor 128K
