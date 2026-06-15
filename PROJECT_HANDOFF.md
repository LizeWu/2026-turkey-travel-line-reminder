# Project Handoff

## Current Status

- GitHub repo: `https://github.com/LizeWu/2026-turkey-travel-line-reminder`
- Date of latest handoff update: 2026-06-14.
- The initial project has already been pushed to GitHub.
- The trip PDF has been converted into structured reminder data.
- The 12-day LINE message preview has been generated and confirmed by the user.
- LINE setup is complete.
- Manual GitHub Actions push tests succeeded for Day 2, Day 3, and Day 8.
- Weather forecast integration has been added for scheduled itinerary pushes and Rich Menu itinerary replies.
- Cloudflare Worker webhook is deployed.
- Cloudflare D1 database `lize-tour-accounting` is created and bound to the Worker as `ACCOUNTING_DB`.
- D1 table `expenses` has been created and confirmed visible with `/tables`.
- LINE Login channel `阿珠媽旅行記帳本` has been created under provider `LizeTourBot`.
- LIFF app for the accounting book has been created.
- Worker variables are set:
  - `LINE_LIFF_ID`
  - `TRIP_ID=2026-05-turkey`
- Rich Menu `旅行記帳本` has been changed from a text-message action to a LIFF URL action.
- The LIFF accounting page opens successfully on the user's phone.
- The accounting book has been refined into three LIFF tabs: `我要記帳`, `消費項目`, and `統計`.
- The accounting book now supports manual expense entry with a custom date picker, item grouping, edit/delete icon actions, and currency statistics.
- AI photo recognition was removed from the accounting book; the Worker code no longer uses `OPENAI_API_KEY`.
- The LINE Official Account add-friend URL and QR sharing card are ready:
  - Add-friend URL: `https://lin.ee/tqlXqAmN`
  - Sharing card: `generated/share-card/azuma-line-share-card.png`
- Cross-device continuation is now documented:
  - `docs/ai-development-sop.md`
  - `docs/multi-device-continuation.md`
  - `.env.example`

## Confirmed Product Decisions

- Notification channel: LINE.
- Recipient: only the user.
- Runtime: GitHub Actions, because the user's Mac may be powered off.
- Timezone behavior: automatic per itinerary day.
  - Taiwan days use `Asia/Taipei`.
  - Turkey travel days use `Europe/Istanbul`.
- Default send time: 20:00 local time on the previous day.
- The reminder sends the next day's itinerary.
- Timezone behavior for previous-night reminders:
  - Day 1 uses `Asia/Taipei` on 2026-05-17 at 20:00.
  - Day 2 uses Day 1's timezone, `Asia/Taipei`, on 2026-05-18 at 20:00.
  - Day 3 onward uses the previous itinerary day's timezone.
- GitHub Actions runs two UTC schedules so it can cover Taiwan and Turkey local 20:00:
  - `12:00 UTC` covers `20:00 Asia/Taipei`.
  - `17:00 UTC` covers `20:00 Europe/Istanbul`.
- The sender script accepts a 2-hour local delivery window from 20:00 to 21:59 to tolerate GitHub Actions schedule delays.
- Reminder type: daily itinerary reminder.
- Morning greeting is enabled during travel dates.
  - Default send time: 06:30 local time on the itinerary day.
  - `22:30 UTC` covers `06:30 Asia/Taipei`.
  - `03:30 UTC` covers `06:30 Europe/Istanbul`.
- Daily reminder does not include departure time.
  - The user may later input departure time through LINE, but this is not implemented yet.
- Dietary preferences and Morning Call are not included.
- The user confirmed participation in the hot air balloon activity.
- The user wants a Rich Menu in the future with:
  - 今日行程
  - 明日行程
  - 旅行記帳本
- Current Rich Menu title:
  - `手機、護照、皮包、鑰匙、信用卡✧( •˓◞•̀ )`

## Confirmed Daily LINE Format

Each daily reminder should include:

- Date and day number.
- Today's route.
- Today's sights.
- Today's activities.
- Driving time.
- Meals.
- Hotel.
- Notes, only when useful.

LINE Flex Message buttons:

- Hotels should show the hotel name and an `Open Google Maps` button.
- Sights should show an `Open Google Maps` button only when there is a clear Google Maps match.
- If a sight is vague, generic, or likely to point to the wrong place, do not force a Google Maps button.

## Important Map-Link Rule

Do not add a Google Maps button just for visual consistency.

Use a button only when the target is clear enough. Examples already treated as uncertain:

- `獵人谷`: no map button for now.
- `古驛站`: no map button for now.

## Current Files

- `config.json`
  - Points to the active trip data file and generated-output directory.
- `trips/2026-05-turkey.json`
  - Active trip source itinerary data used by the sender script.
