# Project Handoff

## Current Status

- GitHub repo: `https://github.com/LizeWu/2026-turkey-travel-line-reminder`
- The initial project has already been pushed to GitHub.
- The trip PDF has been converted into structured reminder data.
- The 12-day LINE message preview has been generated and confirmed by the user.
- The next major task is LINE setup and GitHub Secrets setup.
- LINE setup is now complete.
- Manual GitHub Actions push tests succeeded for Day 2, Day 3, and Day 8.

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
- `send_line_reminder.py`
  - Builds previews and sends LINE push messages.
  - Supports `--mode itinerary` and `--mode greeting`.
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
```

The Python script was also syntax-checked successfully with:

```bash
PYTHONPYCACHEPREFIX=.pycache python3 -m py_compile send_line_reminder.py
```

## Next Steps

1. Keep GitHub Actions enabled.
2. Before the trip, optionally run one final manual `workflow_dispatch` test for:
   - `Send travel reminder`
   - `Send morning greeting`
3. Do not delete these GitHub repository secrets:
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_USER_ID`
4. Do not rotate the LINE Channel access token unless the GitHub secret is updated afterward.
5. If a reminder does not arrive, check the latest `Send travel reminder` workflow run.

## Future Features

### Rich Menu

Requested Rich Menu buttons:

- 今日行程
- 明日行程
- 旅行記帳本

Important implementation note:

- A Rich Menu can be created in LINE Official Account Manager or through the Messaging API.
- If buttons should trigger dynamic replies such as today's itinerary, tomorrow's itinerary, or accounting flows, the project needs a webhook endpoint.
- The current GitHub Actions setup can push scheduled messages, but it cannot receive instant LINE webhook events.

Likely next architecture:

- Keep GitHub Actions for scheduled push messages.
- Add a small webhook service for interactive Rich Menu replies.
- Candidate hosting options: Cloudflare Workers, Render, Railway, Fly.io, or another small HTTPS endpoint.

### Weather Forecast

Weather can be added to daily itinerary messages, but it should be treated as a live external data feature.

Recommended source for this private/non-commercial project:

- Open-Meteo Weather Forecast API
  - No API key required.
  - Supports global forecast data.
  - Suitable for private/non-commercial use.

Implementation approach:

- Add coordinates for each day or major city.
- At send time, fetch forecast data for that date and location.
- Include a compact line in the itinerary, such as:
  - `天氣：晴時多雲，15-24°C，降雨機率 20%`

### Travel Accounting Book

The travel accounting book should be developed as a separate feature.

It needs its own design discussion:

- Input style: LINE text, buttons, or form.
- Fields: date, item, amount, currency, payer, category, note.
- Currency conversion: manual rate or live exchange-rate API.
- Storage: JSON, SQLite, Google Sheets, GitHub file, or cloud database.
- Output: daily total, category total, trip total, export CSV.

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
已完成：旅行資料 JSON、LINE Flex Message、12 天預覽、GitHub Actions、初次 push。
已確認：LINE 通知、只通知本人、GitHub Actions 雲端排程、每天當地時間 07:00、景點地圖按鈕只在明確對應時顯示。
下一步：設定 LINE Official Account、取得 LINE_CHANNEL_ACCESS_TOKEN / LINE_USER_ID，並加入 GitHub Secrets 後測試推播。
```
