#!/usr/bin/env python3
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RICH_MENU_DIR = ROOT / "rich-menu"
CONFIG_PATH = RICH_MENU_DIR / "rich-menu.json"
IMAGE_PATH = RICH_MENU_DIR / "azuma-rich-menu.png"


def line_request(url, token, method="POST", data=None, content_type="application/json"):
    headers = {"Authorization": f"Bearer {token}"}
    if content_type:
        headers["Content-Type"] = content_type
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read().decode("utf-8")
            return response.status, body
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"LINE API failed: HTTP {exc.code} {exc.reason}\n{detail}") from exc


def main():
    token = os.environ.get("LINE_CHANNEL_ACCESS_TOKEN")
    if not token:
        print("Missing LINE_CHANNEL_ACCESS_TOKEN", file=sys.stderr)
        return 1

    config = CONFIG_PATH.read_bytes()
    status, body = line_request(
        "https://api.line.me/v2/bot/richmenu",
        token,
        data=config,
        content_type="application/json",
    )
    rich_menu_id = json.loads(body)["richMenuId"]
    print(f"Created rich menu: {rich_menu_id}")

    line_request(
        f"https://api-data.line.me/v2/bot/richmenu/{rich_menu_id}/content",
        token,
        data=IMAGE_PATH.read_bytes(),
        content_type="image/png",
    )
    print("Uploaded rich menu image")

    line_request(
        f"https://api.line.me/v2/bot/user/all/richmenu/{rich_menu_id}",
        token,
        method="POST",
        data=b"",
        content_type=None,
    )
    print("Set rich menu as default")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
