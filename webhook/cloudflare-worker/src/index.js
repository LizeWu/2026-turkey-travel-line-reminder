import { ACTIVE_TRIP, FLEX_MESSAGES } from "./trip-data.js";

const COMMANDS = {
  today: new Set(["今日行程", "今天行程", "today"]),
  tomorrow: new Set(["明日行程", "明天行程", "tomorrow"]),
  accounting: new Set(["旅行記帳本", "記帳本", "accounting"]),
};

const WEATHER_CODES = {
  0: "晴朗",
  1: "大致晴朗",
  2: "局部多雲",
  3: "陰天",
  45: "霧",
  48: "霧凇",
  51: "毛毛雨",
  53: "毛毛雨",
  55: "毛毛雨",
  56: "凍毛毛雨",
  57: "凍毛毛雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  66: "凍雨",
  67: "凍雨",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  77: "雪粒",
  80: "陣雨",
  81: "陣雨",
  82: "強陣雨",
  85: "陣雪",
  86: "強陣雪",
  95: "雷雨",
  96: "雷雨",
  99: "強雷雨",
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

  const message = await buildReply(command);
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

async function buildReply(command) {
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

  const weather = await weatherSummary(day);
  return withWeather(FLEX_MESSAGES[String(day.day)], weather);
}

async function weatherSummary(day) {
  const location = day.weather_location;
  if (!location) return null;

  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: day.timezone,
    start_date: day.date,
    end_date: day.date,
  });

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) return null;
    const payload = await response.json();
    const daily = payload.daily || {};
    const index = (daily.time || []).indexOf(day.date);
    if (index < 0) return null;

    const code = daily.weather_code?.[index];
    const tempMin = daily.temperature_2m_min?.[index];
    const tempMax = daily.temperature_2m_max?.[index];
    const rain = daily.precipitation_probability_max?.[index];
    const desc = WEATHER_CODES[code] || `天氣代碼 ${code}`;
    const tempText = tempMin == null || tempMax == null ? "溫度資料暫無" : `${Math.round(tempMin)}-${Math.round(tempMax)}°C`;
    const rainText = rain == null ? "降雨機率暫無" : `降雨機率 ${Math.round(rain)}%`;
    return `${location.name}：${desc}，${tempText}，${rainText}`;
  } catch {
    return null;
  }
}

function withWeather(message, weather) {
  if (!weather) return message;

  const copy = JSON.parse(JSON.stringify(message));
  const contents = copy.contents?.body?.contents;
  if (!Array.isArray(contents)) return copy;

  contents.splice(3, 0, {
    type: "box",
    layout: "vertical",
    spacing: "xs",
    contents: [
      { type: "text", text: "天氣", size: "sm", weight: "bold", wrap: true },
      { type: "text", text: weather, size: "sm", wrap: true },
    ],
  });
  return copy;
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
      messages: Array.isArray(message) ? message : [message],
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
