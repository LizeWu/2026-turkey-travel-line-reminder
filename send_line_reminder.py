#!/usr/bin/env python3
import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "config.json"

WEATHER_CODES = {
    0: "晴朗",
    1: "大致晴朗",
    2: "局部多雲",
    3: "陰天",
    45: "霧",
    48: "霧凇",
    51: "毛毛雨",
    53: "毛毛雨",
    55: "毛毛雨",
    56: "凍毛毛雨",
    57: "凍毛毛雨",
    61: "小雨",
    63: "中雨",
    65: "大雨",
    66: "凍雨",
    67: "凍雨",
    71: "小雪",
    73: "中雪",
    75: "大雪",
    77: "雪粒",
    80: "陣雨",
    81: "陣雨",
    82: "強陣雨",
    85: "陣雪",
    86: "強陣雪",
    95: "雷雨",
    96: "雷雨",
    99: "強雷雨",
}


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


def weather_summary(day):
    location = day.get("weather_location")
    if not location:
        return None

    params = {
        "latitude": location["latitude"],
        "longitude": location["longitude"],
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        "timezone": day["timezone"],
        "start_date": day["date"],
        "end_date": day["date"],
    }
    url = "https://api.open-meteo.com/v1/forecast?" + urllib.parse.urlencode(params)
    request = urllib.request.Request(url, headers={"User-Agent": "lize-tour-bot/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, KeyError, IndexError):
        return None

    daily = payload.get("daily", {})
    times = daily.get("time", [])
    if day["date"] not in times:
        return None

    index = times.index(day["date"])
    code = daily.get("weather_code", [None])[index]
    temp_min = daily.get("temperature_2m_min", [None])[index]
    temp_max = daily.get("temperature_2m_max", [None])[index]
    rain = daily.get("precipitation_probability_max", [None])[index]

    desc = WEATHER_CODES.get(code, f"天氣代碼 {code}")
    temp_text = "溫度資料暫無" if temp_min is None or temp_max is None else f"{round(temp_min)}-{round(temp_max)}°C"
    rain_text = "降雨機率暫無" if rain is None else f"降雨機率 {round(rain)}%"
    return f"{location['name']}：{desc}，{temp_text}，{rain_text}"


def build_flex(day, weather=None):
    body = [
        text_block(f"Day {day['day']} / {day['date']} ({day['weekday']})", "md", "bold"),
        text_block(day["route"], "lg", "bold"),
        {"type": "separator", "margin": "md"},
    ]

    if weather:
        body.append(section("天氣", [text_block(weather)]))

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


def build_preview(day, weather=None):
    lines = [
        f"[土耳其旅行提醒] Day {day['day']} / {day['date']} ({day['weekday']})",
        "",
        "今日路線：",
        day["route"],
        "",
    ]
    if weather:
        lines.extend(["天氣：", weather, ""])

    lines.append("今日景點：")
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
    weather = None if args.mode == "greeting" else weather_summary(selected)
    message = build_greeting(selected, now) if args.mode == "greeting" else build_flex(selected, weather)
    if args.dry_run:
        print(message["text"] if args.mode == "greeting" else build_preview(selected, weather))
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
