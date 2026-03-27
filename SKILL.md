---
name: ctx
version: 2.5.0
description: |
  Stateful context OS for 200K free-tier agents. Hook auto-tracks every operation
  to .ctx/state.json. Zero manual overhead. Dedup, budget, checkpoint, resume.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
---

# ctx v2.1 — Auto-Tracked Context OS

Hook auto-tracks everything. You just read state and act on thresholds.

## Session Start

1. Read `.ctx/state.json` — if exists, resuming
2. Check `.ctx/checkpoints/` → show resume if found
3. No state.json → create: `{"maxTokens":200000,"usedTokens":0,"filesRead":[],"dupCount":0,"toolCallCount":0,"writeCount":0,"checkpointedThresholds":[],"startedAt":"ISO"}`

## Hook handles: filesRead[], dupCount, toolCallCount, writeCount, tokens, status.md

## Your Job: Read State + Act on Thresholds

Every ~5 tool calls, read `.ctx/state.json` and show:
`[ctx: ~{_lastPercentage}% | {filesRead.length}r {writeCount}w | {dupCount}dup | ICON]`

Then follow the budget:

| % | Icon | Response budget | Action |
|---|------|----------------|--------|
| <40 | 🟢 | Normal | — |
| 40-60 | 🟡 | ~300 words | Use offset+limit for reads |
| 60-80 | 🟠 | ~150 words | Write checkpoint to `.ctx/checkpoints/` |
| >80 | 🔴 | ~50 words | Emergency save + recommend new session |

## Dedup Rule

Before reading a file, check `state.json → filesRead[]`:
- Found? → **Skip.** Say "Already read, using cached context."
- Not found? → Read normally. Hook will track it.

## Checkpoints

At 🟠, write `.ctx/checkpoints/ctx-checkpoint-*.md`:
```
---
type: checkpoint
percentage: N
---
Task summary, decisions, key files, pending work.
```

Or user runs: `python3 scripts/ctx_checkpoint.py "message"`

## View: `python3 scripts/ctx_status.py` or read `.ctx/status.md`
