# ctx

**Context window auto-manager for free AI agent users.** Your 200K context, maximized.

[![npm](https://img.shields.io/npm/v/ctx-skill)](https://www.npmjs.com/package/ctx-skill)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## The Problem

Free-tier AI agents give you ~200K tokens per session. You don't know how much you've used until the agent suddenly forgets everything.

```
You: [50 tool calls later]
Agent: Sorry, I don't have context on what we discussed earlier...
You: 😤
```

## The Solution

```bash
npx ctx-skill install
```

ctx auto-manages your context window:

- **Shows usage** — `[ctx: ~45% | 12r 5w | 🟢]` after every few tool calls
- **Auto-checkpoints** — saves key context to disk before it's lost
- **Guides behavior** — tells the agent to be efficient as context fills up
- **Emergency save** — dumps everything when hitting the limit

**Prompt overhead: ~500 tokens** (0.25% of your 200K).

---

## Install

### One command (recommended)

```bash
npx ctx-skill install
```

Auto-detects your platform and installs the right version:

```
🧠 ctx — Context Window Manager

Detected 2 platform(s):

  ✅ OpenClaw → ~/.openclaw/skills/ctx/ (lite)
  ✅ Claude Code → ~/.claude/skills/ctx/ (lite)
  📁 Checkpoint dir: .ctx/checkpoints/

✨ Done! Your context window is now managed.
```

### Full version (for 1M context users)

```bash
npx ctx-skill install --full
```

### Manual

```bash
git clone https://github.com/redredchen01/ctx.git
cp ctx/SKILL.md ~/.openclaw/skills/ctx/SKILL.md  # OpenClaw
cp ctx/SKILL.md ~/.claude/skills/ctx/SKILL.md     # Claude Code
cp ctx/SKILL.md .cursor/rules/ctx.mdc             # Cursor
cp ctx/SKILL.md .cline/rules/ctx.md               # Cline
```

---

## Supported Platforms

| Platform | Context Window | Status |
|----------|---------------|--------|
| **OpenClaw** | 200K | ✅ Primary |
| **Claude Code** | 200K | ✅ |
| **Cline** | 200K | ✅ |
| **Kilo Code** | 200K | ✅ |
| **Roo Code** | 200K | ✅ |
| **Cursor** | 128K | ✅ (auto-adjusts thresholds) |

---

## How It Works

```
Session starts
    │
    ▼
🟢 < 40%     Normal — work freely
    │
    ▼
🟡 40-60%    Be efficient — line-range reads, consolidate calls
    │
    ▼
🟠 60-80%    Auto-checkpoint — save key context to .ctx/checkpoints/
    │
    ▼
🔴 > 80%     Emergency — save everything, suggest new session
```

### Status Line

After every few tool calls, the agent shows:

```
[ctx: ~45% | 12r 5w | 🟢]
        │      │   │    └─ threshold color
        │      │   └────── write operations
        │      └────────── read operations
        └───────────────── estimated context usage
```

### Checkpoint Files

Saved to `.ctx/checkpoints/ctx-checkpoint-YYYYMMDD-HHmmss.md`:

```markdown
---
type: checkpoint
percentage: 65
threshold: orange
timestamp: 2026-03-27T12:00:00Z
---

## Checkpoint at 65%

Working on auth module refactor. JWT implementation done.

### Key Files
- src/auth.js
- src/middleware.js

### Decisions
- Use JWT over sessions for stateless auth
```

---

## Lite vs Full

| | Lite | Full |
|---|---|---|
| **Size** | ~1.8KB (~500 tokens) | ~4KB (~1000 tokens) |
| **Target** | Free users (200K) | Paid users (1M) |
| **Thresholds** | ✅ | ✅ |
| **Status line** | ✅ | ✅ |
| **Auto-checkpoint** | ✅ | ✅ |
| **Detailed stage behaviors** | basic | ✅ detailed |
| **Memory health score** | — | ✅ |
| **session-wrap integration** | — | ✅ |
| **Cross-session resume** | — | ✅ |

Default is Lite. Use `--full` if you have a large context window.

---

## Works with session-wrap

ctx manages the **process** (during your session). [session-wrap](https://github.com/redredchen01/session-wrap-skill) manages the **ending** (when you're done).

```
ctx (live monitoring)  ──→  session-wrap (session end)
  │                              │
  │ At 🟠: auto-checkpoint       │ User says "收工"
  │ At 🔴: trigger session-wrap  │ Full memory save
  └──────────────────────────────┘
```

Install both for full coverage:

```bash
npx ctx-skill install
npx session-wrap-skill install
```

---

## Uninstall

```bash
npx ctx-skill uninstall
```

Removes skill files but keeps your checkpoints in `.ctx/`.

---

## Development

```bash
git clone https://github.com/redredchen01/ctx.git
cd ctx
npm install
npm test           # 64 tests
npm test -- --watch  # TDD mode
```

## License

MIT
