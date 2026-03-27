---
name: ctx
version: 2.0.0
description: |
  Stateful context OS for 200K free-tier agents. Reads/writes .ctx/state.json
  on every operation. Dedup, budget, checkpoint, resume — all persisted to disk.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
---

# ctx v2 — Stateful Context OS

State persists to `.ctx/`. Execution habits with disk backing.

## Session Start

1. Read `.ctx/state.json`. If missing → create: `{"maxTokens":200000,"usedTokens":0,"filesRead":[],"dupCount":0,"responseCount":0,"toolCallCount":0,"checkpointedThresholds":[],"startedAt":"ISO"}`
2. Check `.ctx/checkpoints/` → show resume if found
3. Show status line

## On Every File Read

Before reading, check `state.json → filesRead[]`:
- Already there? → **SKIP**. Say "Already read [file], using cached knowledge." Increment `dupCount`, save.
- New file → read it, append to `filesRead[]`, add `lines×15` to `usedTokens`, save.

## On Every Response

Add `chars×0.25` to `usedTokens`. Increment `responseCount`. Save.

## On Every Tool Call

Add `1500` to `usedTokens`. Increment `toolCallCount`. Save.

## Every 5 Tool Calls

1. Read state, compute percentage + threshold
2. Show: `[ctx: ~45% | 12r 5t | 0dup | 🟢]`
3. Write `.ctx/status.md` (human dashboard)

## Thresholds + Budget

| % | Threshold | Response budget |
|---|-----------|----------------|
| <40 | 🟢 green | normal |
| 40-60 | 🟡 yellow | ~300 words |
| 60-80 | 🟠 orange | ~150 words → auto-checkpoint |
| >80 | 🔴 red | ~50 words → emergency save + new session |

## Auto-Checkpoint (at 🟠)

Write `.ctx/checkpoints/ctx-checkpoint-*.md` with task, decisions, files, pending.
Mark threshold in state so it doesn't re-trigger.

## File Layout

```
.ctx/
├── state.json          ← machine state (read/write every op)
├── status.md           ← human dashboard (refreshed every 5 calls)
└── checkpoints/        ← auto + manual saves
```

## CLI: `python3 scripts/ctx_status.py` to view, `python3 scripts/ctx_checkpoint.py [msg]` to save.
