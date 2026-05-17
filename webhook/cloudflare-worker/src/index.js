import { ACTIVE_TRIP, FLEX_MESSAGES } from "./trip-data.js";
import { accountingPage } from "./accounting-page.js";

const COMMANDS = {
  today: new Set(["今日行程", "今天行程", "today"]),
  tomorrow: new Set(["明日行程", "明天行程", "tomorrow"]),
  accounting: new Set(["阿珠", "阿珠媽", "珠珠", "豬豬", "記帳本", "記帳", "旅行記帳本", "accounting"]),
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

  const message = await buildReply(command, env);
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

async function buildReply(command, env) {
  if (command === "accounting") {
    const accountingUrl = env.LINE_LIFF_ID
      ? `https://liff.line.me/${env.LINE_LIFF_ID}`
      : `${env.WORKER_BASE_URL || "https://lize-tour-bot-webhook.retniw72.workers.dev"}/accounting`;
    return {
      type: "text",
      text: [
        "旅行記帳本已開放。",
        "",
        "請點下面連結開啟記帳本：",
        accountingUrl,
        "",
        "在群組中開啟時，可使用團體消費與分帳。",
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
      return jsonResponse({
        expenses: await listExpenses(env, {
          scope,
          expenseScope: url.searchParams.get("expenseScope") || "personal",
          userId: url.searchParams.get("userId") || "",
          displayName: url.searchParams.get("displayName") || "",
          chatType: url.searchParams.get("chatType") || "",
          groupId: url.searchParams.get("groupId") || "",
          roomId: url.searchParams.get("roomId") || "",
        }),
      });
    }

    if (url.pathname === "/api/ledger-members" && request.method === "GET") {
      const result = await listLedgerMembers(env, {
        userId: url.searchParams.get("userId") || "",
        displayName: url.searchParams.get("displayName") || "",
        chatType: url.searchParams.get("chatType") || "",
        groupId: url.searchParams.get("groupId") || "",
        roomId: url.searchParams.get("roomId") || "",
      });
      return jsonResponse({
        members: result.members,
        debug: result.debug,
      });
    }

    if (url.pathname === "/api/expenses" && request.method === "POST") {
      const payload = await request.json();
      const expense = await createExpense(env, payload);
      return jsonResponse({ expense }, 201);
    }

    const expenseIdMatch = url.pathname.match(/^\/api\/expenses\/(\d+)$/);
    if (expenseIdMatch && request.method === "PATCH") {
      const payload = await request.json();
      const expense = await updateExpense(env, Number(expenseIdMatch[1]), payload);
      return jsonResponse({ expense });
    }

    if (expenseIdMatch && request.method === "DELETE") {
      const expense = await deleteExpense(env, Number(expenseIdMatch[1]));
      return jsonResponse({ expense });
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
  if (item.expense_scope === "group") {
    await upsertLedgerMember(env, item);
  }
  const result = await env.ACCOUNTING_DB.prepare(
    `INSERT INTO expenses (
      trip_id, date, amount, currency_code, currency_label, currency_symbol,
      category, note, payer_id, payer_name, chat_type, chat_id,
      expense_scope, ledger_id, created_by_id, created_by_name,
      split_method, split_members, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      item.expense_scope,
      item.ledger_id,
      item.created_by_id,
      item.created_by_name,
      item.split_method,
      item.split_members,
      item.created_at
    )
    .run();
  return getExpense(env, result.meta.last_row_id);
}

async function updateRecentExpense(env, payload) {
  const recent = await getRecentExpense(env);
  return updateExpense(env, recent.id, payload);
}

async function updateExpense(env, id, payload) {
  const existing = await getEditableExpense(env, id);
  const item = normalizeExpense(env, payload);
  if (item.expense_scope === "group") {
    await upsertLedgerMember(env, item);
  }
  await env.ACCOUNTING_DB.prepare(
    `UPDATE expenses
      SET amount = ?, currency_code = ?, currency_label = ?, currency_symbol = ?,
          category = ?, note = ?, payer_id = ?, payer_name = ?,
          expense_scope = ?, ledger_id = ?, created_by_id = ?, created_by_name = ?,
          split_method = ?, split_members = ?,
          updated_at = ?
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
      item.expense_scope,
      item.ledger_id,
      item.created_by_id,
      item.created_by_name,
      item.split_method,
      item.split_members,
      item.created_at,
      existing.id
    )
    .run();
  return getExpense(env, existing.id);
}

async function deleteRecentExpense(env) {
  const recent = await getRecentExpense(env);
  return deleteExpense(env, recent.id);
}

async function deleteExpense(env, id) {
  const existing = await getEditableExpense(env, id);
  await env.ACCOUNTING_DB.prepare("UPDATE expenses SET deleted_at = ? WHERE id = ?")
    .bind(new Date().toISOString(), existing.id)
    .run();
  return existing;
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

async function getEditableExpense(env, id) {
  const expense = await env.ACCOUNTING_DB.prepare(
    `SELECT * FROM expenses
      WHERE id = ? AND trip_id = ? AND deleted_at IS NULL`
  )
    .bind(id, tripId(env))
    .first();
  if (!expense) {
    throw new Error("找不到這筆記帳，可能已經刪除。");
  }
  return expense;
}

async function getExpense(env, id) {
  return env.ACCOUNTING_DB.prepare("SELECT * FROM expenses WHERE id = ?").bind(id).first();
}

async function listExpenses(env, options = {}) {
  const scope = options.scope || "today";
  const expenseScope = normalizeExpenseScope(options.expenseScope);
  const userId = String(options.userId || "").trim().slice(0, 80);
  const displayName = String(options.displayName || "").trim().slice(0, 80);
  const ledger = resolveLedger(env, {
    expenseScope,
    payerId: userId,
    chatType: options.chatType,
    groupId: options.groupId,
    roomId: options.roomId,
  });
  const filters = ["trip_id = ?", "deleted_at IS NULL", "COALESCE(expense_scope, 'personal') = ?"];
  const bindings = [tripId(env), expenseScope];
  if (scope === "today") {
    filters.push("date = ?");
    bindings.push(accountingDate());
  }
  if (expenseScope === "personal" && userId) {
    filters.push("payer_id = ?");
    bindings.push(userId);
  } else if (expenseScope === "group") {
    filters.push("ledger_id = ?");
    bindings.push(ledger.ledger_id);
    if (userId) {
      await upsertLedgerMember(env, {
        trip_id: tripId(env),
        ledger_id: ledger.ledger_id,
        chat_type: ledger.chat_type,
        chat_id: ledger.chat_id,
        created_by_id: userId,
        created_by_name: displayName,
      });
    }
  }
  const statement = env.ACCOUNTING_DB.prepare(
    `SELECT * FROM expenses
      WHERE ${filters.join(" AND ")}
      ORDER BY created_at DESC, id DESC
      LIMIT 50`
  );
  const result = await statement.bind(...bindings).all();
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

async function listLedgerMembers(env, options = {}) {
  const userId = String(options.userId || "").trim().slice(0, 80);
  const displayName = String(options.displayName || "").trim().slice(0, 80);
  const ledger = resolveLedger(env, {
    expenseScope: "group",
    payerId: userId,
    chatType: options.chatType,
    groupId: options.groupId,
    roomId: options.roomId,
  });
  if (userId) {
    await upsertLedgerMember(env, {
      trip_id: tripId(env),
      ledger_id: ledger.ledger_id,
      chat_type: ledger.chat_type,
      chat_id: ledger.chat_id,
      created_by_id: userId,
      created_by_name: displayName,
    });
  }
  const sync = await syncLineChatMembers(env, ledger);
  const result = await env.ACCOUNTING_DB.prepare(
    `SELECT user_id, display_name, role, status, last_seen_at
      FROM ledger_members
      WHERE trip_id = ? AND ledger_id = ? AND status = 'active'
      ORDER BY last_seen_at ASC, id ASC`
  )
    .bind(tripId(env), ledger.ledger_id)
    .all();
  return {
    members: result.results || [],
    debug: {
      chatType: ledger.chat_type,
      hasChatId: Boolean(ledger.chat_id),
      syncedMemberCount: sync.count,
      syncError: sync.error,
    },
  };
}

function normalizeExpense(env, payload) {
  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("請輸入正確金額。");
  }
  const currency = currencyInfo(payload.currencyCode);
  const category = String(payload.category || "其他").trim().slice(0, 20) || "其他";
  const expenseScope = normalizeExpenseScope(payload.expenseScope);
  const payerId = String(payload.payerId || "").slice(0, 80);
  const payerName = String(payload.payerName || "").slice(0, 80);
  const ledger = resolveLedger(env, {
    expenseScope,
    payerId,
    chatType: payload.chatType,
    groupId: payload.groupId,
    roomId: payload.roomId,
  });
  const split = normalizeSplit(payload, {
    expenseScope,
    payerId,
    payerName,
  });
  return {
    trip_id: tripId(env),
    date: normalizeDate(payload.date),
    amount,
    currency_code: currency.code,
    currency_label: currency.label,
    currency_symbol: payload.currencySymbol || currency.symbol,
    category,
    note: String(payload.note || "").trim().slice(0, 80),
    payer_id: payerId,
    payer_name: payerName,
    chat_type: ledger.chat_type,
    chat_id: ledger.chat_id,
    expense_scope: expenseScope,
    ledger_id: ledger.ledger_id,
    created_by_id: payerId,
    created_by_name: payerName,
    split_method: split.method,
    split_members: split.members,
    created_at: new Date().toISOString(),
  };
}

function normalizeSplit(payload, context) {
  if (context.expenseScope !== "group") {
    return { method: "none", members: "" };
  }
  const rawMembers = Array.isArray(payload.splitMembers) ? payload.splitMembers : [];
  const members = rawMembers
    .map((member) => ({
      userId: String(member.userId || "").trim().slice(0, 80),
      displayName: String(member.displayName || "").trim().slice(0, 80),
    }))
    .filter((member) => member.userId);
  if (!members.some((member) => member.userId === context.payerId) && context.payerId) {
    members.push({ userId: context.payerId, displayName: context.payerName });
  }
  const unique = new Map();
  for (const member of members) unique.set(member.userId, member);
  return {
    method: "equal",
    members: JSON.stringify([...unique.values()]),
  };
}

function normalizeExpenseScope(value) {
  return value === "group" ? "group" : "personal";
}

function resolveLedger(env, options = {}) {
  const expenseScope = normalizeExpenseScope(options.expenseScope);
  const payerId = String(options.payerId || "").trim().slice(0, 80);
  if (expenseScope !== "group") {
    return {
      chat_type: "user",
      chat_id: payerId,
      ledger_id: `personal:${payerId || "unknown"}`,
    };
  }

  const groupId = String(options.groupId || "").trim().slice(0, 120);
  if (groupId) {
    return {
      chat_type: "group",
      chat_id: groupId,
      ledger_id: `group:${groupId}`,
    };
  }

  const roomId = String(options.roomId || "").trim().slice(0, 120);
  if (roomId) {
    return {
      chat_type: "room",
      chat_id: roomId,
      ledger_id: `room:${roomId}`,
    };
  }

  throw new Error("團體帳本需要從 LINE 群組或多人聊天室開啟。");
}

async function upsertLedgerMember(env, item) {
  if (!item.created_by_id) return;
  const now = new Date().toISOString();
  await env.ACCOUNTING_DB.prepare(
    `INSERT INTO ledger_members (
      trip_id, ledger_id, chat_type, chat_id, user_id, display_name,
      role, status, joined_at, last_seen_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'member', 'active', ?, ?)
    ON CONFLICT(trip_id, ledger_id, user_id) DO UPDATE SET
      display_name = excluded.display_name,
      status = 'active',
      last_seen_at = excluded.last_seen_at`
  )
    .bind(
      item.trip_id,
      item.ledger_id,
      item.chat_type,
      item.chat_id,
      item.created_by_id,
      item.created_by_name,
      now,
      now
    )
    .run();
}

async function syncLineChatMembers(env, ledger) {
  if (!env.LINE_CHANNEL_ACCESS_TOKEN || !["group", "room"].includes(ledger.chat_type)) {
    return { count: 0, error: "missing-token-or-chat-context" };
  }
  try {
    const memberIds = await fetchLineMemberIds(env, ledger);
    await Promise.all(memberIds.slice(0, 100).map(async (userId) => {
      const profile = await fetchLineMemberProfile(env, ledger, userId);
      await upsertLedgerMember(env, {
        trip_id: tripId(env),
        ledger_id: ledger.ledger_id,
        chat_type: ledger.chat_type,
        chat_id: ledger.chat_id,
        created_by_id: userId,
        created_by_name: profile?.displayName || userId,
      });
    }));
    return { count: memberIds.length, error: "" };
  } catch (error) {
    // If LINE member sync is unavailable, keep the members who opened LIFF.
    return { count: 0, error: error.message || "member-sync-failed" };
  }
}

async function fetchLineMemberIds(env, ledger) {
  const ids = [];
  let start = "";
  do {
    const params = start ? `?start=${encodeURIComponent(start)}` : "";
    const response = await fetch(`${lineChatBaseUrl(ledger)}/members/ids${params}`, {
      headers: { Authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` },
    });
    if (!response.ok) throw new Error(`LINE member IDs failed: ${response.status}`);
    const data = await response.json();
    ids.push(...(data.memberIds || []));
    start = data.next || "";
  } while (start);
  return ids;
}

async function fetchLineMemberProfile(env, ledger, userId) {
  const response = await fetch(`${lineChatBaseUrl(ledger)}/member/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` },
  });
  if (!response.ok) return null;
  return response.json();
}

function lineChatBaseUrl(ledger) {
  const type = ledger.chat_type === "room" ? "room" : "group";
  return `https://api.line.me/v2/bot/${type}/${encodeURIComponent(ledger.chat_id)}`;
}

function normalizeDate(value) {
  const date = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  return accountingDate();
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
