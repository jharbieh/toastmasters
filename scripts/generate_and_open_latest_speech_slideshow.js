#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const rootDir = process.cwd();
const speechesDir = path.join(rootDir, "speeches");

function runGenerator() {
  const result = spawnSync(process.execPath, ["scripts/generate_speech_assets.js"], {
    cwd: rootDir,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function findLatestSpeechHtml() {
  if (!fs.existsSync(speechesDir)) {
    return null;
  }

  const files = fs
    .readdirSync(speechesDir)
    .filter((name) => name.startsWith("speech_") && name.endsWith(".html"))
    .map((name) => {
      const fullPath = path.join(speechesDir, name);
      const stat = fs.statSync(fullPath);
      return {
        name,
        fullPath,
        mtimeMs: stat.mtimeMs,
      };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  return files[0] || null;
}

function openFile(filePath) {
  if (process.platform === "win32") {
    const child = spawn("explorer.exe", [filePath], { detached: true, stdio: "ignore" });
    child.unref();
    return;
  }

  if (process.platform === "darwin") {
    const child = spawn("open", [filePath], { detached: true, stdio: "ignore" });
    child.unref();
    return;
  }

  const child = spawn("xdg-open", [filePath], { detached: true, stdio: "ignore" });
  child.unref();
}

function toPosix(relPath) {
  return relPath.split(path.sep).join("/");
}

function main() {
  runGenerator();

  const latest = findLatestSpeechHtml();
  if (!latest) {
    console.error("[error] No speech slideshow HTML found in speeches/.");
    process.exit(1);
  }

  openFile(latest.fullPath);
  console.log(`[ok] opened=${toPosix(path.relative(rootDir, latest.fullPath))}`);
}

main();
