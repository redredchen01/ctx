---
name: ctx
version: 1.0.0
description: |
  Context OS for 200K free-tier agents. Dedup reads, budget responses, plan tasks,
  guard compaction, optimize tools, resume sessions. Say "ctx" for status.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
---

# ctx — Context OS for Free Users

Maximize your 200K. Deduplicate, budget, plan, guard, optimize, resume.

## Session Start

Check `.ctx/checkpoints/` for previous state. If found, show:
`📋 Resuming from checkpoint (~60%). Last: [summary]`

Load memory selectively: MEMORY.md index only (~200 tokens), then load only relevant files based on user's first message. Always load user + feedback types.

## Always-On

Every 5 tool calls: `[ctx: ~45% | 12r 5w | 0dup | 🟢]`

Before ANY read: already read → use memory. Need part → offset+limit. >200 lines → section only.

Optimize: batch parallel reads, cache grep results, combine operations.

## Thresholds + Response Budget

| % | St | Response | Action |
|---|----|----------|--------|
| <40 | 🟢 | Normal | — |
| 40-60 | 🟡 | ~300w | Line-range reads. Consolidate. |
| 60-80 | 🟠 | ~150w | **Auto-checkpoint** + alert. |
| >80 | 🔴 | ~50w | **Emergency save**, new session. |

## Task Budget

Before 3+ file tasks: estimate tokens (files×lines×15 + responses×600 + tools×1500). If > remaining → warn + suggest split.

## Compaction Guard

On `[compacted]`, re-read signals, or compression notice → **immediately** save to `.ctx/checkpoints/ctx-emergency-*.md`: task, decisions, files, pending, critical context.

## Tokens: turn ~800, response ~600, tool ~1500, file = lines×15

## Checkpoints → `.ctx/checkpoints/`

## Platforms: OpenClaw/Claude Code/Cline/Kilo 200K, Cursor 128K
