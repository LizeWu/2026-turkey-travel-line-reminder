# File Index

## Start Here

| File | 用途 |
| --- | --- |
| `README.md` | 專案總覽、基本指令，以及必要的 GitHub Secrets。 |
| `PROJECT_HANDOFF.md` | 目前決策、已完成設定、下一步，以及接續開發備忘。 |
| `LizeNext.md` | 如果開新 Codex 對話或上下文遺失，可貼上的簡短接續提示。 |

## Core Reminder Files

| File | 用途 |
| --- | --- |
| `config.json` | 指定目前啟用中的旅程資料檔，以及生成檔案輸出資料夾。 |
| `trips/2026-05-turkey.json` | 目前啟用中的土耳其旅程資料庫：日期、路線、景點、活動、拉車時間、餐食、飯店、地圖連結與通知設定。 |
| `send_line_reminder.py` | 主要腳本：產生 LINE Flex Message、發送前一晚行程提醒、查詢天氣，以及發送早安訊息。 |
| `generated/line_flex_messages.json` | 已產生的 LINE Flex Message JSON，用於行程提醒。 |
| `generated/line_message_previews.md` | 12 天行程提醒的純文字預覽，方便人工檢查。 |

## GitHub Actions

| File | 用途 |
| --- | --- |
| `.github/workflows/send-travel-reminder.yml` | 在前一日當地時間 20:00 發送隔天完整行程。 |
| `.github/workflows/send-morning-greeting.yml` | 在旅行期間每日當地時間 06:30 發送早安訊息。 |

## Rich Menu / Webhook

| File | 用途 |
| --- | --- |
| `docs/rich-menu-webhook.md` | Rich Menu 與 webhook 的設計、部署步驟與三個按鈕規格。 |
| `docs/weather-forecast.md` | 天氣預報功能說明：資料來源、行程欄位、顯示格式與限制。 |
| `webhook/cloudflare-worker/src/index.js` | Cloudflare Worker webhook 主程式，處理今日行程、明日行程、旅行記帳本指令。 |
| `webhook/cloudflare-worker/src/trip-data.js` | 由目前啟用旅程與 Flex Message 產生的 Worker 內嵌資料。 |
| `webhook/cloudflare-worker/wrangler.toml` | Cloudflare Worker 部署設定。 |
| `webhook/cloudflare-worker/package.json` | Cloudflare Worker 專案指令與依賴設定。 |
| `tools/build_webhook_data.py` | 從 `config.json`、啟用旅程與生成檔案產生 Worker 內嵌資料。 |
| `docs/rich-menu-setup.md` | Rich Menu 圖片、設定檔與建立方式說明。 |
| `rich-menu/azuma-rich-menu.png` | LINE Rich Menu 圖片，含三個按鈕與語意圖示。 |
| `rich-menu/rich-menu.json` | LINE Rich Menu 點擊區域與訊息動作設定。 |
| `tools/create_rich_menu_assets.py` | 產生 Rich Menu 圖片與 JSON 設定。 |
| `tools/create_rich_menu.py` | 透過 LINE API 建立 Rich Menu、上傳圖片並設為預設。 |

## Local Analysis Drafts

這些檔案只供本機分析使用，已被 Git 忽略，不是正式運作必要檔案。

| File | 用途 |
| --- | --- |
| `extracted_travel_pdf.txt` | 從原始旅遊 PDF 抽出的文字，用於分析。 |
| `travel_data_draft.json` | 從 PDF 初步整理出的結構化草稿。 |
| `travel_reminder_format_draft.md` | 早期討論每日提醒格式時使用的草稿。 |

## Config

| File | 用途 |
| --- | --- |
| `.gitignore` | 避免本機暫存檔、快取檔與密鑰被提交到 Git。 |

## Required GitHub Secrets

| Secret | 用途 |
| --- | --- |
| `LINE_CHANNEL_ACCESS_TOKEN` | 讓 GitHub Actions 可以呼叫 LINE Messaging API。 |
| `LINE_USER_ID` | 指定要接收提醒的 LINE 使用者。 |
