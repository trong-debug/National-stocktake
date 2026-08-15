#!/usr/bin/env node
// Copies .next/output -> .vercel/output (Vercel Build Output API v3)
const fs = require("fs");
const path = require("path");

const cwd = process.cwd();
const src = path.join(cwd, ".next", "output");
const dest = path.join(cwd, ".vercel", "output");

console.log("[prepare-output] cwd:", cwd);
console.log("[prepare-output] src:", src);
console.log("[prepare-output] dest:", dest);

// Diagnose if src doesn't exist
if (!fs.existsSync(src)) {
  const nextDir = path.join(cwd, ".next");
  console.error("[prepare-output] ERROR: .next/output does not exist");
  if (fs.existsSync(nextDir)) {
    console.error("[prepare-output] Contents of .next/:");
    fs.readdirSync(nextDir).forEach((f) => console.error("  ", f));
  } else {
    console.error("[prepare-output] .next/ itself does not exist");
  }
  process.exit(1);
}

// Show what we found
const entries = fs.readdirSync(src);
console.log("[prepare-output] Found in .next/output/:", entries.join(", "));

// Ensure .vercel/ exists (Vercel may have it read-only; log if so)
try {
  fs.mkdirSync(path.join(cwd, ".vercel"), { recursive: true });
} catch (err) {
  console.error("[prepare-output] Could not create .vercel/:", err.message);
  process.exit(1);
}

// Remove existing dest to avoid cpSync conflicts
if (fs.existsSync(dest)) {
  console.log("[prepare-output] Removing existing .vercel/output");
  fs.rmSync(dest, { recursive: true, force: true });
}

// Copy
try {
  fs.cpSync(src, dest, { recursive: true });
  console.log("[prepare-output] Copied .next/output -> .vercel/output");
} catch (err) {
  console.error("[prepare-output] cpSync failed:", err.message);
  process.exit(1);
}

// Verify
if (fs.existsSync(path.join(dest, "config.json"))) {
  console.log("[prepare-output] Verified: .vercel/output/config.json exists");
} else {
  console.error("[prepare-output] WARNING: .vercel/output/config.json not found after copy");
}
