#!/usr/bin/env python3
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "rich-menu"
IMAGE_PATH = OUT_DIR / "azuma-rich-menu.png"
CONFIG_PATH = OUT_DIR / "rich-menu.json"


def load_font(size, weight="regular"):
    candidates = []
    if weight == "semibold":
        candidates.extend(
            [
                "/System/Library/Fonts/STHeiti Medium.ttc",
                "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc",
            ]
        )
    candidates.extend(
        [
            "/System/Library/Fonts/PingFang.ttc",
            "/System/Library/Fonts/STHeiti Light.ttc",
            "/Library/Fonts/Arial Unicode.ttf",
        ]
    )
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def centered_text(draw, box, text, font, fill):
    left, top, right, bottom = box
    bbox = draw.textbbox((0, 0), text, font=font)
    width = bbox[2] - bbox[0]
    height = bbox[3] - bbox[1]
    x = left + ((right - left) - width) / 2
    y = top + ((bottom - top) - height) / 2 - 6
    draw.text((x, y), text, font=font, fill=fill)


def draw_icon_background(draw, center, size, color):
    x, y = center
    radius = size / 2
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)


def draw_calendar_check(draw, center, size, color):
    x, y = center
    w = size
    h = size * 0.9
    left = x - w / 2
    top = y - h / 2
    right = x + w / 2
    bottom = y + h / 2
    stroke = max(8, int(size * 0.08))
    draw.rounded_rectangle((left, top, right, bottom), radius=size * 0.12, outline=color, width=stroke)
    draw.line((left, top + h * 0.28, right, top + h * 0.28), fill=color, width=stroke)
    draw.line((left + w * 0.28, top - h * 0.12, left + w * 0.28, top + h * 0.12), fill=color, width=stroke)
    draw.line((right - w * 0.28, top - h * 0.12, right - w * 0.28, top + h * 0.12), fill=color, width=stroke)
    draw.line(
        (
            left + w * 0.28,
            top + h * 0.62,
            left + w * 0.44,
            top + h * 0.77,
            right - w * 0.24,
            top + h * 0.48,
        ),
        fill=color,
        width=stroke,
        joint="curve",
    )


def draw_calendar_clock(draw, center, size, color):
    x, y = center
    w = size
    h = size * 0.9
    left = x - w / 2
    top = y - h / 2
    right = x + w / 2
    bottom = y + h / 2
    stroke = max(8, int(size * 0.08))
    draw.rounded_rectangle((left, top, right, bottom), radius=size * 0.12, outline=color, width=stroke)
    draw.line((left, top + h * 0.28, right, top + h * 0.28), fill=color, width=stroke)
    draw.line((left + w * 0.28, top - h * 0.12, left + w * 0.28, top + h * 0.12), fill=color, width=stroke)
    draw.line((right - w * 0.28, top - h * 0.12, right - w * 0.28, top + h * 0.12), fill=color, width=stroke)
    cx = left + w * 0.56
    cy = top + h * 0.62
    radius = size * 0.2
    draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), outline=color, width=stroke)
    draw.line((cx, cy, cx, cy - radius * 0.55), fill=color, width=stroke)
    draw.line((cx, cy, cx + radius * 0.48, cy + radius * 0.32), fill=color, width=stroke)


def draw_notebook_pen(draw, center, size, color):
    x, y = center
    w = size * 0.86
    h = size
    left = x - w / 2
    top = y - h / 2
    right = x + w / 2
    bottom = y + h / 2
    stroke = max(8, int(size * 0.08))
    draw.rounded_rectangle((left, top, right, bottom), radius=size * 0.1, outline=color, width=stroke)
    for i in range(3):
        yy = top + h * (0.24 + i * 0.19)
        draw.line((left - w * 0.11, yy, left + w * 0.08, yy), fill=color, width=stroke)
    pen = (
        right - w * 0.38,
        bottom - h * 0.28,
        right - w * 0.06,
        bottom - h * 0.6,
    )
    draw.line(pen, fill=color, width=stroke)
    draw.line((pen[2], pen[3], pen[2] + w * 0.08, pen[3] + h * 0.08), fill=color, width=stroke)


def create_image():
    width, height = 2500, 843
    image = Image.new("RGB", (width, height), "#f8faf8")
    draw = ImageDraw.Draw(image)

    title_font = load_font(64, weight="semibold")
    label_font = load_font(133, weight="semibold")

    draw.rectangle((0, 0, width, 150), fill="#235347")
    centered_text(draw, (0, 0, width, 150), "阿珠媽旅行提醒", title_font, "#ffffff")

    items = [
        ("今日行程", draw_calendar_check),
        ("明日行程", draw_calendar_clock),
        ("旅行記帳本", draw_notebook_pen),
    ]
    colors = ["#eaf4ef", "#fff7df", "#edf2ff"]
    accent = ["#1e6f5c", "#9a6500", "#3451a4"]
    section_top = 150
    section_width = width // 3

    for index, (label, icon_drawer) in enumerate(items):
        left = index * section_width
        right = width if index == 2 else (index + 1) * section_width
        draw.rectangle((left, section_top, right, height), fill=colors[index])
        draw.rectangle((left, section_top, right, section_top + 10), fill=accent[index])
        if index > 0:
            draw.line((left, section_top, left, height), fill="#d0d7de", width=4)
        icon_center = ((left + right) / 2, section_top + 230)
        draw_icon_background(draw, icon_center, 250, accent[index])
        icon_drawer(draw, icon_center, 130, "#ffffff")
        centered_text(draw, (left, section_top + 350, right, section_top + 640), label, label_font, "#1f2933")

    image.save(IMAGE_PATH, format="PNG")


def create_config():
    config = {
        "size": {"width": 2500, "height": 843},
        "selected": True,
        "name": "阿珠媽旅行提醒選單",
        "chatBarText": "阿珠媽選單",
        "areas": [
            {
                "bounds": {"x": 0, "y": 0, "width": 833, "height": 843},
                "action": {"type": "message", "text": "今日行程"},
            },
            {
                "bounds": {"x": 833, "y": 0, "width": 834, "height": 843},
                "action": {"type": "message", "text": "明日行程"},
            },
            {
                "bounds": {"x": 1667, "y": 0, "width": 833, "height": 843},
                "action": {"type": "message", "text": "旅行記帳本"},
            },
        ],
    }
    CONFIG_PATH.write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    create_image()
    create_config()
    print(f"Created {IMAGE_PATH}")
    print(f"Created {CONFIG_PATH}")


if __name__ == "__main__":
    main()
