import { ACTIVE_TRIP, FLEX_MESSAGES } from "./trip-data.js";
import { accountingPage } from "./accounting-page.js";

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
    const url = new URL(request.url);
    if (url.pathname === "/accounting") {
      return new Response(accountingPage(), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, url);
    }

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
    const urlText = "請先完成 LIFF 設定後，將 Rich Menu 改成直接開啟記帳本。";
    return {
      type: "text",
      text: [
        "旅行記帳本 MVP 已準備中。",
        "",
        "之後點這個按鈕會直接開啟表單，可新增、查今日、看統計、修改最近一筆、刪除最近一筆。",
        "",
        urlText,
      ].join("\n"),
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

async function handleApi(request, env, url) {
  try {
    if (url.pathname === "/api/accounting/config" && request.method === "GET") {
      return jsonResponse({
        liffId: env.LINE_LIFF_ID || "",
        tripId: tripId(env),
        tripName: ACTIVE_TRIP.trip?.tour_name || "旅行",
      });
    }

    if (!env.ACCOUNTING_DB) {
      return jsonResponse({ error: "Cloudflare D1 尚未綁定 ACCOUNTING_DB。" }, 503);
    }

    if (url.pathname === "/api/expenses" && request.method === "GET") {
      const scope = url.searchParams.get("scope") || "today";
      return jsonResponse({ expenses: await listExpenses(env, scope) });
    }

    if (url.pathname === "/api/expenses" && request.method === "POST") {
      const payload = await request.json();
      const expense = await createExpense(env, payload);
      return jsonResponse({ expense }, 201);
    }

    if (url.pathname === "/api/expenses/recent" && request.method === "PATCH") {
      const payload = await request.json();
      const expense = await updateRecentExpense(env, payload);
      return jsonResponse({ expense });
    }

    if (url.pathname === "/api/expenses/recent" && request.method === "DELETE") {
      const expense = await deleteRecentExpense(env);
      return jsonResponse({ expense });
    }

    if (url.pathname === "/api/expenses/stats" && request.method === "GET") {
      return jsonResponse(await expenseStats(env));
    }

    return jsonResponse({ error: "Not found" }, 404);
  } catch (error) {
    return jsonResponse({ error: error.message || "API error" }, 400);
  }
}

async function createExpense(env, payload) {
  const item = normalizeExpense(env, payload);
  const result = await env.ACCOUNTING_DB.prepare(
    `INSERT INTO expenses (
      trip_id, date, amount, currency_code, currency_label, currency_symbol,
      category, note, payer_id, payer_name, chat_type, chat_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      item.trip_id,
      item.date,
      item.amount,
      item.currency_code,
      item.currency_label,
      item.currency_symbol,
      item.category,
      item.note,
      item.payer_id,
      item.payer_name,
      item.chat_type,
      item.chat_id,
      item.created_at
    )
    .run();
  return getExpense(env, result.meta.last_row_id);
}

async function updateRecentExpense(env, payload) {
  const recent = await getRecentExpense(env);
  const item = normalizeExpense(env, payload);
  await env.ACCOUNTING_DB.prepare(
    `UPDATE expenses
      SET amount = ?, currency_code = ?, currency_label = ?, currency_symbol = ?,
          category = ?, note = ?, payer_id = ?, payer_name = ?, updated_at = ?
      WHERE id = ? AND deleted_at IS NULL`
  )
    .bind(
      item.amount,
      item.currency_code,
      item.currency_label,
      item.currency_symbol,
      item.category,
      item.note,
      item.payer_id,
      item.payer_name,
      item.created_at,
      recent.id
    )
    .run();
  return getExpense(env, recent.id);
}

async function deleteRecentExpense(env) {
  const recent = await getRecentExpense(env);
  await env.ACCOUNTING_DB.prepare("UPDATE expenses SET deleted_at = ? WHERE id = ?")
    .bind(new Date().toISOString(), recent.id)
    .run();
  return recent;
}

async function getRecentExpense(env) {
  const expense = await env.ACCOUNTING_DB.prepare(
    `SELECT * FROM expenses
      WHERE trip_id = ? AND deleted_at IS NULL
      ORDER BY created_at DESC, id DESC
      LIMIT 1`
  )
    .bind(tripId(env))
    .first();
  if (!expense) {
    throw new Error("目前沒有可修改或刪除的記帳。");
  }
  return expense;
}

async function getExpense(env, id) {
  return env.ACCOUNTING_DB.prepare("SELECT * FROM expenses WHERE id = ?").bind(id).first();
}

async function listExpenses(env, scope) {
  const dateFilter = scope === "today" ? "AND date = ?" : "";
  const statement = env.ACCOUNTING_DB.prepare(
    `SELECT * FROM expenses
      WHERE trip_id = ? AND deleted_at IS NULL ${dateFilter}
      ORDER BY created_at DESC, id DESC
      LIMIT 50`
  );
  const binding = scope === "today" ? statement.bind(tripId(env), accountingDate()) : statement.bind(tripId(env));
  const result = await binding.all();
  return result.results || [];
}

async function expenseStats(env) {
  const currencyTotals = await env.ACCOUNTING_DB.prepare(
    `SELECT currency_code, currency_label, currency_symbol, SUM(amount) AS total
      FROM expenses
      WHERE trip_id = ? AND deleted_at IS NULL
      GROUP BY currency_code, currency_label, currency_symbol
      ORDER BY currency_code`
  )
    .bind(tripId(env))
    .all();
  const categoryTotals = await env.ACCOUNTING_DB.prepare(
    `SELECT category, currency_code, currency_label, SUM(amount) AS total
      FROM expenses
      WHERE trip_id = ? AND deleted_at IS NULL
      GROUP BY category, currency_code, currency_label
      ORDER BY category, currency_code`
  )
    .bind(tripId(env))
    .all();
  return {
    currencyTotals: currencyTotals.results || [],
    categoryTotals: categoryTotals.results || [],
  };
}

function normalizeExpense(env, payload) {
  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("請輸入正確金額。");
  }
  const currency = currencyInfo(payload.currencyCode);
  const category = String(payload.category || "其他").trim().slice(0, 20) || "其他";
  return {
    trip_id: tripId(env),
    date: accountingDate(),
    amount,
    currency_code: currency.code,
    currency_label: currency.label,
    currency_symbol: payload.currencySymbol || currency.symbol,
    category,
    note: String(payload.note || "").trim().slice(0, 80),
    payer_id: String(payload.payerId || "").slice(0, 80),
    payer_name: String(payload.payerName || "").slice(0, 80),
    chat_type: "user",
    chat_id: String(payload.payerId || "").slice(0, 80),
    created_at: new Date().toISOString(),
  };
}

function currencyInfo(code) {
  const currencies = {
    TRY: { code: "TRY", label: "里拉", symbol: "₺" },
    TWD: { code: "TWD", label: "台幣", symbol: "NT$" },
    EUR: { code: "EUR", label: "歐元", symbol: "€" },
    USD: { code: "USD", label: "美金", symbol: "US$" },
  };
  return currencies[code] || currencies.TRY;
}

function accountingDate() {
  for (const day of ACTIVE_TRIP.daily_itinerary) {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: day.timezone }));
    if (formatLocalDate(now) === day.date) {
      return day.date;
    }
  }
  const timezone = ACTIVE_TRIP.trip?.notification?.default_timezone || "Asia/Taipei";
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
  return formatLocalDate(now);
}

function tripId(env) {
  return env.TRIP_ID || "2026-05-turkey";
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
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
