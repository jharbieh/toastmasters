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
