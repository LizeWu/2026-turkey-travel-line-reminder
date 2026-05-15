# Rich Menu + Webhook Plan

## Confirmed Rich Menu Buttons

- 今日行程
- 明日行程
- 旅行記帳本

No extra buttons for:

- 全部行程
- 飯店地圖
- 說明

## Behavior

| Button | Action |
| --- | --- |
| 今日行程 | Sends `今日行程`; webhook replies with today's itinerary. |
| 明日行程 | Sends `明日行程`; webhook replies with tomorrow's itinerary. |
| 旅行記帳本 | Sends `旅行記帳本`; webhook replies with a placeholder until accounting is implemented. |

## Architecture

Current scheduled push messages stay on GitHub Actions.

Interactive Rich Menu replies need an HTTPS webhook endpoint. The current scaffold uses Cloudflare Workers:

```text
LINE Rich Menu
  -> sends text/postback command
  -> LINE Webhook URL
  -> Cloudflare Worker
  -> LINE reply API
```

## Files

| File | Purpose |
| --- | --- |
| `webhook/cloudflare-worker/src/index.js` | Webhook handler for Rich Menu commands. |
| `webhook/cloudflare-worker/src/trip-data.js` | Generated active-trip data bundled into the Worker. |
| `webhook/cloudflare-worker/wrangler.toml` | Cloudflare Worker config. |
| `tools/build_webhook_data.py` | Generates Worker trip data from `config.json`, active trip JSON, and generated Flex messages. |

## Required Worker Secrets

Set these in Cloudflare Worker secrets:

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`

`LINE_CHANNEL_SECRET` is used to verify webhook signatures.

## Next Deployment Steps

1. Create or log in to a Cloudflare account.
2. Install or use `wrangler`.
3. Deploy the Worker.
4. Copy the deployed Worker URL.
5. In LINE Developers Console, set Webhook URL to:

```text
https://<worker-url>/
```

6. Enable webhook.
7. Test by sending `今日行程` to 阿珠媽旅行提醒.

