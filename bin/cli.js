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
  const cpDir = path.join(process.cwd(), ".ctx", "checkpoints");
  if (!fs.existsSync(cpDir)) {
    console.log("\nNo .ctx/checkpoints/ found. Run `ctx install` first.\n");
    return;
  }
  const files = fs.readdirSync(cpDir).filter((f) => f.endsWith(".md"));
  console.log(`\n\u{1F9E0} ctx status\n`);
  console.log(`  Checkpoints: ${files.length}`);
  if (files.length > 0) {
    const latest = files.sort().reverse()[0];
    console.log(`  Latest: ${latest}`);
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

const cmd = process.argv[2];
const args = process.argv.slice(3);

switch (cmd) {
  case "install":
    install(args);
    break;
  case "init":
    init();
    break;
  case "hook":
    hookInstall();
    break;
  case "uninstall":
    uninstall();
    break;
  case "status":
    status();
    break;
  default:
    console.log(`
\u{1F9E0} ctx v2.1 — Stateful Context OS for Free AI Agent Users

Setup (one time):
  ctx install [--full]   Install skill to your AI agent
  ctx init               Initialize .ctx/ in current project
  ctx hook               Install auto-tracking hook (Claude Code)

Usage:
  ctx status             Show context window state
  ctx uninstall          Remove skill (keeps .ctx/ data)

Or use Python scripts:
  python3 scripts/ctx_status.py          Visual status dashboard
  python3 scripts/ctx_checkpoint.py MSG  Manual checkpoint

Supported: OpenClaw, Claude Code, Cursor, Cline, Kilo Code, Roo Code
`);
}
