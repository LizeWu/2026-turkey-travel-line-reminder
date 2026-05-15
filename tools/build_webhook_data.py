#!/usr/bin/env python3
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config.json"


def read_json(path):
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def main():
    config = read_json(CONFIG_PATH)
    trip = read_json(ROOT / config["active_trip"])
    flex_messages = read_json(ROOT / config.get("generated_dir", "generated") / "line_flex_messages.json")

    output = ROOT / "webhook" / "cloudflare-worker" / "src" / "trip-data.js"
    output.write_text(
        "export const ACTIVE_TRIP = "
        + json.dumps(trip, ensure_ascii=False, indent=2)
        + ";\n\nexport const FLEX_MESSAGES = "
        + json.dumps(flex_messages, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(f"Generated {output}")


if __name__ == "__main__":
    main()
