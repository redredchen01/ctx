#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");

const HOME = os.homedir();
const SKILL_SRC = path.join(__dirname, "..", "SKILL.md");
const SKILL_FULL_SRC = path.join(__dirname, "..", "SKILL-full.md");

const PLATFORMS = [
  {
    name: "OpenClaw",
    detect: () => fs.existsSync(path.join(HOME, ".openclaw")),
    install: (full) => {
      const dir = path.join(HOME, ".openclaw", "skills", "ctx");
      fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(full ? SKILL_FULL_SRC : SKILL_SRC, path.join(dir, "SKILL.md"));
      return dir;
    },
  },
  {
    name: "Claude Code",
    detect: () => fs.existsSync(path.join(HOME, ".claude")),
    install: (full) => {
      const dir = path.join(HOME, ".claude", "skills", "ctx");
      fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(full ? SKILL_FULL_SRC : SKILL_SRC, path.join(dir, "SKILL.md"));
      return dir;
    },
  },
  {
    name: "Cursor",
    detect: () => fs.existsSync(path.join(process.cwd(), ".cursor")),
    install: (full) => {
      const dir = path.join(process.cwd(), ".cursor", "rules");
      fs.mkdirSync(dir, { recursive: true });
      const dest = path.join(dir, "ctx.mdc");
      fs.copyFileSync(full ? SKILL_FULL_SRC : SKILL_SRC, dest);
      return dest;
    },
    smallContext: true,
  },
  {
    name: "Cline",
    detect: () =>
      fs.existsSync(path.join(process.cwd(), ".cline")) ||
      fs.existsSync(path.join(process.cwd(), ".clinerules")),
    install: (full) => {
      const dir = path.join(process.cwd(), ".cline", "rules");
      fs.mkdirSync(dir, { recursive: true });
      const dest = path.join(dir, "ctx.md");
      fs.copyFileSync(full ? SKILL_FULL_SRC : SKILL_SRC, dest);
      return dest;
    },
  },
  {
    name: "Kilo Code",
    detect: () => fs.existsSync(path.join(process.cwd(), ".kilo")),
    install: (full) => {
      const dir = path.join(process.cwd(), ".kilo", "rules");
      fs.mkdirSync(dir, { recursive: true });
      const dest = path.join(dir, "ctx.md");
      fs.copyFileSync(full ? SKILL_FULL_SRC : SKILL_SRC, dest);
      return dest;
    },
  },
  {
    name: "Roo Code",
    detect: () =>
      fs.existsSync(path.join(process.cwd(), ".roo")) ||
      fs.existsSync(path.join(process.cwd(), ".roorules")),
    install: (full) => {
      const dir = path.join(process.cwd(), ".roo", "rules");
      fs.mkdirSync(dir, { recursive: true });
      const dest = path.join(dir, "ctx.md");
      fs.copyFileSync(full ? SKILL_FULL_SRC : SKILL_SRC, dest);
      return dest;
    },
  },
];

function install(args) {
  const full = args.includes("--full");

  console.log("\n\u{1F9E0} ctx — Context Window Manager\n");

  const detected = PLATFORMS.filter((p) => p.detect());

  if (detected.length === 0) {
    console.log("No AI agent platform detected.");
    console.log("Installing to .ctx/ (universal fallback)...\n");
    const dir = path.join(process.cwd(), ".ctx");
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(full ? SKILL_FULL_SRC : SKILL_SRC, path.join(dir, "SKILL.md"));
    console.log(`  \u2705 Installed to ${dir}/SKILL.md`);
  } else {
    console.log(`Detected ${detected.length} platform(s):\n`);
    for (const p of detected) {
      // Auto-select lite for small-context platforms unless --full
      const useFull = full && !p.smallContext;
      const result = p.install(useFull);
      const variant = useFull ? "(full)" : "(lite)";
      console.log(`  \u2705 ${p.name} \u2192 ${result} ${variant}`);
    }
  }

  // Create .ctx/checkpoints/ directory
  const cpDir = path.join(process.cwd(), ".ctx", "checkpoints");
  fs.mkdirSync(cpDir, { recursive: true });
  console.log(`  \u{1F4C1} Checkpoint dir: ${cpDir}`);

  console.log(`\n\u2728 Done! Your context window is now managed.\n`);
  console.log("  Lite: ~1.8KB prompt overhead (~500 tokens)");
  console.log("  Full: ~4KB prompt overhead (~1000 tokens) — use --full to install\n");
}

function uninstall() {
  console.log("\n\u{1F9F9} ctx uninstaller\n");
  const paths = [
    path.join(HOME, ".openclaw", "skills", "ctx"),
    path.join(HOME, ".claude", "skills", "ctx"),
    path.join(process.cwd(), ".cursor", "rules", "ctx.mdc"),
    path.join(process.cwd(), ".cline", "rules", "ctx.md"),
    path.join(process.cwd(), ".kilo", "rules", "ctx.md"),
    path.join(process.cwd(), ".roo", "rules", "ctx.md"),
  ];
  let removed = 0;
  for (const p of paths) {
    if (fs.existsSync(p)) {
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        fs.rmSync(p, { recursive: true });
      } else {
        fs.unlinkSync(p);
      }
      console.log(`  \u{1F5D1}\uFE0F  Removed ${p}`);
      removed++;
    }
  }
  if (removed === 0) console.log("  Nothing to remove.");
  console.log("\n\u2728 Uninstalled. Checkpoint files in .ctx/ are preserved.\n");
}

