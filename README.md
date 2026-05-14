# 2026 Turkey Travel LINE Reminder

This repository contains a LINE reminder workflow for the 2026 Turkey trip.

## Files

- `travel_reminder_data.json`: itinerary data and Google Maps links.
- `line_flex_messages.json`: generated LINE Flex Message payloads.
- `line_message_previews.md`: readable 12-day preview.
- `send_line_reminder.py`: script to build previews or send LINE reminders.
- `.github/workflows/send-travel-reminder.yml`: GitHub Actions schedule.

## Local Checks

```bash
python send_line_reminder.py --build
python send_line_reminder.py --day 3 --dry-run
```

## GitHub Secrets

Set these repository secrets before enabling real sending:

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_USER_ID`

