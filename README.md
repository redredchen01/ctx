# ctx

**免費用戶的 Context 神器** — 一行安裝，自動幫你管好 200K 上下文窗口。再也不會突然失憶。

The **must-have** context window manager for free-tier AI agent users. One install, zero config.

[![npm](https://img.shields.io/npm/v/@redredchen01/ctx)](https://www.npmjs.com/package/@redredchen01/ctx)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-90%20passing-brightgreen)](.)

---

## 你遇過這些嗎？

```
❌ 做到一半，AI 突然忘了前面在幹嘛
❌ 不知道 context 還剩多少，每次都在賭
❌ AI 瘋狂重複讀同一個檔案，浪費你的 token
❌ Context 爆了，整個 session 的進度全丟
```

**如果你用免費版 Claude Code / OpenClaw / Cursor / Cline — 你一定遇過。**

## 一行解決

```bash
npx @redredchen01/ctx install
```

裝完就不用管了。ctx 在背景自動運作：

```
[ctx: ~45% | 12r 5w | 0dup | 🟢]   ← 每隔幾次操作自動顯示
```

---

## 它幫你做了什麼？

### 1. 即時顯示 Context 用量

你終於知道「還剩多少電」了：

```
[ctx: ~23% | 6r 2w | 0dup | 🟢]    正常，放心工作
[ctx: ~52% | 18r 8w | 2dup | 🟡]   過半了，AI 自動精簡回覆
[ctx: ~71% | 30r 15w | 5dup | 🟠]  ⚠️ 自動存檔，關鍵進度已保存
[ctx: ~88% | 42r 20w | 8dup | 🔴]  🚨 建議開新對話，所有進度已保存
```

### 2. 自動阻止重複讀檔（省 30% context）

**這是最值錢的功能。** 免費用戶最大的 token 浪費就是 AI 反覆讀同一個檔案。

ctx 讓 AI 記住讀過什麼：
- 已讀過的檔案 → 直接引用記憶，不重讀
- 大檔案 → 只讀需要的段落，不讀全部
- 重複讀取 → 自動攔截 + 計入 `dup` 計數

**等效於把你的 200K 擴大到 ~260K。**

### 3. 自動控制回覆長度

| Context 用量 | AI 的回覆 |
|-------------|----------|
| 🟢 < 40% | 正常，想多長就多長 |
| 🟡 40-60% | 自動精簡到 ~300 字 |
| 🟠 60-80% | 只講重點，~150 字 |
| 🔴 > 80% | 只執行動作，~50 字 |

你不需要手動說「請簡短一點」— ctx 自動處理。

### 4. 自動存檔，不怕 Context 爆掉

到 60% 時自動存一個 checkpoint 到磁碟。即使 context 爆了、session 斷了，你的進度不會丟：

```markdown
# .ctx/checkpoints/ctx-checkpoint-20260327-143022.md

## Checkpoint at 65%
正在重構 auth 模組。JWT 實作完成，middleware 還差 2 個 endpoint。

### Key Files
- src/auth.js (已改)
- src/middleware.js (進行中)

### Decisions
- 用 JWT 取代 session，因為要 stateless
```

下次開新對話，AI 自動讀取 checkpoint，接著做。

---

## 安裝

**10 秒搞定，支援所有主流免費 Agent：**

```bash
npx @redredchen01/ctx install
```

```
🧠 ctx — Context Window Manager

Detected 2 platform(s):

  ✅ OpenClaw → ~/.openclaw/skills/ctx/ (lite)
  ✅ Claude Code → ~/.claude/skills/ctx/ (lite)
  📁 Checkpoint dir: .ctx/checkpoints/

✨ Done! Your context window is now managed.
```

### 不想裝 Node？

```bash
curl -fsSL https://raw.githubusercontent.com/redredchen01/ctx/main/install.sh | bash
```

### 手動安裝

```bash
git clone https://github.com/redredchen01/ctx.git
# 複製到你的 agent:
cp ctx/SKILL.md ~/.openclaw/skills/ctx/SKILL.md   # OpenClaw
cp ctx/SKILL.md ~/.claude/skills/ctx/SKILL.md      # Claude Code
cp ctx/SKILL.md .cursor/rules/ctx.mdc              # Cursor
cp ctx/SKILL.md .cline/rules/ctx.md                # Cline / Kilo Code
```

---

## 支援的免費 Agent

| Agent | Context Window | 免費可用 | 狀態 |
|-------|---------------|---------|------|
| **OpenClaw** | 200K | ✅ 完全免費 | ✅ 主要支援 |
| **Claude Code** | 200K | ✅ 免費額度 | ✅ |
| **Cline** | 200K | ✅ 自帶 API key | ✅ |
| **Kilo Code** | 200K | ✅ 自帶 API key | ✅ |
| **Roo Code** | 200K | ✅ 自帶 API key | ✅ |
| **Cursor** | 128K | ✅ 免費額度 | ✅ 自動調整閾值 |

**只要你的 Agent 能讀 prompt file，ctx 就能用。**

---

## 為什麼免費用戶特別需要 ctx？

| | 沒有 ctx | 有 ctx |
|---|---|---|
| **可用 context** | 200K（但實際浪費 30%+） | 200K → **等效 ~260K** |
| **知道剩多少** | ❌ 完全不知道 | ✅ 即時顯示 |
| **重複讀檔** | AI 隨意重讀，浪費 token | ✅ 自動攔截 |
| **回覆太長** | AI 不知道該省，一路長文 | ✅ 自動縮減 |
| **Context 爆了** | 進度全丟，從頭來 | ✅ 自動存檔，下次接續 |
| **Prompt 開銷** | — | 僅 ~500 tokens (0.25%) |

**付出 0.25% 的 context，換回 30%+ 的有效空間。這是免費用戶最划算的投資。**

---

## 它有多輕？

```
SKILL.md: 1,995 bytes | 74 行 | ~500 tokens

對比你的 200K context window:

████████████████████████████████████████████░ 你的可用空間 (99.75%)
░                                             ctx 佔用 (0.25%)
```

---

## 搭配 session-wrap 效果更好

ctx 管**過程中**（防止浪費 + 自動存檔），[session-wrap](https://github.com/redredchen01/session-wrap-skill) 管**收工時**（完整記憶保存）。

```
工作中                          收工
  │                              │
  ctx 監控 + 去重 + 預算控制      session-wrap 完整記憶保存
  ctx 到 60% 自動存檔            用戶說「收工」觸發
  ctx 到 80% 建議開新對話        保存到下次 session 自動載入
```

兩個都裝：

```bash
npx @redredchen01/ctx install
npx session-wrap-skill install
```

---

## Lite vs Full

| | Lite（預設） | Full |
|---|---|---|
| **給誰用** | **免費用戶 (200K)** | 付費用戶 (1M) |
| **大小** | ~500 tokens | ~1000 tokens |
| Context 監控 | ✅ | ✅ |
| 檔案去重 | ✅ | ✅ |
| 回覆預算 | ✅ | ✅ |
| 自動存檔 | ✅ | ✅ |
| 記憶健康分數 | — | ✅ |
| 階段行為詳細指引 | — | ✅ |
| session-wrap 整合 | — | ✅ |

```bash
npx @redredchen01/ctx install          # Lite（推薦）
npx @redredchen01/ctx install --full   # Full
```

---

## 移除

```bash
npx @redredchen01/ctx uninstall
```

只移除 skill 檔案，你的 checkpoint 會保留在 `.ctx/`。

---

## 開發

```bash
git clone https://github.com/redredchen01/ctx.git
cd ctx
npm install
npm test              # 90 tests
npm test -- --watch   # TDD mode
```

歡迎 PR：更多 Agent 支援、context 估算優化、視覺化報告。

## License

MIT — 免費用，免費改，免費分享。