function status() {
  const statePath = path.join(process.cwd(), ".ctx", "state.json");
  if (!fs.existsSync(statePath)) {
    console.log("\nNo .ctx/state.json found. Run `ctx init` first.\n");
    return;
  }

  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  const pct = Math.min(100, Math.round((state.usedTokens / state.maxTokens) * 100));
  const icons = { green: "\u{1F7E2}", yellow: "\u{1F7E1}", orange: "\u{1F7E0}", red: "\u{1F534}" };
  const thresholds = [[40, "green"], [60, "yellow"], [80, "orange"], [100, "red"]];
  let threshold = "red";
  for (const [max, name] of thresholds) {
    if (pct < max) { threshold = name; break; }
  }
  const icon = icons[threshold];
  const bar = "\u2588".repeat(Math.round(pct / 3.33)) + "\u2591".repeat(30 - Math.round(pct / 3.33));
  const usedK = Math.round(state.usedTokens / 1000);
  const maxK = Math.round(state.maxTokens / 1000);

  console.log(`\n  ${icon} ctx — Context Window Status`);
  console.log(`  ${"─".repeat(40)}\n`);
  console.log(`  Usage:  ${bar} ${pct}%`);
  console.log(`          ${usedK}K / ${maxK}K tokens\n`);
  console.log(`  Threshold:    ${threshold} ${icon}`);
  console.log(`  Files read:   ${(state.filesRead || []).length}`);
  console.log(`  Duplicates:   ${state.dupCount || 0}`);
  console.log(`  Tool calls:   ${state.toolCallCount || 0}`);
  console.log(`  Writes:       ${state.writeCount || 0}`);

  const cpDir = path.join(process.cwd(), ".ctx", "checkpoints");
  if (fs.existsSync(cpDir)) {
    const cps = fs.readdirSync(cpDir).filter((f) => f.endsWith(".md"));
    if (cps.length > 0) {
      console.log(`\n  Checkpoints:  ${cps.length}`);
      console.log(`  Latest:       ${cps.sort().reverse()[0]}`);
    }
  }
  console.log("");
}

function init() {
  const ctxDir = path.join(process.cwd(), ".ctx");
  const cpDir = path.join(ctxDir, "checkpoints");

  console.log("\n\u{1F9E0} ctx init — Initialize context tracking\n");

  fs.mkdirSync(cpDir, { recursive: true });

  const statePath = path.join(ctxDir, "state.json");
  if (fs.existsSync(statePath)) {
    console.log("  \u{2705} .ctx/state.json already exists (preserved)");
  } else {
    const state = {
      maxTokens: 200000,
      usedTokens: 0,
      filesRead: [],
      dupCount: 0,
      toolCallCount: 0,
      writeCount: 0,
      bashCount: 0,
      responseCount: 0,
      checkpointedThresholds: [],
      startedAt: new Date().toISOString(),
    };
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    console.log("  \u{2705} .ctx/state.json created");
  }
  console.log("  \u{1F4C1} .ctx/checkpoints/ ready");

  // Add .ctx/ to .gitignore if exists
  const gitignorePath = path.join(process.cwd(), ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, "utf8");
    if (!content.includes(".ctx/")) {
      fs.appendFileSync(gitignorePath, "\n.ctx/\n");
      console.log("  \u{2705} Added .ctx/ to .gitignore");
    }
  }

  console.log("\n\u{2728} Ready! Hook will auto-track everything to .ctx/state.json\n");
}

function hookInstall() {
  console.log("\n\u{1F9E0} ctx hook — Install auto-tracking hook\n");

  const hookSrc = path.join(__dirname, "..", "hooks", "ctx-track.sh");
  if (!fs.existsSync(hookSrc)) {
    console.log("  \u{274C} hooks/ctx-track.sh not found");
    return;
  }

  const settingsPath = path.join(HOME, ".claude", "settings.json");
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  } else {
    fs.mkdirSync(path.join(HOME, ".claude"), { recursive: true });
  }

  const hooks = settings.hooks = settings.hooks || {};
  const afterTool = hooks.afterToolUse = hooks.afterToolUse || [];

  const hookCmd = `bash ${hookSrc}`;
  const existing = afterTool.find((e) =>
    (typeof e === "string" ? e : e.command || "").includes("ctx-track")
  );

  if (existing) {
    console.log("  \u{2705} Hook already installed");
  } else {
    afterTool.push({ command: hookCmd, description: "ctx: auto-track context window state" });
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    console.log(`  \u{2705} Hook installed in ${settingsPath}`);
  }

  console.log("\n\u{2728} Every tool call now auto-updates .ctx/state.json\n");
}

