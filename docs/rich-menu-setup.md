# Rich Menu Setup

## Buttons

The Rich Menu contains only three buttons:

- 今日行程
- 明日行程
- 旅行記帳本

The image uses large labels and semantic line icons:

- 今日行程: calendar check icon.
- 明日行程: calendar clock icon.
- 旅行記帳本: notebook pen icon.

Small subtitles are intentionally omitted.

It intentionally does not include:

- 全部行程
- 飯店地圖
- 說明

## Files

| File | Purpose |
| --- | --- |
| `rich-menu/azuma-rich-menu.png` | Rich Menu image. |
| `rich-menu/rich-menu.json` | LINE Rich Menu area/action configuration. |
| `tools/create_rich_menu_assets.py` | Generates the image and JSON config. |
| `tools/create_rich_menu.py` | Creates the Rich Menu through LINE API, uploads the image, and sets it as default. |

## Generate Assets

```bash
/Users/u10a4057/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 tools/create_rich_menu_assets.py
```

## Create Rich Menu

Requires:

```text
LINE_CHANNEL_ACCESS_TOKEN
```

Run:

```bash
LINE_CHANNEL_ACCESS_TOKEN="..." python3 tools/create_rich_menu.py
```

Do not commit the token.
