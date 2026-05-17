#!/usr/bin/env node
/**
 * Toastmasters Meeting Role Schedule Generator
 *
 * Usage:
 *   node generate-schedule.js --config members.json [--output schedule.csv] [--start-date YYYY-MM-DD]
 *
 * Config schema: see assets/members-example.json
 */

const fs = require('fs');
const {
  ROLES,
  generateSchedule,
  toCSV,
} = require('../../../../webapp/scheduler/scheduler-core.js');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { output: 'schedule.csv' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' && args[i + 1]) opts.config = args[++i];
    else if (args[i] === '--output' && args[i + 1]) opts.output = args[++i];
    else if (args[i] === '--start-date' && args[i + 1]) opts.startDate = args[++i];
    else if (args[i] === '--profile' && args[i + 1]) opts.profile = args[++i];
  }
  return opts;
}

function printSummary(membersWithTargets, schedule) {
  const counts = {};
  membersWithTargets.forEach((m) => { counts[m.name] = {}; });

  for (const row of schedule) {
    for (const role of ROLES) {
      const name = row[role];
      if (name && counts[name]) {
        counts[name][role] = (counts[name][role] || 0) + 1;
      }
    }
  }

  console.log('\n=== Role Assignment Summary ===');
  for (const member of membersWithTargets) {
    const { name, goal, targets } = member;
    console.log(`\n${name} (${goal}):`);
    const roleEntries = ROLES.map((r) => [r, counts[name][r] || 0, targets[r] || 0]);
    roleEntries.sort((a, b) => b[1] - a[1]);
    for (const [role, actual, target] of roleEntries) {
      const diff = actual - target;
      const flag = Math.abs(diff) > Math.ceil(target * 0.15) && target > 0 ? ' ⚠' : '';
      console.log(`  ${role.padEnd(26)} actual=${String(actual).padStart(2)}  target=${String(target).padStart(2)}${flag}`);
    }
  }
  console.log('\n⚠ = actual count deviates >15% from target');
}

function main() {
  const opts = parseArgs();

  if (!opts.config) {
    console.error('Usage: node generate-schedule.js --config members.json [--output schedule.csv] [--start-date YYYY-MM-DD] [--profile scale]');
    process.exit(1);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(opts.config, 'utf8'));
  } catch (err) {
    console.error(`Failed to read config: ${err.message}`);
    process.exit(1);
  }

  if (opts.startDate) config.start_date = opts.startDate;

  const { schedule, membersWithTargets, swapsApplied } = generateSchedule(config, opts);
  const csv = toCSV(schedule);

  fs.writeFileSync(opts.output, csv, 'utf8');
  console.log(`\nSchedule written to: ${opts.output}`);
  console.log(`Weeks: ${schedule.length}  |  Members: ${config.members.length}  |  Total role assignments: ${schedule.length * ROLES.length}`);
  if (opts.profile) console.log(`Profile: ${opts.profile}`);
  console.log(`Second-pass swaps applied: ${swapsApplied}`);

  printSummary(membersWithTargets, schedule);
}

main();
