import { ACTIVE_TRIP, FLEX_MESSAGES } from "./trip-data.js";

const COMMANDS = {
  today: new Set(["今日行程", "今天行程", "today"]),
  tomorrow: new Set(["明日行程", "明天行程", "tomorrow"]),
  accounting: new Set(["旅行記帳本", "記帳本", "accounting"]),
};

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("OK");
    }

    const body = await request.text();
    if (env.LINE_CHANNEL_SECRET) {
      const valid = await verifyLineSignature(
        body,
        request.headers.get("x-line-signature") || "",
        env.LINE_CHANNEL_SECRET
      );
      if (!valid) {
        return new Response("Invalid signature", { status: 401 });
      }
    }

    const payload = JSON.parse(body);
    await Promise.all((payload.events || []).map((event) => handleEvent(event, env)));
    return new Response("OK");
  },
};

async function handleEvent(event, env) {
  if (!event.replyToken) return;

  const command = extractCommand(event);
  if (!command) return;

  const message = buildReply(command);
  await replyToLine(event.replyToken, message, env.LINE_CHANNEL_ACCESS_TOKEN);
}

function extractCommand(event) {
  if (event.type === "postback") {
    const params = new URLSearchParams(event.postback?.data || "");
    return params.get("action");
  }

  if (event.type !== "message" || event.message?.type !== "text") {
    return null;
  }

  const text = event.message.text.trim();
  if (COMMANDS.today.has(text)) return "today";
  if (COMMANDS.tomorrow.has(text)) return "tomorrow";
  if (COMMANDS.accounting.has(text)) return "accounting";
  return null;
}

function buildReply(command) {
  if (command === "accounting") {
    return {
      type: "text",
      text: "旅行記帳本尚未啟用。下一階段會再設計記帳欄位、幣別、匯率與統計方式。",
    };
  }

  const day = command === "today" ? selectRelativeDay(0) : selectRelativeDay(1);
  if (!day) {
    return {
      type: "text",
      text: command === "today" ? "今天沒有對應的旅行行程。" : "明天沒有對應的旅行行程。",
    };
  }

  return FLEX_MESSAGES[String(day.day)];
}

function selectRelativeDay(offsetDays) {
  for (const day of ACTIVE_TRIP.daily_itinerary) {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: day.timezone }));
    now.setDate(now.getDate() + offsetDays);
    const targetDate = formatLocalDate(now);
    if (day.date === targetDate) {
      return day;
    }
  }
  return null;
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function replyToLine(replyToken, message, accessToken) {
  if (!accessToken) {
    throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN");
  }

  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      replyToken,
      messages: [message],
    }),
  });

  if (!response.ok) {
    throw new Error(`LINE reply failed: ${response.status} ${await response.text()}`);
  }
}

async function verifyLineSignature(body, signature, channelSecret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(channelSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const expected = arrayBufferToBase64(digest);
  return timingSafeEqual(expected, signature);
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  for (const byte of new Uint8Array(buffer)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
