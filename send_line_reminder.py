#!/usr/bin/env python3
import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "config.json"


def load_config():
    with CONFIG_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def resolve_project_path(path):
    return (ROOT / path).resolve()


def load_data(config):
    data_path = resolve_project_path(config["active_trip"])
    with data_path.open(encoding="utf-8") as f:
        return json.load(f)


def generated_paths(config):
    generated_dir = resolve_project_path(config.get("generated_dir", "generated"))
    generated_dir.mkdir(parents=True, exist_ok=True)
    return (
        generated_dir / "line_flex_messages.json",
        generated_dir / "line_message_previews.md",
    )


def text_block(text, size="sm", weight=None, wrap=True):
    block = {"type": "text", "text": text, "size": size, "wrap": wrap}
    if weight:
        block["weight"] = weight
    return block


def button(label, uri):
    return {
        "type": "button",
        "style": "link",
        "height": "sm",
        "action": {"type": "uri", "label": label, "uri": uri},
    }


def section(title, items):
    contents = [text_block(title, "sm", "bold")]
    if items:
        contents.extend(items)
    else:
        contents.append(text_block("無", "sm"))
    return {"type": "box", "layout": "vertical", "spacing": "xs", "contents": contents}


def build_flex(day):
    body = [
        text_block(f"Day {day['day']} / {day['date']} ({day['weekday']})", "md", "bold"),
        text_block(day["route"], "lg", "bold"),
        {"type": "separator", "margin": "md"},
    ]

    sight_items = []
    for index, sight in enumerate(day.get("sights", []), start=1):
        sight_items.append(text_block(f"{index}. {sight['name']}"))
        if sight.get("google_maps_url"):
            sight_items.append(button("開啟 Google Maps", sight["google_maps_url"]))
    body.append(section("今日景點", sight_items))

    activities = [text_block(f"{i}. {name}") for i, name in enumerate(day.get("activities", []), start=1)]
    body.append(section("今日活動", activities))

    driving = []
    for i, segment in enumerate(day.get("driving_time", []), start=1):
        driving.append(
            text_block(
                f"{i}. {segment['from']} → {segment['to']}：{segment['distance_km']} KM，約 {segment['duration']}"
            )
        )
    body.append(section("拉車時間", driving))

    meals = day["meals"]
    body.append(
        section(
            "餐食",
            [
                text_block(f"早餐：{meals['breakfast']}"),
                text_block(f"午餐：{meals['lunch']}"),
                text_block(f"晚餐：{meals['dinner']}"),
            ],
        )
    )

    hotel = day.get("hotel", {})
    hotel_items = [text_block(hotel.get("name", "無"))]
    if hotel.get("google_maps_url"):
        hotel_items.append(button("開啟 Google Maps", hotel["google_maps_url"]))
    body.append(section("住宿", hotel_items))

    notes = [text_block(note) for note in day.get("notes", [])]
    if notes:
        body.append(section("備註", notes))

    return {
        "type": "flex",
        "altText": f"土耳其旅行提醒 Day {day['day']} / {day['date']}",
        "contents": {
            "type": "bubble",
            "size": "mega",
            "body": {"type": "box", "layout": "vertical", "spacing": "md", "contents": body},
        },
    }


def build_preview(day):
    lines = [
        f"[土耳其旅行提醒] Day {day['day']} / {day['date']} ({day['weekday']})",
        "",
        "今日路線：",
        day["route"],
        "",
        "今日景點：",
    ]
    if day.get("sights"):
        for i, sight in enumerate(day["sights"], start=1):
            lines.append(f"{i}. {sight['name']}")
            if sight.get("google_maps_url"):
                lines.append("   [開啟 Google Maps]")
    else:
        lines.append("無")

    lines.extend(["", "今日活動："])
    if day.get("activities"):
        lines.extend(f"{i}. {item}" for i, item in enumerate(day["activities"], start=1))
    else:
        lines.append("無")

    lines.extend(["", "拉車時間："])
    if day.get("driving_time"):
        for i, seg in enumerate(day["driving_time"], start=1):
            lines.append(f"{i}. {seg['from']} → {seg['to']}：{seg['distance_km']} KM，約 {seg['duration']}")
    else:
        lines.append("無")

    meals = day["meals"]
    lines.extend(
        [
            "",
            "餐食：",
            f"早餐：{meals['breakfast']}",
            f"午餐：{meals['lunch']}",
            f"晚餐：{meals['dinner']}",
            "",
            "住宿：",
            day.get("hotel", {}).get("name", "無"),
        ]
    )
    if day.get("hotel", {}).get("google_maps_url"):
        lines.append("[開啟 Google Maps]")

    if day.get("notes"):
        lines.extend(["", "備註：", "；".join(day["notes"])])
    return "\n".join(lines)


