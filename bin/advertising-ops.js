#!/usr/bin/env node
/**
 * advertising-ops CLI ("CMO in a Box")
 *
 * Installs the advertising-ops Claude Code skill into either the user-global
 * directory (~/.claude/skills/advertising-ops/) or the current project's
 * .claude/skills/advertising-ops/ directory.
 *
 * Optionally also drops a command stub in ~/.claude/commands/ so the pipeline
 * is reachable as an explicit slash command.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_NAME = 'advertising-ops';
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const SKILL_SRC = path.join(PACKAGE_ROOT, 'skill');
const PKG = require(path.join(PACKAGE_ROOT, 'package.json'));

function userClaudeDir() {
  return path.join(os.homedir(), '.claude');
}

function projectClaudeDir() {
  return path.join(process.cwd(), '.claude');
}

function resolveSkillTarget(opts) {
  const base = opts.project ? projectClaudeDir() : userClaudeDir();
  return path.join(base, 'skills', SKILL_NAME);
}

function resolveCommandsDir(opts) {
  const base = opts.project ? projectClaudeDir() : userClaudeDir();
  return path.join(base, 'commands');
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isFile()) {
      fs.copyFileSync(s, d);
    }
  }
}

function rmrf(target) {
  if (!fs.existsSync(target)) return;
  fs.rmSync(target, { recursive: true, force: true });
}

function commandStub() {
  return `---
name: ${SKILL_NAME}
description: CMO in a Box (media buyer). Scrape winning ads, template them, then generate aligned ad copy + image/video creative.
---

This command routes to the \`${SKILL_NAME}\` skill (task \`run-pipeline\`).

If the skill is installed, the Skill tool will load it automatically. Otherwise run:

    npx advertising-ops install
`;
}

function writeCommandStubs(opts) {
  const dir = resolveCommandsDir(opts);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${SKILL_NAME}.md`), commandStub());
  return { dir, count: 1 };
}

function removeCommandStubs(opts) {
  const dir = resolveCommandsDir(opts);
  const p = path.join(dir, `${SKILL_NAME}.md`);
  let removed = 0;
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    removed += 1;
  }
  return { dir, removed };
}

function install(opts) {
  const target = resolveSkillTarget(opts);
  const exists = fs.existsSync(target);

  if (exists && !opts.force) {
    console.error(
      `[advertising-ops] Skill already installed at:\n  ${target}\n\n` +
        `Run with --update to overwrite, or --uninstall to remove first.`
    );
    process.exitCode = 1;
    return;
  }

  if (exists && opts.force) {
    rmrf(target);
  }

  copyDir(SKILL_SRC, target);

  console.log(`[advertising-ops] Skill installed:`);
  console.log(`  ${target}`);

  if (opts.withCommands) {
    const result = writeCommandStubs(opts);
    console.log(`[advertising-ops] Command stub written (${result.count}):`);
    console.log(`  ${result.dir}`);
  }

  console.log('');
  console.log(`Done! Restart Claude Code to activate /${SKILL_NAME}.`);
  console.log(`Then run /${SKILL_NAME} to start the ad-intelligence to creative pipeline.`);
}

function uninstall(opts) {
  const target = resolveSkillTarget(opts);
  let removedSkill = false;
  if (fs.existsSync(target)) {
    rmrf(target);
    removedSkill = true;
  }

  const cmdResult = opts.withCommands ? removeCommandStubs(opts) : { removed: 0 };

  if (!removedSkill && cmdResult.removed === 0) {
    console.log(`[advertising-ops] Nothing to uninstall at ${target}`);
    return;
  }

  if (removedSkill) console.log(`[advertising-ops] Removed skill: ${target}`);
  if (cmdResult.removed > 0) {
    console.log(
      `[advertising-ops] Removed ${cmdResult.removed} command stub(s) from ${cmdResult.dir}`
    );
  }
}

function where(opts) {
  console.log(resolveSkillTarget(opts));
}

function help() {
  console.log(`advertising-ops v${PKG.version}  —  CMO in a Box (media buyer)

Install the advertising-ops Claude Code skill.

Usage:
  npx advertising-ops <command> [flags]

Commands:
  install         Install skill to ~/.claude/skills/${SKILL_NAME}/
  update          Same as install, but overwrite if already present
  uninstall       Remove skill from the target directory
  where           Print the target install path and exit
  --help, -h      Show this message
  --version, -v   Show version

Flags:
  --project       Install into the current project's ./.claude/ instead of ~/.claude/
  --with-commands Also write an explicit /${SKILL_NAME} slash command stub

Examples:
  npx advertising-ops install
  npx advertising-ops install --project
  npx advertising-ops install --with-commands
  npx advertising-ops update

Skill name once installed: /${SKILL_NAME}
Repo:                       https://github.com/charlesdove977/advertising-ops
`);
}

function parseArgs(argv) {
  const opts = {
    project: false,
    withCommands: false,
    force: false
  };
  let cmd = null;
  for (const arg of argv) {
    if (arg === '--project') opts.project = true;
    else if (arg === '--with-commands' || arg === '--commands') opts.withCommands = true;
    else if (arg === '--update' || arg === '--force' || arg === '-f') opts.force = true;
    else if (arg === '--help' || arg === '-h') cmd = '__help';
    else if (arg === '--version' || arg === '-v') cmd = '__version';
    else if (!arg.startsWith('-') && cmd === null) cmd = arg;
  }
  return { cmd, opts };
}

function main() {
  const { cmd, opts } = parseArgs(process.argv.slice(2));

  switch (cmd) {
    case 'install':
      install(opts);
      return;
    case 'update':
      opts.force = true;
      install(opts);
      return;
    case 'uninstall':
      uninstall(opts);
      return;
    case 'where':
      where(opts);
      return;
    case '__version':
      console.log(PKG.version);
      return;
    case '__help':
    case null:
    default:
      help();
      return;
  }
}

main();
