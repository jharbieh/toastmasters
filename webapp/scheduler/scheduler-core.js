(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.TMScheduler = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
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

  const SUPPORT_ROLES = ['Timer', 'Ah Counter', 'Word of the Day Master'];
  const WEEKS = 52;

  const OPTIMIZATION = {
    roleSurplusPenalty: 30,
    supportRoleExtraPenalty: 90,
    supportAggregatePenalty: 25,
    supportOverTargetMultiplier: 2.5,
  };

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

  const PROFILE_WEIGHTS = {
    scale: {
      public_speaker: {
        Speaker: 24, Toastmaster: 16, 'Table Topics Master': 12,
        Evaluator: 10, 'General Evaluator': 7, Grammarian: 9,
        'Word of the Day Master': 8, Timer: 7, 'Ah Counter': 7,
      },
      leader: {
        Toastmaster: 20, 'General Evaluator': 18, 'Table Topics Master': 15,
        Evaluator: 13, Speaker: 8, Grammarian: 8,
        'Word of the Day Master': 6, Timer: 6, 'Ah Counter': 6,
      },
      communicator: {
        Speaker: 18, Evaluator: 16, 'Table Topics Master': 12,
        Toastmaster: 10, Grammarian: 12, 'Word of the Day Master': 10,
        'General Evaluator': 8, Timer: 7, 'Ah Counter': 7,
      },
      balanced: {
        Speaker: 14, Toastmaster: 13, 'Table Topics Master': 11,
        'General Evaluator': 11, Evaluator: 11, Grammarian: 10,
        'Word of the Day Master': 10, Timer: 10, 'Ah Counter': 10,
      },
    },
  };

  const GOAL_OPTIONS = [
    { value: 'public_speaker', label: 'Public Speaking' },
    { value: 'leader', label: 'Leadership' },
    { value: 'balanced', label: 'Both' },
  ];

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  function normalizeGoal(goal) {
    const value = String(goal || '').trim().toLowerCase();
    if (!value) return 'balanced';
    if (value === 'public speaking' || value === 'public_speaking' || value === 'public-speaker') return 'public_speaker';
    if (value === 'leadership') return 'leader';
    if (value === 'both') return 'balanced';
    if (value === 'communicator') return 'communicator';
    if (value === 'leader' || value === 'balanced' || value === 'public_speaker') return value;
    return 'balanced';
  }

  function resolveWeights(member, configWeights, profileWeights) {
    if (member.weights) return member.weights;
    if (configWeights && configWeights[member.goal]) return configWeights[member.goal];
    if (profileWeights && profileWeights[member.goal]) return profileWeights[member.goal];
    return DEFAULT_WEIGHTS[member.goal] || DEFAULT_WEIGHTS.balanced;
  }

  function buildTargets(members, configWeights, profileWeights) {
    const totalSlots = WEEKS * ROLES.length;
    const perMember = totalSlots / members.length;
    const roleSupply = WEEKS;

    const withRaw = members.map((member) => {
      const weights = resolveWeights(member, configWeights, profileWeights);
      const weightSum = ROLES.reduce((sum, role) => sum + (weights[role] || 0), 0) || 100;
      const raw = {};
      for (const role of ROLES) {
        raw[role] = ((weights[role] || 0) / weightSum) * perMember;
      }
      return { ...member, raw };
    });

    for (const role of ROLES) {
      const totalDemand = withRaw.reduce((sum, member) => sum + member.raw[role], 0);
      if (totalDemand > roleSupply) {
        const scale = roleSupply / totalDemand;
        withRaw.forEach((member) => {
          member.raw[role] *= scale;
        });
      }
    }

    return withRaw.map((member) => {
      const targets = {};
      for (const role of ROLES) targets[role] = Math.floor(member.raw[role]);

      let memberTotal = Object.values(targets).reduce((sum, value) => sum + value, 0);
      const targetTotal = Math.round(perMember);
      const fractions = [...ROLES].sort((a, b) => {
        const fractionB = member.raw[b] - Math.floor(member.raw[b]);
        const fractionA = member.raw[a] - Math.floor(member.raw[a]);
        return fractionB - fractionA;
      });

      let index = 0;
      while (memberTotal < targetTotal) {
        targets[fractions[index % ROLES.length]] += 1;
        memberTotal += 1;
        index += 1;
      }

      return { ...member, targets, remaining: { ...targets } };
    });
  }

  function createCountsMap(members, schedule) {
    const counts = {};
    for (const member of members) {
      counts[member.name] = {};
      for (const role of ROLES) counts[member.name][role] = 0;
    }

    for (const row of schedule) {
      for (const role of ROLES) {
        const name = row[role];
        if (name && counts[name]) counts[name][role] += 1;
      }
    }

    return counts;
  }

  function absDelta(count, target) {
    return Math.abs((count || 0) - (target || 0));
  }

  function roleDeviationCost(role, count, target) {
    const base = absDelta(count, target);
    if (!SUPPORT_ROLES.includes(role)) return base;
    const over = Math.max(0, (count || 0) - (target || 0));
    return base + (over * OPTIMIZATION.supportOverTargetMultiplier);
  }

  function swapImprovementDelta(row, roleA, roleB, counts, targetsByMember) {
    const memberA = row[roleA];
    const memberB = row[roleB];
    if (!memberA || !memberB || memberA === memberB) return Number.POSITIVE_INFINITY;

    const targetA = targetsByMember[memberA] || {};
    const targetB = targetsByMember[memberB] || {};

    const before =
      roleDeviationCost(roleA, counts[memberA][roleA], targetA[roleA]) +
      roleDeviationCost(roleB, counts[memberA][roleB], targetA[roleB]) +
      roleDeviationCost(roleA, counts[memberB][roleA], targetB[roleA]) +
      roleDeviationCost(roleB, counts[memberB][roleB], targetB[roleB]);

    const after =
      roleDeviationCost(roleA, counts[memberA][roleA] - 1, targetA[roleA]) +
      roleDeviationCost(roleB, counts[memberA][roleB] + 1, targetA[roleB]) +
      roleDeviationCost(roleA, counts[memberB][roleA] + 1, targetB[roleA]) +
      roleDeviationCost(roleB, counts[memberB][roleB] - 1, targetB[roleB]);

    return after - before;
  }

  function applySwap(row, roleA, roleB, counts) {
    const memberA = row[roleA];
    const memberB = row[roleB];

    row[roleA] = memberB;
    row[roleB] = memberA;

    counts[memberA][roleA] -= 1;
    counts[memberA][roleB] += 1;
    counts[memberB][roleA] += 1;
    counts[memberB][roleB] -= 1;
  }

  function memberSupportOverTarget(memberName, counts, targetsByMember) {
    return SUPPORT_ROLES.reduce((sum, role) => {
      const actual = counts[memberName][role] || 0;
      const target = (targetsByMember[memberName] || {})[role] || 0;
      return sum + Math.max(0, actual - target);
    }, 0);
  }

  function swapFairnessGain(row, roleA, roleB, counts, targetsByMember) {
    const memberA = row[roleA];
    const memberB = row[roleB];
    if (!memberA || !memberB || memberA === memberB) return 0;

    const beforeA = memberSupportOverTarget(memberA, counts, targetsByMember);
    const beforeB = memberSupportOverTarget(memberB, counts, targetsByMember);
    const beforeMax = Math.max(beforeA, beforeB);

    const temp = {
      [memberA]: { ...counts[memberA] },
      [memberB]: { ...counts[memberB] },
    };
    temp[memberA][roleA] -= 1;
    temp[memberA][roleB] += 1;
    temp[memberB][roleA] += 1;
    temp[memberB][roleB] -= 1;

    const afterA = SUPPORT_ROLES.reduce((sum, role) => {
      const actual = temp[memberA][role] || 0;
      const target = (targetsByMember[memberA] || {})[role] || 0;
      return sum + Math.max(0, actual - target);
    }, 0);
    const afterB = SUPPORT_ROLES.reduce((sum, role) => {
      const actual = temp[memberB][role] || 0;
      const target = (targetsByMember[memberB] || {})[role] || 0;
      return sum + Math.max(0, actual - target);
    }, 0);

    return beforeMax - Math.max(afterA, afterB);
  }

  function secondPassBalance(schedule, membersWithTargets) {
    const targetsByMember = {};
    for (const member of membersWithTargets) {
      targetsByMember[member.name] = member.targets;
    }

    const counts = createCountsMap(membersWithTargets, schedule);
    let swapsApplied = 0;
    const maxPasses = 4;
    const maxSwaps = WEEKS * 3;

    for (let pass = 0; pass < maxPasses; pass++) {
      let changed = false;

      for (const row of schedule) {
        for (const supportRole of SUPPORT_ROLES) {
          const currentMember = row[supportRole];
          const target = (targetsByMember[currentMember] || {})[supportRole] || 0;
          if ((counts[currentMember][supportRole] || 0) <= target) continue;

          let bestRole = null;
          let bestDelta = 0;
          let bestFairnessGain = 0;

          for (const otherRole of ROLES) {
            if (otherRole === supportRole) continue;
            const delta = swapImprovementDelta(row, supportRole, otherRole, counts, targetsByMember);
            const fairnessGain = swapFairnessGain(row, supportRole, otherRole, counts, targetsByMember);
            if (delta < bestDelta || (delta === bestDelta && fairnessGain > bestFairnessGain)) {
              bestDelta = delta;
              bestRole = otherRole;
              bestFairnessGain = fairnessGain;
            }
          }

          if (bestRole && (bestDelta < 0 || (bestDelta === 0 && bestFairnessGain > 0))) {
            applySwap(row, supportRole, bestRole, counts);
            swapsApplied += 1;
            changed = true;
            if (swapsApplied >= maxSwaps) return swapsApplied;
          }
        }
      }

      if (!changed) break;
    }

    return swapsApplied;
  }

  function pickMember(role, week, weeksLeft, members, assignedThisWeek, lastWeekAssigned) {
    const recency = (member) => lastWeekAssigned[member.name][role] || 0;
    const urgency = (member) => (member.remaining[role] || 0) / weeksLeft;
    const assignedSoFar = (member, currentRole) => (member.targets[currentRole] || 0) - (member.remaining[currentRole] || 0);

    const supportSurplus = (member) => SUPPORT_ROLES.reduce((sum, supportRole) => {
      const assigned = assignedSoFar(member, supportRole);
      const target = member.targets[supportRole] || 0;
      return sum + Math.max(0, assigned - target);
    }, 0);

    const fallbackScore = (member) => {
      const target = member.targets[role] || 0;
      const assigned = assignedSoFar(member, role);
      const roleDeficit = target - assigned;
      const roleSurplusAfter = Math.max(0, (assigned + 1) - target);

      let penalty = roleSurplusAfter * OPTIMIZATION.roleSurplusPenalty;
      if (SUPPORT_ROLES.includes(role)) {
        penalty += roleSurplusAfter * OPTIMIZATION.supportRoleExtraPenalty;
        penalty += supportSurplus(member) * OPTIMIZATION.supportAggregatePenalty;
      }

      return (roleDeficit * 50) - penalty;
    };

    const withQuota = members
      .filter((member) => !assignedThisWeek.has(member.name) && (member.remaining[role] || 0) > 0)
      .sort((a, b) => {
        const urgencyDiff = urgency(b) - urgency(a);
        return Math.abs(urgencyDiff) > 0.001 ? urgencyDiff : recency(a) - recency(b);
      });

    if (withQuota.length > 0) return withQuota[0];

    const anyUnassigned = members
      .filter((member) => !assignedThisWeek.has(member.name))
      .sort((a, b) => {
        const scoreDiff = fallbackScore(b) - fallbackScore(a);
        return Math.abs(scoreDiff) > 0.001 ? scoreDiff : recency(a) - recency(b);
      });

    if (anyUnassigned.length > 0) return anyUnassigned[0];

    return [...members].sort((a, b) => recency(a) - recency(b))[0];
  }

  function generateSchedule(config, opts = {}) {
    const members = (config.members || []).map((member) => ({
      ...member,
      goal: normalizeGoal(member.goal),
    }));
    const configWeights = config.weights;
    const profileWeights = opts.profile ? PROFILE_WEIGHTS[opts.profile] : null;

    if (!members.length) throw new Error('No members provided in config.');
    if (opts.profile && !profileWeights) {
      throw new Error('Unknown profile: ' + opts.profile + '. Supported profiles: ' + Object.keys(PROFILE_WEIGHTS).join(', '));
    }

    const membersWithTargets = buildTargets(members, configWeights, profileWeights);
    const startDate = new Date(config.start_date || new Date().toISOString().split('T')[0]);
    const lastWeekAssigned = {};
    membersWithTargets.forEach((member) => {
      lastWeekAssigned[member.name] = {};
    });

    const schedule = [];

    for (let week = 1; week <= WEEKS; week++) {
      const meetingDate = formatDate(addDays(startDate, (week - 1) * 7));
      const row = { week, date: meetingDate };
      const assignedThisWeek = new Set();
      const weeksLeft = WEEKS - week + 1;
      const roleDemand = {};

      for (const role of ROLES) {
        roleDemand[role] = membersWithTargets.reduce((sum, member) => sum + (member.remaining[role] || 0), 0);
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

    const swapsApplied = secondPassBalance(schedule, membersWithTargets);
    return { schedule, membersWithTargets, swapsApplied };
  }

  function toCSV(schedule) {
    const headers = ['Week', 'Date', ...ROLES];
    const rows = [headers.join(',')];
    for (const row of schedule) {
      const values = [row.week, row.date, ...ROLES.map((role) => '"' + (row[role] || '') + '"')];
      rows.push(values.join(','));
    }
    return rows.join('\n');
  }

  function summarizeAssignments(membersWithTargets, schedule) {
    const counts = createCountsMap(membersWithTargets, schedule);
    return membersWithTargets.map((member) => ({
      name: member.name,
      goal: member.goal,
      pathway: member.pathway || '',
      counts: counts[member.name],
      targets: member.targets,
    }));
  }

  return {
    ROLES,
    SUPPORT_ROLES,
    WEEKS,
    DEFAULT_WEIGHTS,
    PROFILE_WEIGHTS,
    GOAL_OPTIONS,
    normalizeGoal,
    generateSchedule,
    toCSV,
    summarizeAssignments,
  };
});