function setup(args) {
  console.log("\n\u{1F9E0} ctx setup — One command to rule them all\n");
  console.log("Step 1/3: Install skill...");
  install(args);
  console.log("Step 2/3: Initialize .ctx/...");
  init();
  console.log("Step 3/3: Install hook...");
  hookInstall();
  console.log("  \u{1F389} All done! ctx is fully operational.\n");
  console.log("  Next: start using your AI agent. ctx runs in the background.");
  console.log("  Check status anytime: npx @redredchen01/ctx status\n");
}

function reset() {
  const statePath = path.join(process.cwd(), ".ctx", "state.json");
  const historyPath = path.join(process.cwd(), ".ctx", "history.json");

  console.log("\n\u{1F9E0} ctx reset — Start fresh session\n");

  if (fs.existsSync(statePath)) {
    // Archive current session to history
    const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
    const session = {
      startedAt: state.startedAt,
      endedAt: new Date().toISOString(),
      usedTokens: state.usedTokens,
      maxTokens: state.maxTokens,
      filesRead: (state.filesRead || []).length,
      dupCount: state.dupCount || 0,
      toolCallCount: state.toolCallCount || 0,
      writeCount: state.writeCount || 0,
    };

    let history = [];
    if (fs.existsSync(historyPath)) {
      history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
    }
    history.push(session);
    // Keep last 50 sessions
    if (history.length > 50) history = history.slice(-50);
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
    console.log(`  \u{1F4BE} Session archived to history (${history.length} total)`);
    console.log(`     Used: ${Math.round(state.usedTokens / 1000)}K tokens | ${(state.filesRead || []).length} files | ${state.dupCount || 0} dups`);
  }

  // Reset state
  const newState = {
    maxTokens: 200000,
    usedTokens: 0,
    filesRead: [],
    dupCount: 0,
    toolCallCount: 0,
    writeCount: 0,
    bashCount: 0,
    responseCount: 0,
    checkpointedThresholds: [],
    startedAt: new Date().toISOString(),
  };
  fs.mkdirSync(path.join(process.cwd(), ".ctx"), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(newState, null, 2));
  console.log("  \u{2705} State reset to zero");
  console.log("\n\u{2728} Fresh session ready!\n");
}

function historyCmd() {
  const historyPath = path.join(process.cwd(), ".ctx", "history.json");
  if (!fs.existsSync(historyPath)) {
    console.log("\nNo session history yet. Run `ctx reset` after a session to archive it.\n");
    return;
  }

  const history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
  console.log(`\n\u{1F9E0} ctx history — ${history.length} sessions\n`);
  console.log(`  ${"Date".padEnd(12)} ${"Tokens".padStart(8)} ${"Files".padStart(6)} ${"Dups".padStart(5)} ${"Calls".padStart(6)}`);
  console.log(`  ${"─".repeat(12)} ${"─".repeat(8)} ${"─".repeat(6)} ${"─".repeat(5)} ${"─".repeat(6)}`);

  for (const s of history.slice(-10)) {
    const date = s.startedAt ? s.startedAt.slice(0, 10) : "unknown";
    const tokens = `${Math.round(s.usedTokens / 1000)}K`;
    console.log(`  ${date.padEnd(12)} ${tokens.padStart(8)} ${String(s.filesRead).padStart(6)} ${String(s.dupCount).padStart(5)} ${String(s.toolCallCount).padStart(6)}`);
  }

  const totalTokens = history.reduce((s, h) => s + h.usedTokens, 0);
  const totalDups = history.reduce((s, h) => s + h.dupCount, 0);
  console.log(`\n  Total: ${Math.round(totalTokens / 1000)}K tokens across ${history.length} sessions`);
  console.log(`  Duplicates blocked: ${totalDups} (saved ~${Math.round(totalDups * 200 * 15 / 1000)}K tokens)\n`);
}

const cmd = process.argv[2];
const args = process.argv.slice(3);

switch (cmd) {
  case "setup":
    setup(args);
    break;
  case "install":
    install(args);
    break;
  case "init":
    init();
    break;
  case "hook":
    hookInstall();
    break;
  case "reset":
    reset();
    break;
  case "history":
    historyCmd();
    break;
  case "uninstall":
    uninstall();
    break;
  case "status":
    status();
    break;
  default:
    console.log(`
\u{1F9E0} ctx v2.4 — Stateful Context OS for Free AI Agent Users

One-time setup:
  ctx setup [--full]     \u2B50 Install skill + init + hook (all in one!)

Individual commands:
  ctx install [--full]   Install skill to your AI agent
  ctx init               Initialize .ctx/ in current project
  ctx hook               Install auto-tracking hook

Session:
  ctx status             Show context window state
  ctx reset              Archive session + start fresh
  ctx history            Show session history + stats

Other:
  ctx uninstall          Remove skill (keeps .ctx/ data)

Supported: OpenClaw, Claude Code, Cursor, Cline, Kilo Code, Roo Code
`);
}
