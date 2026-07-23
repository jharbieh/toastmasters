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

### Public repository guidance

Before publishing data updates publicly:

1. Run the anonymizer to scrub club-identifying fields where appropriate.
2. Review changed CSV files for direct personal identifiers (emails, phone numbers, addresses).
3. Prefer committing anonymized samples for demos and tests.

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

## Scheduler Web App

The repository now includes a dedicated browser-based scheduler at `webapp/scheduler/index.html`.

When served from the `webapp/` folder as site root, it is available at `/scheduler/`.

### Supported admin workflow

1. Enter the club name.
2. Select the first meeting date.
3. Choose an optimization profile:
	- `Standard`: uses the default weighting behavior.
	- `Scale-balanced`: applies the tuned scale profile for larger or more mixed rosters.
4. Enter the total member count.
5. Fill in each member row with:
	- Name
	- Primary goal: `Public Speaking`, `Leadership`, or `Both`
	- Optional Pathways track
6. Generate the schedule.
7. Review the preview and download:
	- Schedule CSV
	- Source JSON config

### Goal mapping used by the UI

- `Public Speaking` -> `public_speaker`
- `Leadership` -> `leader`
- `Both` -> `balanced`

### Notes on implementation

- The `/scheduler/` app is fully client-side.
- It reuses the same scheduling logic as the CLI generator through `webapp/scheduler/scheduler-core.js`.
- The main companion app links to the builder from the dashboard and primary navigation.
- The service worker pre-caches the scheduler shell so the route behaves like a first-class part of the web app.

### Roadmap

- Add roster import from CSV or prior JSON config.
- Add editable per-goal weight tuning in the browser UI.
- Add a conflict/availability layer for members who cannot serve on certain weeks.
- Add a printable meeting packet view derived from the generated schedule.
- Add saved scheduler sessions and comparison against prior roster versions.
- Add a lightweight validation summary for over- or under-assigned support roles before download.
- Add export formats beyond CSV, such as printable HTML and PDF.
- Add a shareable link or encoded config so an admin can reopen a draft roster later.
- Add member notes or preferences, such as role exclusions or preferred speaking slots.

## New Member Onboarding Web App

The repository now includes a dedicated onboarding guide at `webapp/onboarding/index.html`.

When served from the `webapp/` folder as site root, it is available at `/onboarding/`.

### Purpose

- Provide a polished, chapter-based onboarding experience for new Toastmasters members.
- Give mentors and officers a guided framework to introduce club culture, roles, Pathways, and participation expectations.
- Offer downloadable ebook outputs for offline sharing and mentoring packets.

### Included content chapters

- Overview and onboarding intent
- Toastmasters history and global presence
- Member growth value and benefits
- Meeting roles and active participation
- Pathways levels and project flow
- Club operations and officer engagement
- What makes meetings successful
- Speech contests and Accredited Speaker overview
- A practical 90-day best-practices playbook

### Notes on implementation

- The onboarding app is fully client-side and lives under `webapp/onboarding/`.
- It uses a horizontal slide/chapter interface with keyboard and button navigation.
- It supports ebook downloads in both HTML and Markdown formats.
- The main companion dashboard and sidebar now include direct navigation to the onboarding app.
- The service worker pre-caches onboarding assets for reliable loading and better offline behavior.