- `generated/line_flex_messages.json`
  - Generated LINE Flex Message payloads.
- `generated/line_message_previews.md`
  - Human-readable preview for all 12 days.
- `generated/share-card/azuma-line-share-card.png`
  - Shareable card for adding `阿珠媽旅行提醒` as a LINE friend.
- `WORKLOG.md`
  - Consolidated worklog, sorted by date descending.
- `docs/ai-development-sop.md`
  - Shared AI/human development SOP for safe continuation across computers and Codex threads.
- `docs/multi-device-continuation.md`
  - Home/office continuation guide, shareable settings rules, and Codex project data guidance.
- `.env.example`
  - Safe variable-name template for local setup and platform secrets.
- `send_line_reminder.py`
  - Builds previews and sends LINE push messages.
  - Supports `--mode itinerary` and `--mode greeting`.
- `docs/rich-menu-webhook.md`
  - Rich Menu and webhook design notes.
- `webhook/cloudflare-worker/`
  - Cloudflare Worker for interactive Rich Menu replies, LIFF accounting page, and accounting APIs.
- `tools/build_webhook_data.py`
  - Generates `webhook/cloudflare-worker/src/trip-data.js` from the active trip and generated Flex messages.
- `webhook/cloudflare-worker/src/accounting-page.js`
  - LIFF accounting page with `我要記帳`, `消費項目`, and `統計`.
- `webhook/cloudflare-worker/migrations/0001_create_expenses.sql`
  - Cloudflare D1 `expenses` table schema.
- `docs/liff-accounting-setup.md`
  - Setup notes for D1, LIFF, and Rich Menu URL action.
- `.github/workflows/send-travel-reminder.yml`
  - GitHub Actions schedule for previous-night itinerary reminders.
- `.github/workflows/send-morning-greeting.yml`
  - GitHub Actions schedule for travel-period morning greetings.

Ignored local analysis files:

- `extracted_travel_pdf.txt`
- `travel_data_draft.json`
- `travel_reminder_format_draft.md`

## Verification Already Done

These commands were run successfully:

```bash
python send_line_reminder.py --build
python send_line_reminder.py --day 3 --dry-run
python send_line_reminder.py --day 8 --dry-run
python send_line_reminder.py --mode greeting --day 3 --dry-run
node --check webhook/cloudflare-worker/src/index.js
node --check webhook/cloudflare-worker/src/accounting-page.js
```

The Python script was also syntax-checked successfully with:

```bash
PYTHONPYCACHEPREFIX=.pycache python3 -m py_compile send_line_reminder.py
```

Manual production checks completed:

- GitHub Actions manual Day 3 itinerary send showed weather and itinerary.
- LINE Rich Menu `今日行程` / `明日行程` webhook replies work.
- Cloudflare Worker `/accounting` opens the accounting page.
- LIFF accounting page can create, list, edit, and delete expenses.
- LINE group LIFF accounting flow has been tested and confirmed OK.
- Custom split amounts, per-expense settlements, and the adjusted expense/split/settlement layouts have been tested and confirmed OK. The settlement list no longer provides pending/settled toggle buttons.
- Personal expenses opened from LINE groups are scoped per group or room, so A/B/C groups do not share `我的消費`; one-on-one personal use still uses the user personal ledger.
- The accounting page groups expenses by date or currency.
- Currency statistics render as expandable cards.
- LINE add-friend QR code in `generated/share-card/azuma-line-share-card.png` scans correctly.

## Next Steps

1. Keep GitHub Actions enabled.
2. Third phase, later: strengthen LINE id token verification, revoke access after leaving a LINE group, and retest scheduled reminder workflow restore/save behavior for `.sent-reminders/reminders.json`.
3. Later, after confirmation: rename the project/repo from `2026-turkey-travel-line-reminder` to `azuma-papago`, then update local git remote, README, LizeNext, and related docs.
4. The previously considered `統計 > 團體消費 > 幣別淨額` block has been canceled and should not be treated as a pending task.
5. Do not delete these GitHub repository secrets:
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_USER_ID`
6. Do not delete these Cloudflare Worker bindings/variables:
   - `ACCOUNTING_DB`
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_CHANNEL_SECRET`
   - `LINE_LIFF_ID`
   - `TRIP_ID`
7. Do not rotate the LINE Channel access token unless GitHub Secrets and Cloudflare Worker secrets are updated afterward.
8. If a reminder does not arrive, check the latest `Send travel reminder` workflow run.

## Future Features

### Rich Menu

Requested Rich Menu buttons:

- 今日行程
- 明日行程
- 旅行記帳本

No extra Rich Menu buttons:

- 全部行程
- 飯店地圖
- 說明

Important implementation note:

