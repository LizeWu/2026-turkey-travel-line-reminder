# File Index

## Start Here

| File | Purpose |
| --- | --- |
| `README.md` | Project overview, basic commands, and required GitHub Secrets. |
| `PROJECT_HANDOFF.md` | Current decisions, completed setup, next steps, and continuation notes. |
| `LizeNext.md` | Short prompt to paste into a new Codex conversation if context is lost. |

## Core Reminder Files

| File | Purpose |
| --- | --- |
| `travel_reminder_data.json` | Main itinerary database: dates, routes, sights, activities, driving time, meals, hotels, map links, and notification settings. |
| `send_line_reminder.py` | Main script. Builds LINE Flex Messages, sends previous-night itinerary reminders, and sends morning greetings. |
| `line_flex_messages.json` | Generated LINE Flex Message payloads for itinerary reminders. |
| `line_message_previews.md` | Human-readable preview of all 12 itinerary reminder messages. |

## GitHub Actions

| File | Purpose |
| --- | --- |
| `.github/workflows/send-travel-reminder.yml` | Sends the next day's full itinerary at 20:00 local time on the previous day. |
| `.github/workflows/send-morning-greeting.yml` | Sends the travel-period morning greeting at 06:30 local time. |

## Local Analysis Drafts

These files are useful locally but are ignored by Git and not required for production.

| File | Purpose |
| --- | --- |
| `extracted_travel_pdf.txt` | Text extracted from the original travel PDF for analysis. |
| `travel_data_draft.json` | Early structured draft created from the PDF. |
| `travel_reminder_format_draft.md` | Early reminder-format discussion draft. |

## Config

| File | Purpose |
| --- | --- |
| `.gitignore` | Prevents local scratch files, caches, and secrets from being committed. |

## Required GitHub Secrets

| Secret | Purpose |
| --- | --- |
| `LINE_CHANNEL_ACCESS_TOKEN` | Lets GitHub Actions call the LINE Messaging API. |
| `LINE_USER_ID` | Identifies the LINE user who receives reminders. |

