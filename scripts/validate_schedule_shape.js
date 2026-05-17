#!/usr/bin/env node
const fs = require('fs');

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/validate_schedule_shape.js <csv-path>');
  process.exit(1);
}

const raw = fs.readFileSync(filePath, 'utf8').trim();
const lines = raw.split(/\r?\n/);
const header = parseCsvLine(lines[0]);
const expected = [
  'Week',
  'Date',
  'Toastmaster',
  'General Evaluator',
  'Table Topics Master',
  'Grammarian',
  'Timer',
  'Speaker',
  'Evaluator',
  'Ah Counter',
  'Word of the Day Master',
];

const hasAllExpected = expected.every((h) => header.includes(h));
console.log(`rows=${lines.length - 1}`);
console.log(`colCount=${header.length}`);
console.log(`hasAllExpected=${hasAllExpected}`);
