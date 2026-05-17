# Documentation

This folder contains documentation for the Toastmasters project.

## CSV Anonymization Script

Use the anonymization script to replace club-identifying values in the CSV files with consistent placeholder data.

Script location:

`scripts/anonymize_csv.py`

### What it anonymizes

- `data/clubs.csv`
	- `ID` -> synthetic club IDs
	- `Name` -> `Club 001`, `Club 002`, ...
	- `Location` -> `Location 001`, `Location 002`, ...
- `data/d106.csv`
	- `Club` -> same synthetic IDs used in `clubs.csv`
	- `Clubname` -> same synthetic names used in `clubs.csv`
	- `City` -> anonymized location labels
	- `Awards`, `DCPHistory`, `DCPReport`, `Clubinfo` -> remapped to anonymized IDs

### Usage

Run from the repository root:

```powershell
python scripts/anonymize_csv.py
```

Optional arguments:

```powershell
python scripts/anonymize_csv.py --clubs data/clubs.csv --d106 data/d106.csv --start-id 900000
```

Argument details:

- `--clubs`: path to the clubs CSV file (default: `data/clubs.csv`)
- `--d106`: path to the district report CSV file (default: `data/d106.csv`)
- `--start-id`: base integer for generated IDs; first generated ID is `start-id + 1` (default: `900000`)

## Scheduler Work Summary

Recent scheduler improvements focused on quality and scalability for 52-week role planning.

- Added support for a new member setup flow and generated schedules in the `schedule/` folder.
- Expanded testing from 1 member to 9 members and then to 15 members to verify larger-roster behavior.
- Introduced goal-level weight overrides in `data/members.json` to better align assignments with member goals.
- Implemented first-pass support-role over-allocation penalties in the generator.
- Implemented second-pass in-week swap balancing to reduce support-role clustering without breaking one-role-per-member-per-week.
- Added profile-based generation with `--profile scale` for mixed-goal rosters.
- Documented weight precedence and scale-aware tuning guidance in scheduler skill references.
- Validated output shape for scale runs: 52 rows and all 9 role columns present.

Primary scheduler artifacts from this work:

- Generator: `.github/skills/generate-meeting-schedule/scripts/generate-schedule.js`
- Active member config: `data/members.json`
- Scale profile test config: `data/members_profile_scale_test.json`
- Latest scale schedule output: `schedule/starwars_15_schedule_profile_scale.csv`
