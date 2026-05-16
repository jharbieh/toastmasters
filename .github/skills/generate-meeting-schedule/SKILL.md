---
name: generate-meeting-schedule
description: "Generate a 12-month Toastmasters club meeting role schedule in CSV format. Use when scheduling members for weekly meeting roles (Toastmaster, Speaker, Evaluator, General Evaluator, Table Topics Master, Grammarian, Timer, Ah Counter, Word of the Day Master) based on member goals and weighted role distribution across 52 weeks."
argument-hint: "Provide member names, goals (public_speaker, leader, communicator, balanced), and optional start date."
user-invocable: true
---

# Generate Meeting Schedule

Produces a 52-week Toastmasters meeting role schedule in CSV format, distributing all 9 meeting roles across club members according to each member's personal development goals.

## When to Use
- Setting up a new club's annual schedule
- Re-generating a schedule with updated membership or goals
- Experimenting with different weight profiles to optimize member growth

## The 9 Meeting Roles
See [roles reference](./references/roles.md) for full descriptions and goal alignment scores.

| Role | Category |
|------|----------|
| Toastmaster | Leadership + Speaking |
| General Evaluator | Leadership + Critical Thinking |
| Table Topics Master | Leadership + Facilitation |
| Evaluator | Critical Thinking + Feedback |
| Speaker | Public Speaking |
| Grammarian | Language + Vocabulary |
| Word of the Day Master | Language + Vocabulary |
| Timer | Support + Organization |
| Ah Counter | Support + Listening |

## Goal Types and Default Weights
See [weights reference](./references/weights.md) for full weight tables per goal type.

| Goal | Primary Roles Favored |
|------|-----------------------|
| `public_speaker` | Speaker, Toastmaster, Table Topics Master |
| `leader` | Toastmaster, General Evaluator, Table Topics Master |
| `communicator` | Speaker, Evaluator, Grammarian, Table Topics Master |
| `balanced` | Equal rotation across all roles |

## Procedure

### 1. Prepare `members.json`
Create a config file with this schema:
```json
{
  "start_date": "YYYY-MM-DD",
  "members": [
    { "name": "Alice", "goal": "public_speaker", "pathway": "Confident Voice" },
    { "name": "Bob",   "goal": "leader",         "pathway": "Dynamic Leadership" }
  ],
  "weights": {
    "public_speaker": {
      "Speaker": 35, "Toastmaster": 20, "Table Topics Master": 15,
      "Evaluator": 10, "General Evaluator": 5, "Grammarian": 5,
      "Word of the Day Master": 5, "Timer": 3, "Ah Counter": 2
    }
  }
}
```
The `weights` block is optional — omit it to use built-in defaults.
See [assets/members-example.json](./assets/members-example.json) for a complete example.

### 2. Run the Generator
```bash
node .github/skills/generate-meeting-schedule/scripts/generate-schedule.js \
  --config members.json \
  --output schedule.csv
```

Optional flags:
- `--start-date YYYY-MM-DD` — override start date from config
- `--output <path>` — output CSV path (default: `schedule.csv`)

### 3. Review the Summary
The script prints a per-member role count summary to stdout. Verify that:
- Each member's top roles match their stated goal
- No member has a role count of 0 for a role with non-zero weight
- Consecutive same-role assignments for a member are minimal

### 4. CSV Output Schema
```
Week,Date,Toastmaster,General Evaluator,Table Topics Master,Grammarian,Timer,Speaker,Evaluator,Ah Counter,Word of the Day Master
1,2025-01-05,Alice,Bob,Carol,...
```

## Algorithm Summary
1. Total slots = 52 weeks × 9 roles = 468 assignments
2. Each member's share ≈ 468 ÷ number of members
3. Member share is split across roles by their goal's weight profile
4. Each week, roles are filled greedily: pick the member with the most remaining quota for that role, who hasn't been assigned yet that week, and who did that role least recently
5. Ties broken by recency (avoid back-to-back same role)

## Pathways Alignment
See [pathways reference](./references/pathways.md) for how each Pathway maps to a recommended goal type.
