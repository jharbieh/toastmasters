import argparse
import csv
from pathlib import Path


def read_csv(path: Path):
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def write_csv(path: Path, rows):
    if not rows:
        return
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def anonymize(clubs_path: Path, d106_path: Path, start_id: int = 900000):
    clubs_rows = read_csv(clubs_path)
    d106_rows = read_csv(d106_path)

    club_ids = []
    seen_ids = set()

    for row in clubs_rows:
        cid = (row.get("ID") or "").strip()
        if cid and cid not in seen_ids:
            seen_ids.add(cid)
            club_ids.append(cid)

    for row in d106_rows:
        cid = (row.get("Club") or "").strip()
        if cid and cid not in seen_ids:
            seen_ids.add(cid)
            club_ids.append(cid)

    id_map = {cid: str(start_id + i + 1) for i, cid in enumerate(club_ids)}
    name_map = {cid: f"Club {i + 1:03d}" for i, cid in enumerate(club_ids)}

    locations = []
    seen_locs = set()

    for row in clubs_rows:
        loc = (row.get("Location") or "").strip()
        if loc and loc not in seen_locs:
            seen_locs.add(loc)
            locations.append(loc)

    for row in d106_rows:
        loc = (row.get("City") or "").strip()
        if loc and loc not in seen_locs:
            seen_locs.add(loc)
            locations.append(loc)

    loc_map = {loc: f"Location {i + 1:03d}" for i, loc in enumerate(locations)}

    for row in clubs_rows:
        old_id = (row.get("ID") or "").strip()
        if old_id in id_map:
            row["ID"] = id_map[old_id]
            row["Name"] = name_map[old_id]

        old_loc = (row.get("Location") or "").strip()
        if old_loc in loc_map:
            row["Location"] = loc_map[old_loc]

    related_id_columns = ["Awards", "DCPHistory", "DCPReport", "Clubinfo"]
    for row in d106_rows:
        old_id = (row.get("Club") or "").strip()
        if old_id in id_map:
            row["Club"] = id_map[old_id]
            row["Clubname"] = name_map[old_id]

        old_city = (row.get("City") or "").strip()
        if old_city in loc_map:
            row["City"] = loc_map[old_city]

        for col in related_id_columns:
            val = (row.get(col) or "").strip()
            if val in id_map:
                row[col] = id_map[val]

    write_csv(clubs_path, clubs_rows)
    write_csv(d106_path, d106_rows)

    print(f"Anonymized clubs.csv rows: {len(clubs_rows)}")
    print(f"Anonymized d106.csv rows: {len(d106_rows)}")
    print(f"Mapped club IDs: {len(id_map)}")
    print(f"Mapped locations: {len(loc_map)}")


def build_parser():
    parser = argparse.ArgumentParser(
        description="Anonymize club identifiers, names, and locations in Toastmasters CSV files."
    )
    parser.add_argument("--clubs", default="data/clubs.csv", help="Path to clubs.csv")
    parser.add_argument("--d106", default="data/d106.csv", help="Path to d106.csv")
    parser.add_argument(
        "--start-id",
        type=int,
        default=900000,
        help="Starting integer used to generate anonymized club IDs",
    )
    return parser


def main():
    args = build_parser().parse_args()
    anonymize(Path(args.clubs), Path(args.d106), start_id=args.start_id)


if __name__ == "__main__":
    main()
