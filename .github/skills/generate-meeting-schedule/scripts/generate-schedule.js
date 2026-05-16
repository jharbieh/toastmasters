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

const ROLES = [
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

const WEEKS = 52;

const DEFAULT_WEIGHTS = {
  public_speaker: {
    Speaker: 35, Toastmaster: 20, 'Table Topics Master': 15,
    Evaluator: 10, 'General Evaluator': 5, Grammarian: 5,
    'Word of the Day Master': 5, Timer: 3, 'Ah Counter': 2,
  },
  leader: {
    Toastmaster: 30, 'General Evaluator': 25, 'Table Topics Master': 20,
    Evaluator: 15, Speaker: 5, Grammarian: 3,
    'Word of the Day Master': 1, Timer: 1, 'Ah Counter': 0,
  },
  communicator: {
    Speaker: 25, Evaluator: 20, 'Table Topics Master': 15,
    Toastmaster: 12, Grammarian: 10, 'Word of the Day Master': 8,
    'General Evaluator': 5, Timer: 3, 'Ah Counter': 2,
  },
  balanced: {
    Speaker: 15, Toastmaster: 14, 'Table Topics Master': 12,
    'General Evaluator': 12, Evaluator: 12, Grammarian: 9,
    'Word of the Day Master': 9, Timer: 9, 'Ah Counter': 8,
  },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { output: 'schedule.csv' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' && args[i + 1]) opts.config = args[++i];
    else if (args[i] === '--output' && args[i + 1]) opts.output = args[++i];
    else if (args[i] === '--start-date' && args[i + 1]) opts.startDate = args[++i];
  }
  return opts;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Resolve the weight profile for a member.
 * Priority: member-level weights > config goal-level weights > built-in defaults.
 */
function resolveWeights(member, configWeights) {
  if (member.weights) return member.weights;
  if (configWeights && configWeights[member.goal]) return configWeights[member.goal];
  return DEFAULT_WEIGHTS[member.goal] || DEFAULT_WEIGHTS.balanced;
}

/**
 * Calculate how many times each member should fill each role over WEEKS weeks,
 * respecting the supply constraint: each role has exactly WEEKS slots (one per week).
 * If total member demand for a role exceeds supply, targets are scaled down proportionally.
 */
function buildTargets(members, configWeights) {
  const totalSlots = WEEKS * ROLES.length;
  const perMember = totalSlots / members.length;
  const roleSupply = WEEKS; // one slot per role per week

  // Step 1: Compute continuous raw targets per member
  const withRaw = members.map((member) => {
    const w = resolveWeights(member, configWeights);
    const weightSum = ROLES.reduce((s, r) => s + (w[r] || 0), 0) || 100;
    const raw = {};
    for (const role of ROLES) {
      raw[role] = ((w[role] || 0) / weightSum) * perMember;
    }
    return { ...member, raw };
  });

  // Step 2: Scale down over-subscribed roles so total demand ≤ supply
  for (const role of ROLES) {
    const totalDemand = withRaw.reduce((s, m) => s + m.raw[role], 0);
    if (totalDemand > roleSupply) {
      const scale = roleSupply / totalDemand;
      withRaw.forEach((m) => { m.raw[role] *= scale; });
    }
  }

  // Step 3: Floor to integers then distribute remaining slots by largest fractional part
  return withRaw.map((member) => {
    const targets = {};
    for (const role of ROLES) targets[role] = Math.floor(member.raw[role]);

    let memberTotal = Object.values(targets).reduce((a, b) => a + b, 0);
    const targetTotal = Math.round(perMember);
    const fractions = [...ROLES]
      .sort((a, b) => (member.raw[b] - Math.floor(member.raw[b])) - (member.raw[a] - Math.floor(member.raw[a])));
    let i = 0;
    while (memberTotal < targetTotal) {
      targets[fractions[i % ROLES.length]]++;
      memberTotal++;
      i++;
    }

    return { ...member, targets, remaining: { ...targets } };
  });
}

function generateSchedule(config) {
  const { members, start_date, weights: configWeights } = config;
  if (!members || members.length === 0) throw new Error('No members provided in config.');

  const membersWithTargets = buildTargets(members, configWeights);
  const startDate = new Date(start_date || new Date().toISOString().split('T')[0]);

  // lastWeekAssigned[memberName][role] = week number of last assignment
  const lastWeekAssigned = {};
  membersWithTargets.forEach((m) => { lastWeekAssigned[m.name] = {}; });

  const schedule = [];

  for (let week = 1; week <= WEEKS; week++) {
    const meetingDate = formatDate(addDays(startDate, (week - 1) * 7));
    const row = { week, date: meetingDate };
    const assignedThisWeek = new Set();

    // Process most-contested roles first so high-priority members aren't snatched for minor roles.
    // Compute demand before any assignment this week (all members available).
    const weeksLeft = WEEKS - week + 1;
    const roleDemand = {};
    for (const role of ROLES) {
      roleDemand[role] = membersWithTargets.reduce((s, m) => s + (m.remaining[role] || 0), 0);
    }
    const roleOrder = [...ROLES].sort((a, b) => roleDemand[b] - roleDemand[a]);

    for (const role of roleOrder) {
      const chosen = pickMember(role, week, weeksLeft, membersWithTargets, assignedThisWeek, lastWeekAssigned);
      row[role] = chosen.name;
      chosen.remaining[role] = (chosen.remaining[role] || 0) - 1;
      assignedThisWeek.add(chosen.name);
      lastWeekAssigned[chosen.name][role] = week;
    }

    schedule.push(row);
  }

  return { schedule, membersWithTargets };
}

/**
 * Pick the best available member for a role this week.
 * Priority:
 *   1. Has remaining quota and hasn't been assigned this week
 *   2. Urgency = remaining / weeksLeft (ensures targets are met as deadline approaches)
 *   3. Recency tiebreak (avoid back-to-back same role)
 * Fallback: any unassigned member; last resort: any member (multiple roles allowed)
 */
function pickMember(role, week, weeksLeft, members, assignedThisWeek, lastWeekAssigned) {
  const recency = (m) => lastWeekAssigned[m.name][role] || 0;
  const urgency = (m) => ((m.remaining[role] || 0) / weeksLeft);

  const withQuota = members
    .filter((m) => !assignedThisWeek.has(m.name) && (m.remaining[role] || 0) > 0)
    .sort((a, b) => {
      const urgencyDiff = urgency(b) - urgency(a);
      return Math.abs(urgencyDiff) > 0.001 ? urgencyDiff : recency(a) - recency(b);
    });

  if (withQuota.length > 0) return withQuota[0];

  // No one has quota left — pick any unassigned member, least-recent for this role first
  const anyUnassigned = members
    .filter((m) => !assignedThisWeek.has(m.name))
    .sort((a, b) => recency(a) - recency(b));

  if (anyUnassigned.length > 0) return anyUnassigned[0];

  // All members assigned this week — allow a double role, pick least-recent for this role
  return [...members].sort((a, b) => recency(a) - recency(b))[0];
}

function toCSV(schedule) {
  const headers = ['Week', 'Date', ...ROLES];
  const rows = [headers.join(',')];
  for (const row of schedule) {
    const values = [row.week, row.date, ...ROLES.map((r) => `"${row[r] || ''}"`)];
    rows.push(values.join(','));
  }
  return rows.join('\n');
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
    console.error('Usage: node generate-schedule.js --config members.json [--output schedule.csv] [--start-date YYYY-MM-DD]');
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

  const { schedule, membersWithTargets } = generateSchedule(config);
  const csv = toCSV(schedule);

  fs.writeFileSync(opts.output, csv, 'utf8');
  console.log(`\nSchedule written to: ${opts.output}`);
  console.log(`Weeks: ${schedule.length}  |  Members: ${config.members.length}  |  Total role assignments: ${schedule.length * ROLES.length}`);

  printSummary(membersWithTargets, schedule);
}

main();