- A Rich Menu can be created in LINE Official Account Manager or through the Messaging API.
- If buttons should trigger dynamic replies such as today's itinerary, tomorrow's itinerary, or accounting flows, the project needs a webhook endpoint.
- The current GitHub Actions setup can push scheduled messages, but it cannot receive instant LINE webhook events.

Likely next architecture:

- Keep GitHub Actions for scheduled push messages.
- Add a small webhook service for interactive Rich Menu replies.
- Cloudflare Worker scaffold has been added under `webhook/cloudflare-worker/`.
- The webhook replies to:
  - `今日行程`
  - `明日行程`
  - `旅行記帳本`
- `旅行記帳本` currently returns a placeholder until the accounting feature is designed.
- `旅行記帳本` now opens the LIFF accounting page through a Rich Menu URI action.

### Weather Forecast

Weather has been added to daily itinerary messages as a live external data feature.

Recommended source for this private/non-commercial project:

- Open-Meteo Weather Forecast API
  - No API key required.
  - Supports global forecast data.
  - Suitable for private/non-commercial use.

Implementation approach:

- Each itinerary day now has `weather_location` with `name`, `latitude`, and `longitude`.
- At send time, `send_line_reminder.py` fetches forecast data for that date and location.
- The Cloudflare Worker also fetches weather when replying to `今日行程` or `明日行程`.
- Include a compact line in the itinerary, such as:
  - `天氣：晴時多雲，15-24°C，降雨機率 20%`
- If the weather API fails, the itinerary still sends without the weather block.

### Travel Accounting Book

The travel accounting book is implemented as a LIFF web page opened from Rich Menu.

Current LIFF design:

- Input style: LIFF web form opened from Rich Menu.
- Tabs: `我要記帳`, `消費項目`, `統計`.
- Supported actions: add expense, edit/delete any listed expense, group expense items by date or currency, show expandable currency statistics.
- The add form has a custom date picker with today's date as the default.
- Currencies shown to the user: 里拉, 台幣, 歐元, 美金.
- Internal currency codes: TRY, TWD, EUR, USD.
- Fields: trip id, date, amount, currency code, currency label, currency symbol, category, note, payer id, payer name, chat type, chat id, created/updated/deleted time.
- Recommended storage: Cloudflare D1, because the user's Mac may be off and the webhook is already on Cloudflare.
- Output: expense item list, date/currency grouping, and currency total cards with expandable item details.
- Full design notes: `docs/accounting-book.md`.
- Setup notes: `docs/liff-accounting-setup.md`.

Not in the first version:

- Auto exchange-rate conversion.
- Split bills.
- Receipt/photo AI recognition.
- CSV export.

Decision made on 2026-05-16:

- AI photo recognition was removed.
- Users enter expense text manually.
- `OPENAI_API_KEY` is no longer used by the Worker code.

### Multi-Trip Management

The project now uses a multi-trip structure:

- `config.json` selects the active trip.
- `trips/2026-05-turkey.json` stores the current Turkey trip.
- Future trips should be added as separate JSON files, for example:
  - `trips/2026-06-wakayama.json`
  - `trips/2027-xx-example.json`
- Generated previews and LINE payloads go under `generated/`.

To switch trips later, update `config.json`:

```json
{
  "active_trip": "trips/2026-06-wakayama.json",
  "generated_dir": "generated"
}
```

## Resume Prompt For A New Codex Chat

If continuing in a new Codex conversation, paste this:

```text
請接續 2026-turkey-travel-line-reminder 專案。
GitHub repo: https://github.com/LizeWu/2026-turkey-travel-line-reminder
請先讀取 PROJECT_HANDOFF.md、FILE_INDEX.md、WORKLOG.md、docs/accounting-book.md、docs/liff-accounting-setup.md。
已完成：旅行資料 JSON、LINE Flex Message、12 天預覽、GitHub Actions、LINE Official Account、Cloudflare Worker webhook、Rich Menu、Open-Meteo 天氣、Cloudflare D1、LINE Login channel、LIFF 記帳本。
目前已測試成功：GitHub Actions Day 3 推播含天氣、Rich Menu 今日/明日行程、LIFF 記帳本頁面開啟、手動記帳、消費項目分組、修改/刪除 icon、幣別統計卡片、LINE 加好友 QR 小卡、LINE 群組 LIFF 記帳流程、指定金額分攤、逐筆結算與調整後的記帳統計排版。結算清單目前不提供待結清/已結清切換。
目前決策：原規劃新增的 `統計 > 團體消費 > 幣別淨額` 區塊已取消，不再作為待辦。
下一步：第三階段再處理 LINE id token 強驗證、離開群組後撤權、行程提醒 workflow restore/save 復測；repo rename 暫緩，之後確認時再改為 `azuma-papago`。
請用簡明步驟帶我操作。
```
