# Project Handoff

## Current Status

- GitHub repo: `https://github.com/LizeWu/2026-turkey-travel-line-reminder`
- The initial project has already been pushed to GitHub.
- The trip PDF has been converted into structured reminder data.
- The 12-day LINE message preview has been generated and confirmed by the user.
- The next major task is LINE setup and GitHub Secrets setup.

## Confirmed Product Decisions

- Notification channel: LINE.
- Recipient: only the user.
- Runtime: GitHub Actions, because the user's Mac may be powered off.
- Timezone behavior: automatic per itinerary day.
  - Taiwan days use `Asia/Taipei`.
  - Turkey travel days use `Europe/Istanbul`.
- Default send time: 07:00 local time for that itinerary day.
- Reminder type: daily itinerary reminder.
- Daily reminder does not include departure time.
  - The user may later input departure time through LINE, but this is not implemented yet.
- Dietary preferences and Morning Call are not included.
- The user confirmed participation in the hot air balloon activity.

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

- `travel_reminder_data.json`
  - Source itinerary data used by the sender script.
- `line_flex_messages.json`
  - Generated LINE Flex Message payloads.
- `line_message_previews.md`
  - Human-readable preview for all 12 days.
- `send_line_reminder.py`
  - Builds previews and sends LINE push messages.
- `.github/workflows/send-travel-reminder.yml`
  - GitHub Actions schedule.

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
```

The Python script was also syntax-checked successfully with:

```bash
PYTHONPYCACHEPREFIX=.pycache python3 -m py_compile send_line_reminder.py
```

## Next Steps

1. Create or configure a LINE Official Account.
2. Enable Messaging API.
3. Get `LINE_CHANNEL_ACCESS_TOKEN`.
4. Get the user's `LINE_USER_ID`.
5. Add both values as GitHub repository secrets:
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_USER_ID`
6. Test GitHub Actions manually with `workflow_dispatch`.
7. Send a test reminder to LINE.

## Resume Prompt For A New Codex Chat

If continuing in a new Codex conversation, paste this:

```text
請接續 2026-turkey-travel-line-reminder 專案。
GitHub repo: https://github.com/LizeWu/2026-turkey-travel-line-reminder
已完成：旅行資料 JSON、LINE Flex Message、12 天預覽、GitHub Actions、初次 push。
已確認：LINE 通知、只通知本人、GitHub Actions 雲端排程、每天當地時間 07:00、景點地圖按鈕只在明確對應時顯示。
下一步：設定 LINE Official Account、取得 LINE_CHANNEL_ACCESS_TOKEN / LINE_USER_ID，並加入 GitHub Secrets 後測試推播。
```

