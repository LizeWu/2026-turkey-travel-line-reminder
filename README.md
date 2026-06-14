# 2026 Turkey Travel LINE Reminder

This repository contains a LINE reminder workflow for the 2026 Turkey trip.

For Codex app continuation across machines, start with `AGENTS.md`.
For project context and continuation notes, see `PROJECT_HANDOFF.md`.
For a quick list of files and their purposes, see `FILE_INDEX.md`.
For daily implementation notes, see `WORKLOG.md`.
For AI development rules and multi-device continuation, see `docs/ai-development-sop.md` and `docs/multi-device-continuation.md`.

## Files

- `travel_reminder_data.json`: itinerary data and Google Maps links.
- `config.json`: active trip and generated-output settings.
- `trips/2026-05-turkey.json`: itinerary data and Google Maps links.
- `generated/line_flex_messages.json`: generated LINE Flex Message payloads.
- `generated/line_message_previews.md`: readable 12-day preview.
- `send_line_reminder.py`: script to build previews, fetch weather, or send LINE reminders.
- `.github/workflows/send-travel-reminder.yml`: GitHub Actions schedule.
- `.github/workflows/send-morning-greeting.yml`: GitHub Actions morning greeting schedule.
- `PROJECT_HANDOFF.md`: current decisions, status, and next steps.
- `FILE_INDEX.md`: quick file/function index.
- `WORKLOG.md`: date-descending worklog.
- `docs/ai-development-sop.md`: shared development SOP for Lize and AI assistants.
- `docs/multi-device-continuation.md`: home/office continuation checklist and sync rules.
- `.env.example`: safe template for local environment variables and platform secrets.
- `generated/share-card/azuma-line-share-card.png`: LINE add-friend sharing card for 阿珠媽旅行提醒.
- `AGENTS.md`: Codex app handoff rules for company/home machine synchronization.

## LINE Friend Entry

- LINE Official Account: `阿珠媽旅行提醒`
- LINE ID: `@435uwhmo`
- Add-friend URL: `https://lin.ee/tqlXqAmN`

## Local Checks

```bash
python send_line_reminder.py --build
python send_line_reminder.py --day 3 --dry-run
python send_line_reminder.py --mode greeting --day 3 --dry-run
```

Weather forecast notes are in `docs/weather-forecast.md`.

## Multi-Device Development

Before continuing from home, office, or a new Codex thread:

```bash
git status --short
git pull --ff-only origin main
```

Then read `LizeNext.md` and `docs/ai-development-sop.md`.

Before leaving a computer, commit and push useful changes so the next location can continue from GitHub. If work is unfinished, update `LizeNext.md` with the current state.

## GitHub Secrets

Set these repository secrets before enabling real sending:

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_USER_ID`

Do not commit real secret values. Use `.env.example` for variable names only.
