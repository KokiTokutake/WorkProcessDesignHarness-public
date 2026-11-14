#!/usr/bin/env node
// Injects a case's data.json into a copy of harness/report/template.html.
//
// Usage: node build_report.js <path/to/data.json> <path/to/output-report.html> [path/to/template.html]
//
// This exists because hand-editing a large embedded <script type="application/json">
// block inside an HTML file is error-prone (easy to break the surrounding tags).
// This script does the substitution mechanically and validates the JSON first.

const fs = require('fs');
const path = require('path');

const [, , dataPath, outPath, templatePathArg] = process.argv;

if (!dataPath || !outPath) {
  console.error('Usage: node build_report.js <data.json> <output.html> [template.html]');
  process.exit(1);
}

const templatePath = templatePathArg || path.join(__dirname, '..', '..', '..', 'harness', 'report', 'template.html');

if (!fs.existsSync(dataPath)) {
  console.error(`data.json not found: ${dataPath}`);
  process.exit(1);
}
if (!fs.existsSync(templatePath)) {
  console.error(`template.html not found: ${templatePath}`);
  process.exit(1);
}

const rawData = fs.readFileSync(dataPath, 'utf8');
let data;
try {
  data = JSON.parse(rawData);
} catch (e) {
  console.error(`data.json is not valid JSON: ${e.message}`);
  process.exit(1);
}

// Light structural validation so failures surface here, not silently in the browser.
const requiredTop = ['meta', 'actors', 'asis', 'issues', 'tobePatterns'];
for (const key of requiredTop) {
  if (!(key in data)) {
    console.error(`data.json is missing required top-level key: "${key}"`);
    process.exit(1);
  }
}
const actorSet = new Set(data.actors);
for (const step of data.asis.steps || []) {
  if (!actorSet.has(step.actor)) {
    console.error(`AS-IS step "${step.id}" references actor "${step.actor}" which is not in actors[]: ${JSON.stringify(data.actors)}`);
    process.exit(1);
  }
}
for (const p of data.tobePatterns || []) {
  for (const step of p.steps || []) {
    if (!actorSet.has(step.actor)) {
      console.error(`Pattern "${p.id}" step "${step.id}" references actor "${step.actor}" which is not in actors[]`);
      process.exit(1);
    }
  }
}

const html = fs.readFileSync(templatePath, 'utf8');
const marker = /<script id="report-data" type="application\/json">[\s\S]*?<\/script>/;
if (!marker.test(html)) {
  console.error('Could not find the <script id="report-data"> block in the template. Was template.html restructured?');
  process.exit(1);
}

const replacement = `<script id="report-data" type="application/json">\n${JSON.stringify(data, null, 2)}\n</script>`;
const out = html.replace(marker, replacement);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out, 'utf8');
console.log(`OK: wrote ${outPath} (${data.asis.steps.length} AS-IS steps, ${data.issues.length} issues, ${data.tobePatterns.length} TO-BE patterns)`);