def generate_outputs(data, config):
    flex_path, preview_path = generated_paths(config)
    messages = {str(day["day"]): build_flex(day) for day in data["daily_itinerary"]}
    flex_path.write_text(json.dumps(messages, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    previews = ["# LINE 每日提醒預覽", ""]
    for day in data["daily_itinerary"]:
        previews.extend([f"## Day {day['day']}", "", "```text", build_preview(day), "```", ""])
    preview_path.write_text("\n".join(previews), encoding="utf-8")
    return messages


def build_greeting(day, now):
    return {
        "type": "text",
        "text": (
            f"早安，今天是 {day['date'].replace('-', '/')}（{day['weekday']}） "
            f"{now.strftime('%H:%M')}\n"
            f"阿珠媽提醒你：今天是土耳其之旅 Day {day['day']}。"
        ),
    }


def is_time_window(now, send_time_local, window_minutes=120):
    hour, minute = [int(part) for part in send_time_local.split(":", 1)]
    target_minutes = hour * 60 + minute
    now_minutes = now.time().hour * 60 + now.time().minute
    return target_minutes <= now_minutes < target_minutes + window_minutes


def is_due(day, reminder_timezone, send_time_local, send_days_before):
    now = datetime.now(ZoneInfo(reminder_timezone))
    reminder_date = (
        datetime.fromisoformat(day["date"]).date() - timedelta(days=send_days_before)
    ).isoformat()
    return now.date().isoformat() == reminder_date and is_time_window(now, send_time_local)


def reminder_timezone_for_day(itinerary, index):
    if index > 0:
        return itinerary[index - 1]["timezone"]
    return itinerary[index]["timezone"]


def select_day(data, day=None, date=None):
    if day is not None:
        return next((item for item in data["daily_itinerary"] if item["day"] == day), None)
    if date is not None:
        return next((item for item in data["daily_itinerary"] if item["date"] == date), None)

    notification = data["trip"]["notification"]
    send_time_local = notification["send_time_local"]
    send_days_before = int(notification.get("send_days_before", 0))
    today_candidates = []
    itinerary = data["daily_itinerary"]
    for index, item in enumerate(itinerary):
        reminder_timezone = reminder_timezone_for_day(itinerary, index)
        if is_due(item, reminder_timezone, send_time_local, send_days_before):
            today_candidates.append(item)
    return today_candidates[0] if today_candidates else None


def select_greeting_day(data, day=None, date=None):
    if day is not None:
        return next((item for item in data["daily_itinerary"] if item["day"] == day), None)
    if date is not None:
        return next((item for item in data["daily_itinerary"] if item["date"] == date), None)

    send_time_local = data["trip"]["notification"]["morning_greeting_time_local"]
    for item in data["daily_itinerary"]:
        now = datetime.now(ZoneInfo(item["timezone"]))
        if now.date().isoformat() == item["date"] and is_time_window(now, send_time_local):
            return item
    return None


def send_line(message):
    token = os.environ.get("LINE_CHANNEL_ACCESS_TOKEN")
    user_id = os.environ.get("LINE_USER_ID")
    if not token or not user_id:
        raise RuntimeError("Missing LINE_CHANNEL_ACCESS_TOKEN or LINE_USER_ID")

    payload = json.dumps({"to": user_id, "messages": [message]}, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        "https://api.line.me/v2/bot/message/push",
        data=payload,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.status, response.read().decode("utf-8")


def main():
    parser = argparse.ArgumentParser(description="Build or send Turkey trip LINE reminders.")
    parser.add_argument("--build", action="store_true", help="Generate line_flex_messages.json and previews.")
    parser.add_argument("--dry-run", action="store_true", help="Print selected message preview without sending.")
    parser.add_argument(
        "--mode",
        choices=["itinerary", "greeting"],
        default="itinerary",
        help="Message mode to send or preview.",
    )
    parser.add_argument("--day", type=int, help="Send or preview a specific day number.")
    parser.add_argument("--date", help="Send or preview a specific date in YYYY-MM-DD.")
    args = parser.parse_args()

    config = load_config()
    data = load_data(config)
    messages = generate_outputs(data, config)
    if args.build:
        flex_path, preview_path = generated_paths(config)
        print(f"Generated {flex_path} and {preview_path}")
        return 0

    if args.mode == "greeting":
        selected = select_greeting_day(data, args.day, args.date)
    else:
        selected = select_day(data, args.day, args.date)
    if not selected:
        print("No itinerary matched today/day/date; nothing to send.")
        return 0

    now = datetime.now(ZoneInfo(selected["timezone"]))
    message = build_greeting(selected, now) if args.mode == "greeting" else messages[str(selected["day"])]
    if args.dry_run:
        print(message["text"] if args.mode == "greeting" else build_preview(selected))
        return 0

    try:
        status, body = send_line(message)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        print(f"LINE send failed: HTTP {exc.code} {exc.reason}", file=sys.stderr)
        print(detail, file=sys.stderr)
        return 1
    except (RuntimeError, urllib.error.URLError) as exc:
        print(f"LINE send failed: {exc}", file=sys.stderr)
        return 1
    print(f"LINE send status: {status} {body}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
