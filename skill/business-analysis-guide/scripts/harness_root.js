#!/usr/bin/env node
// Prints the absolute path of the WorkProcessDesignHarness repository root.
//
// Usage: node <skill-dir>/scripts/harness_root.js
//
// The skill is installed at user level as a junction/symlink
// (~/.claude/skills/business-analysis-guide -> <repo>/skill/business-analysis-guide),
// so the skill's own base directory does not tell where the harness lives.
// Resolve the real path of this script and walk up from
// <repo>/skill/business-analysis-guide/scripts to <repo>.

const fs = require('fs');
const path = require('path');

const root = path.resolve(fs.realpathSync(__dirname), '..', '..', '..');

if (!fs.existsSync(path.join(root, 'harness', 'framework.md'))) {
  console.error(`harness/framework.md not found under ${root}. Is the skill linked to the WorkProcessDesignHarness repository?`);
  process.exit(1);
}

console.log(root);
