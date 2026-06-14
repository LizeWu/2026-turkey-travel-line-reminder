import { ACTIVE_TRIP, FLEX_MESSAGES } from "./trip-data.js";
import { accountingPage } from "./accounting-page.js";

const COMMANDS = {
  today: new Set(["今日行程", "今天行程", "today"]),
  tomorrow: new Set(["明日行程", "明天行程", "tomorrow"]),
  accounting: new Set(["阿珠", "阿珠媽", "珠珠", "豬豬", "記帳本", "記帳", "旅行記帳本", "accounting"]),
};

const LEGACY_PERSONAL_MIGRATION_TARGET = {
  tripId: "dev-sandbox",
  chatType: "group",
  chatId: "C87ffe42ff346bc573d7eb45a9cbec853",
  createdBefore: "2026-06-14T12:50:00Z",
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

  const message = await buildReply(command, env, event);
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

async function buildReply(command, env, event = null) {
  if (command === "accounting") {
    const activeTripId = await activeTripIdForEvent(env, event);
    const accountingUrl = accountingUrlForTrip(env, activeTripId, chatContextFromEvent(event));
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

function accountingUrlForTrip(env, activeTripId, chatContext = {}) {
  const params = new URLSearchParams({ trip: activeTripId });
  if (chatContext.chatType) params.set("chatType", chatContext.chatType);
  if (chatContext.groupId) params.set("groupId", chatContext.groupId);
  if (chatContext.roomId) params.set("roomId", chatContext.roomId);
  if (env.LINE_LIFF_ID) {
    return `https://liff.line.me/${env.LINE_LIFF_ID}?${params.toString()}`;
  }
  return `${env.WORKER_BASE_URL || "https://lize-tour-bot-webhook.retniw72.workers.dev"}/accounting?${params.toString()}`;
}

async function activeTripIdForEvent(env, event) {
  const context = chatContextFromEvent(event);
  const chatType = context.chatType;
  const chatId = context.groupId || context.roomId || "";
  const defaultTripId = tripId(env);
  if (isDevelopmentTrip(defaultTripId)) return defaultTripId;
  if (!env.ACCOUNTING_DB || !chatType || !chatId) return defaultTripId;

  try {
    const setting = await env.ACCOUNTING_DB.prepare(
      `SELECT active_trip_id FROM group_trip_settings
        WHERE chat_type = ? AND chat_id = ?
        LIMIT 1`
    )
      .bind(chatType, chatId)
      .first();
    return tripId(env, setting?.active_trip_id);
  } catch {
    return defaultTripId;
  }
}

function chatContextFromEvent(event) {
  const source = event?.source || {};
  if (source.groupId) {
    return { chatType: "group", groupId: source.groupId, roomId: "" };
  }
  if (source.roomId) {
    return { chatType: "room", groupId: "", roomId: source.roomId };
  }
  return { chatType: "", groupId: "", roomId: "" };
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
  const baseDate = currentTripDate();
  const targetDate = addDays(baseDate, offsetDays);
  return ACTIVE_TRIP.daily_itinerary.find((day) => day.date === targetDate) || null;
}

function currentTripDate() {
  const now = new Date();
  const activeDay = ACTIVE_TRIP.daily_itinerary.find((day) => {
    return localDateInTimeZone(now, day.timezone) === day.date;
  });

  if (activeDay) {
    return activeDay.date;
  }

  const timezone = ACTIVE_TRIP.trip?.notification?.default_timezone || "Asia/Taipei";
  return localDateInTimeZone(now, timezone);
}

function localDateInTimeZone(date, timeZone) {
  return formatLocalDate(new Date(date.toLocaleString("en-US", { timeZone })));
}

function addDays(dateText, offsetDays) {
  const date = new Date(`${dateText}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
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
      const activeTripId = tripId(env, url.searchParams.get("trip") || url.searchParams.get("tripId"));
      return jsonResponse({
        liffId: env.LINE_LIFF_ID || "",
        tripId: activeTripId,
        tripName: tripName(activeTripId),
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
          tripId: url.searchParams.get("trip") || url.searchParams.get("tripId") || "",
          userId: url.searchParams.get("userId") || "",
          displayName: url.searchParams.get("displayName") || "",
          pictureUrl: url.searchParams.get("pictureUrl") || "",
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
        pictureUrl: url.searchParams.get("pictureUrl") || "",
        tripId: url.searchParams.get("trip") || url.searchParams.get("tripId") || "",
        chatType: url.searchParams.get("chatType") || "",
        groupId: url.searchParams.get("groupId") || "",
        roomId: url.searchParams.get("roomId") || "",
      });
      return jsonResponse({
        members: result.members,
        debug: result.debug,
      });
    }

    if (url.pathname === "/api/ledger-members" && request.method === "POST") {
      const payload = await request.json();
      const member = await createManualLedgerMember(env, payload);
      return jsonResponse({ member }, 201);
    }

    if (url.pathname === "/api/settlements" && request.method === "GET") {
      return jsonResponse({
        settlements: await listSettlements(env, {
          tripId: url.searchParams.get("trip") || url.searchParams.get("tripId") || "",
          chatType: url.searchParams.get("chatType") || "",
          groupId: url.searchParams.get("groupId") || "",
          roomId: url.searchParams.get("roomId") || "",
        }),
      });
    }

    if (url.pathname === "/api/settlements" && request.method === "POST") {
      const payload = await request.json();
      const settlement = await upsertSettlement(env, payload);
      return jsonResponse({ settlement }, 201);
    }

    const settlementMatch = url.pathname.match(/^\/api\/settlements\/(.+)$/);
    if (settlementMatch && request.method === "DELETE") {
      const settlement = await deleteSettlement(env, decodeURIComponent(settlementMatch[1]), {
        tripId: url.searchParams.get("trip") || url.searchParams.get("tripId") || "",
        chatType: url.searchParams.get("chatType") || "",
        groupId: url.searchParams.get("groupId") || "",
        roomId: url.searchParams.get("roomId") || "",
      });
      return jsonResponse({ settlement });
    }

    const ledgerMemberMatch = url.pathname.match(/^\/api\/ledger-members\/(.+)$/);
    const ledgerMemberMergeMatch = url.pathname.match(/^\/api\/ledger-members\/(.+)\/merge$/);
    if (ledgerMemberMergeMatch && request.method === "POST") {
      const payload = await request.json();
      const result = await mergeLedgerMember(env, decodeURIComponent(ledgerMemberMergeMatch[1]), payload);
      return jsonResponse(result);
    }

    if (ledgerMemberMatch && request.method === "DELETE") {
      const member = await deleteLedgerMember(env, decodeURIComponent(ledgerMemberMatch[1]), {
        tripId: url.searchParams.get("trip") || url.searchParams.get("tripId") || "",
        chatType: url.searchParams.get("chatType") || "",
        groupId: url.searchParams.get("groupId") || "",
        roomId: url.searchParams.get("roomId") || "",
      });
      return jsonResponse({ member });
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
      return jsonResponse(await expenseStats(env, {
        tripId: url.searchParams.get("trip") || url.searchParams.get("tripId") || "",
      }));
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
      SET date = ?, amount = ?, currency_code = ?, currency_label = ?, currency_symbol = ?,
          category = ?, note = ?, payer_id = ?, payer_name = ?,
          expense_scope = ?, ledger_id = ?, created_by_id = ?, created_by_name = ?,
          split_method = ?, split_members = ?,
          updated_at = ?
      WHERE id = ? AND deleted_at IS NULL`
  )
    .bind(
      item.date,
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
  const activeTripId = tripId(env);
  const expense = await env.ACCOUNTING_DB.prepare(
    `SELECT * FROM expenses
      WHERE trip_id = ? AND deleted_at IS NULL
      ORDER BY created_at DESC, id DESC
      LIMIT 1`
  )
    .bind(activeTripId)
    .first();
  if (!expense) {
    throw new Error("目前沒有可修改或刪除的記帳。");
  }
  return expense;
}

async function getEditableExpense(env, id) {
  const activeTripId = tripId(env);
  const expense = await env.ACCOUNTING_DB.prepare(
    `SELECT * FROM expenses
      WHERE id = ? AND trip_id = ? AND deleted_at IS NULL`
  )
    .bind(id, activeTripId)
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
  const activeTripId = tripId(env, options.tripId);
  const expenseScope = normalizeExpenseScope(options.expenseScope);
  const userId = String(options.userId || "").trim().slice(0, 80);
  const displayName = String(options.displayName || "").trim().slice(0, 80);
  const pictureUrl = String(options.pictureUrl || "").trim().slice(0, 500);
  const ledger = resolveLedger(env, {
    expenseScope,
    payerId: userId,
    chatType: options.chatType,
    groupId: options.groupId,
    roomId: options.roomId,
  });
  const filters = ["trip_id = ?", "deleted_at IS NULL", "COALESCE(expense_scope, 'personal') = ?"];
  const bindings = [activeTripId, expenseScope];
  if (scope === "today") {
    filters.push("date = ?");
    bindings.push(accountingDate());
  }
  if (expenseScope === "personal" && userId) {
    await migrateLegacyPersonalExpensesForTargetLedger(env, {
      activeTripId,
      userId,
      ledger,
    });
    filters.push("payer_id = ?");
    bindings.push(userId);
    if (ledger.chat_type === "user") {
      filters.push("(ledger_id = ? OR ledger_id IS NULL OR ledger_id = '')");
      bindings.push(ledger.ledger_id);
    } else {
      filters.push("ledger_id = ?");
      bindings.push(ledger.ledger_id);
    }
  } else if (expenseScope === "group") {
    filters.push("ledger_id = ?");
    bindings.push(ledger.ledger_id);
    if (userId) {
      await upsertLedgerMember(env, {
        trip_id: activeTripId,
        ledger_id: ledger.ledger_id,
        chat_type: ledger.chat_type,
        chat_id: ledger.chat_id,
        created_by_id: userId,
        created_by_name: displayName,
        created_by_picture_url: pictureUrl,
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

async function migrateLegacyPersonalExpensesForTargetLedger(env, options = {}) {
  const activeTripId = options.activeTripId;
  const userId = String(options.userId || "").trim().slice(0, 80);
  const ledger = options.ledger || {};
  if (!activeTripId || !userId || !["group", "room"].includes(ledger.chat_type) || !ledger.chat_id) return;
  if (activeTripId !== LEGACY_PERSONAL_MIGRATION_TARGET.tripId) return;
  if (ledger.chat_type !== LEGACY_PERSONAL_MIGRATION_TARGET.chatType) return;
  if (ledger.chat_id !== LEGACY_PERSONAL_MIGRATION_TARGET.chatId) return;

  await env.ACCOUNTING_DB.prepare(
    `UPDATE expenses
      SET chat_type = ?, chat_id = ?, ledger_id = ?, updated_at = ?
      WHERE trip_id = ?
        AND deleted_at IS NULL
        AND COALESCE(expense_scope, 'personal') = 'personal'
        AND payer_id = ?
        AND created_at < ?
        AND (
          ledger_id = ?
          OR ledger_id IS NULL
          OR ledger_id = ''
          OR ledger_id LIKE ?
        )`
  )
    .bind(
      ledger.chat_type,
      ledger.chat_id,
      ledger.ledger_id,
      new Date().toISOString(),
      activeTripId,
      userId,
      LEGACY_PERSONAL_MIGRATION_TARGET.createdBefore,
      `personal:${userId}`,
      `personal:%:user:${userId}`
    )
    .run();
}

async function expenseStats(env, options = {}) {
  const activeTripId = tripId(env, options.tripId);
  const currencyTotals = await env.ACCOUNTING_DB.prepare(
    `SELECT currency_code, currency_label, currency_symbol, SUM(amount) AS total
      FROM expenses
      WHERE trip_id = ? AND deleted_at IS NULL
      GROUP BY currency_code, currency_label, currency_symbol
      ORDER BY currency_code`
  )
    .bind(activeTripId)
    .all();
  const categoryTotals = await env.ACCOUNTING_DB.prepare(
    `SELECT category, currency_code, currency_label, SUM(amount) AS total
      FROM expenses
      WHERE trip_id = ? AND deleted_at IS NULL
      GROUP BY category, currency_code, currency_label
      ORDER BY category, currency_code`
  )
    .bind(activeTripId)
    .all();
  return {
    currencyTotals: currencyTotals.results || [],
    categoryTotals: categoryTotals.results || [],
  };
}

async function listLedgerMembers(env, options = {}) {
  const activeTripId = tripId(env, options.tripId);
  const userId = String(options.userId || "").trim().slice(0, 80);
  const displayName = String(options.displayName || "").trim().slice(0, 80);
  const pictureUrl = String(options.pictureUrl || "").trim().slice(0, 500);
  const ledger = resolveLedger(env, {
    expenseScope: "group",
    payerId: userId,
    chatType: options.chatType,
    groupId: options.groupId,
    roomId: options.roomId,
  });
  if (userId) {
    await upsertLedgerMember(env, {
      trip_id: activeTripId,
      ledger_id: ledger.ledger_id,
      chat_type: ledger.chat_type,
      chat_id: ledger.chat_id,
      created_by_id: userId,
      created_by_name: displayName,
      created_by_picture_url: pictureUrl,
    });
  }
  const result = await env.ACCOUNTING_DB.prepare(
    `SELECT user_id, display_name, picture_url, role, status, last_seen_at
      FROM ledger_members
      WHERE trip_id = ? AND ledger_id = ? AND status = 'active'
      ORDER BY last_seen_at ASC, id ASC`
  )
    .bind(activeTripId, ledger.ledger_id)
    .all();
  return {
    members: result.results || [],
    debug: {
      tripId: activeTripId,
      chatType: ledger.chat_type,
      hasChatId: Boolean(ledger.chat_id),
      syncedMemberCount: 0,
      syncError: "",
    },
  };
}

async function createManualLedgerMember(env, payload = {}) {
  const activeTripId = tripId(env, payload.tripId || payload.trip);
  const name = String(payload.displayName || payload.name || "").trim().slice(0, 80);
  if (!name) {
    throw new Error("請輸入分帳成員名稱。");
  }
  const ledger = resolveLedger(env, {
    expenseScope: "group",
    payerId: payload.userId,
    chatType: payload.chatType,
    groupId: payload.groupId,
    roomId: payload.roomId,
  });
  const userId = `manual:${crypto.randomUUID()}`;
  const item = {
    trip_id: activeTripId,
    ledger_id: ledger.ledger_id,
    chat_type: ledger.chat_type,
    chat_id: ledger.chat_id,
    created_by_id: userId,
    created_by_name: name,
    created_by_picture_url: "",
  };
  await upsertLedgerMember(env, item);
  return {
    user_id: userId,
    display_name: name,
    role: "member",
    status: "active",
  };
}

async function deleteLedgerMember(env, userId, options = {}) {
  const activeTripId = tripId(env, options.tripId || options.trip);
  const normalizedUserId = String(userId || "").trim().slice(0, 120);
  if (!normalizedUserId) {
    throw new Error("找不到要刪除的分帳成員。");
  }
  const ledger = resolveLedger(env, {
    expenseScope: "group",
    chatType: options.chatType,
    groupId: options.groupId,
    roomId: options.roomId,
  });
  const existing = await env.ACCOUNTING_DB.prepare(
    `SELECT user_id, display_name, role, status
      FROM ledger_members
      WHERE trip_id = ? AND ledger_id = ? AND user_id = ? AND status = 'active'
      LIMIT 1`
  )
    .bind(activeTripId, ledger.ledger_id, normalizedUserId)
    .first();
  if (!existing) {
    throw new Error("找不到這位分帳成員，可能已經刪除。");
  }
  await env.ACCOUNTING_DB.prepare(
    `UPDATE ledger_members
      SET status = 'inactive', last_seen_at = ?
      WHERE trip_id = ? AND ledger_id = ? AND user_id = ?`
  )
    .bind(new Date().toISOString(), activeTripId, ledger.ledger_id, normalizedUserId)
    .run();
  await env.ACCOUNTING_DB.prepare(
    `UPDATE settlements
      SET status = 'void', updated_at = ?
      WHERE trip_id = ?
        AND ledger_id = ?
        AND status = 'settled'
        AND (from_user_id = ? OR to_user_id = ?)`
  )
    .bind(new Date().toISOString(), activeTripId, ledger.ledger_id, normalizedUserId, normalizedUserId)
    .run();
  return existing;
}

async function mergeLedgerMember(env, sourceUserId, payload = {}) {
  const activeTripId = tripId(env, payload.tripId || payload.trip);
  const sourceId = String(sourceUserId || "").trim().slice(0, 120);
  const targetId = String(payload.targetUserId || "").trim().slice(0, 120);
  if (!sourceId || !targetId || sourceId === targetId) {
    throw new Error("請選擇不同的來源成員與目標成員。");
  }
  const ledger = resolveLedger(env, {
    expenseScope: "group",
    chatType: payload.chatType,
    groupId: payload.groupId,
    roomId: payload.roomId,
  });
  const source = await getLedgerMember(env, activeTripId, ledger.ledger_id, sourceId);
  const target = await getLedgerMember(env, activeTripId, ledger.ledger_id, targetId);
  if (!source) {
    throw new Error("找不到要合併的來源成員。");
  }
  if (!target || target.status !== "active") {
    throw new Error("找不到合併目標成員。");
  }

  const expenses = await env.ACCOUNTING_DB.prepare(
    `SELECT id, payer_id, split_members
      FROM expenses
      WHERE trip_id = ?
        AND ledger_id = ?
        AND deleted_at IS NULL
        AND COALESCE(expense_scope, 'personal') = 'group'
        AND (payer_id = ? OR split_members LIKE ?)`
  )
    .bind(activeTripId, ledger.ledger_id, sourceId, `%"${sourceId}"%`)
    .all();

  const now = new Date().toISOString();
  for (const expense of expenses.results || []) {
    const splitMembers = mergeSplitMembersJson(expense.split_members, source, target);
    const payerId = expense.payer_id === sourceId ? target.user_id : expense.payer_id;
    const payerName = expense.payer_id === sourceId ? target.display_name : null;
    await env.ACCOUNTING_DB.prepare(
      `UPDATE expenses
        SET payer_id = ?,
            payer_name = COALESCE(?, payer_name),
            split_members = ?,
            updated_at = ?
        WHERE id = ?`
    )
      .bind(payerId, payerName, splitMembers, now, expense.id)
      .run();
  }

  await env.ACCOUNTING_DB.prepare(
    `UPDATE ledger_members
      SET status = 'inactive', last_seen_at = ?
      WHERE trip_id = ? AND ledger_id = ? AND user_id = ?`
  )
    .bind(now, activeTripId, ledger.ledger_id, sourceId)
    .run();

  await env.ACCOUNTING_DB.prepare(
    `UPDATE settlements
      SET status = 'void', updated_at = ?
      WHERE trip_id = ?
        AND ledger_id = ?
        AND status = 'settled'
        AND (from_user_id IN (?, ?) OR to_user_id IN (?, ?))`
  )
    .bind(now, activeTripId, ledger.ledger_id, sourceId, targetId, sourceId, targetId)
    .run();

  return {
    source,
    target,
    updatedExpenses: (expenses.results || []).length,
  };
}

async function getLedgerMember(env, activeTripId, ledgerId, userId) {
  return env.ACCOUNTING_DB.prepare(
    `SELECT user_id, display_name, picture_url, role, status
      FROM ledger_members
      WHERE trip_id = ? AND ledger_id = ? AND user_id = ?
      LIMIT 1`
  )
    .bind(activeTripId, ledgerId, userId)
    .first();
}

function mergeSplitMembersJson(value, source, target) {
  let members = [];
  try {
    const parsed = JSON.parse(value || "[]");
    members = Array.isArray(parsed) ? parsed : [];
  } catch {
    members = [];
  }
  const merged = new Map();
  for (const raw of members) {
    const originalId = String(raw.userId || raw.user_id || "").trim();
    if (!originalId) continue;
    const userId = originalId === source.user_id ? target.user_id : originalId;
    const displayName = originalId === source.user_id ? target.display_name : (raw.displayName || raw.display_name || "未命名成員");
    const previous = merged.get(userId);
    if (previous && raw.amount != null) {
      previous.amount = roundMoney((Number(previous.amount) || 0) + (Number(raw.amount) || 0));
      continue;
    }
    if (previous) continue;
    const item = { userId, displayName };
    if (raw.amount != null) item.amount = roundMoney(Number(raw.amount));
    merged.set(userId, item);
  }
  return JSON.stringify([...merged.values()]);
}

async function listSettlements(env, options = {}) {
  const activeTripId = tripId(env, options.tripId || options.trip);
  const ledger = resolveLedger(env, {
    expenseScope: "group",
    chatType: options.chatType,
    groupId: options.groupId,
    roomId: options.roomId,
  });
  const result = await env.ACCOUNTING_DB.prepare(
    `SELECT *
      FROM settlements
      WHERE trip_id = ? AND ledger_id = ? AND status = 'settled'
      ORDER BY settled_at DESC, id DESC`
  )
    .bind(activeTripId, ledger.ledger_id)
    .all();
  return result.results || [];
}

async function upsertSettlement(env, payload = {}) {
  const item = normalizeSettlement(env, payload);
  await env.ACCOUNTING_DB.prepare(
    `INSERT INTO settlements (
      trip_id, ledger_id, chat_type, chat_id, settlement_key,
      currency_code, currency_label, currency_symbol,
      from_user_id, from_name, to_user_id, to_name, amount,
      status, settled_by_id, settled_by_name, settled_at, updated_at, note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'settled', ?, ?, ?, ?, ?)
    ON CONFLICT(trip_id, ledger_id, settlement_key) DO UPDATE SET
      currency_label = excluded.currency_label,
      currency_symbol = excluded.currency_symbol,
      from_name = excluded.from_name,
      to_name = excluded.to_name,
      amount = excluded.amount,
      status = 'settled',
      settled_by_id = excluded.settled_by_id,
      settled_by_name = excluded.settled_by_name,
      settled_at = excluded.settled_at,
      updated_at = excluded.updated_at,
      note = excluded.note`
  )
    .bind(
      item.trip_id,
      item.ledger_id,
      item.chat_type,
      item.chat_id,
      item.settlement_key,
      item.currency_code,
      item.currency_label,
      item.currency_symbol,
      item.from_user_id,
      item.from_name,
      item.to_user_id,
      item.to_name,
      item.amount,
      item.settled_by_id,
      item.settled_by_name,
      item.settled_at,
      item.updated_at,
      item.note
    )
    .run();
  return getSettlement(env, item.trip_id, item.ledger_id, item.settlement_key);
}

async function deleteSettlement(env, settlementKey, options = {}) {
  const activeTripId = tripId(env, options.tripId || options.trip);
  const ledger = resolveLedger(env, {
    expenseScope: "group",
    chatType: options.chatType,
    groupId: options.groupId,
    roomId: options.roomId,
  });
  const existing = await getSettlement(env, activeTripId, ledger.ledger_id, settlementKey);
  if (!existing) {
    throw new Error("找不到這筆結算紀錄。");
  }
  await env.ACCOUNTING_DB.prepare(
    `DELETE FROM settlements
      WHERE trip_id = ? AND ledger_id = ? AND settlement_key = ?`
  )
    .bind(activeTripId, ledger.ledger_id, settlementKey)
    .run();
  return existing;
}

async function getSettlement(env, activeTripId, ledgerId, settlementKey) {
  return env.ACCOUNTING_DB.prepare(
    `SELECT *
      FROM settlements
      WHERE trip_id = ? AND ledger_id = ? AND settlement_key = ?
      LIMIT 1`
  )
    .bind(activeTripId, ledgerId, settlementKey)
    .first();
}

function normalizeSettlement(env, payload = {}) {
  const activeTripId = tripId(env, payload.tripId || payload.trip);
  const ledger = resolveLedger(env, {
    expenseScope: "group",
    chatType: payload.chatType,
    groupId: payload.groupId,
    roomId: payload.roomId,
  });
  const amount = roundMoney(Number(payload.amount));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("結算金額需大於 0。");
  }
  const currency = currencyInfo(payload.currencyCode);
  const fromUserId = String(payload.fromUserId || "").trim().slice(0, 80);
  const toUserId = String(payload.toUserId || "").trim().slice(0, 80);
  if (!fromUserId || !toUserId || fromUserId === toUserId) {
    throw new Error("結算需要有效的付款人與收款人。");
  }
  const settlementKey = settlementKeyFor({
    currencyCode: currency.code,
    fromUserId,
    toUserId,
    amount,
  });
  const now = new Date().toISOString();
  return {
    trip_id: activeTripId,
    ledger_id: ledger.ledger_id,
    chat_type: ledger.chat_type,
    chat_id: ledger.chat_id,
    settlement_key: settlementKey,
    currency_code: currency.code,
    currency_label: payload.currencyLabel || currency.label,
    currency_symbol: payload.currencySymbol || currency.symbol,
    from_user_id: fromUserId,
    from_name: String(payload.fromName || "").trim().slice(0, 80),
    to_user_id: toUserId,
    to_name: String(payload.toName || "").trim().slice(0, 80),
    amount,
    settled_by_id: String(payload.settledById || "").trim().slice(0, 80),
    settled_by_name: String(payload.settledByName || "").trim().slice(0, 80),
    settled_at: now,
    updated_at: now,
    note: String(payload.note || "").trim().slice(0, 120),
  };
}

function settlementKeyFor(item) {
  return [
    String(item.currencyCode || ""),
    String(item.fromUserId || ""),
    String(item.toUserId || ""),
    roundMoney(Number(item.amount) || 0).toFixed(2),
  ].join("|");
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
  const createdById = String(payload.createdById || payerId).slice(0, 80);
  const createdByName = String(payload.createdByName || payerName).slice(0, 80);
  const createdByPictureUrl = String(payload.createdByPictureUrl || "").trim().slice(0, 500);
  const ledger = resolveLedger(env, {
    expenseScope,
    payerId,
    chatType: payload.chatType,
    groupId: payload.groupId,
    roomId: payload.roomId,
  });
  const split = normalizeSplit(payload, {
    expenseScope,
  });
  return {
    trip_id: tripId(env, payload.tripId || payload.trip),
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
    created_by_id: createdById,
    created_by_name: createdByName,
    created_by_picture_url: createdByPictureUrl,
    split_method: split.method,
    split_members: split.members,
    created_at: new Date().toISOString(),
  };
}

function normalizeSplit(payload, context) {
  if (context.expenseScope !== "group") {
    return { method: "none", members: "" };
  }
  const method = payload.splitMethod === "custom" ? "custom" : "equal";
  const rawMembers = Array.isArray(payload.splitMembers) ? payload.splitMembers : [];
  const members = rawMembers
    .map((member) => normalizeSplitMember(member, method))
    .filter((member) => member.userId);
  const unique = new Map();
  for (const member of members) unique.set(member.userId, member);
  const normalizedMembers = [...unique.values()];
  if (method === "custom") {
    const total = roundMoney(normalizedMembers.reduce((sum, member) => sum + (Number(member.amount) || 0), 0));
    const amount = roundMoney(Number(payload.amount) || 0);
    if (!normalizedMembers.length) {
      throw new Error("請至少選擇一位分攤成員。");
    }
    if (normalizedMembers.some((member) => !Number.isFinite(member.amount) || member.amount <= 0)) {
      throw new Error("指定金額分攤需為每位成員輸入大於 0 的金額。");
    }
    if (Math.abs(total - amount) > 0.01) {
      throw new Error(`指定金額加總需等於消費金額，目前加總為 ${total}。`);
    }
  }
  return {
    method,
    members: JSON.stringify(normalizedMembers),
  };
}

function normalizeSplitMember(member, method) {
  const item = {
    userId: String(member.userId || "").trim().slice(0, 80),
    displayName: String(member.displayName || "").trim().slice(0, 80),
  };
  if (method === "custom") {
    item.amount = roundMoney(Number(member.amount));
  }
  return item;
}

function normalizeExpenseScope(value) {
  return value === "group" ? "group" : "personal";
}

function resolveLedger(env, options = {}) {
  const expenseScope = normalizeExpenseScope(options.expenseScope);
  const payerId = String(options.payerId || "").trim().slice(0, 80);
  const groupId = String(options.groupId || "").trim().slice(0, 120);
  const roomId = String(options.roomId || "").trim().slice(0, 120);

  if (expenseScope !== "group") {
    if (groupId) {
      return {
        chat_type: "group",
        chat_id: groupId,
        ledger_id: `personal:group:${groupId}:user:${payerId || "unknown"}`,
      };
    }

    if (roomId) {
      return {
        chat_type: "room",
        chat_id: roomId,
        ledger_id: `personal:room:${roomId}:user:${payerId || "unknown"}`,
      };
    }

    return {
      chat_type: "user",
      chat_id: payerId,
      ledger_id: `personal:${payerId || "unknown"}`,
    };
  }

  if (groupId) {
    return {
      chat_type: "group",
      chat_id: groupId,
      ledger_id: `group:${groupId}`,
    };
  }

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
  const pictureUrl = String(item.created_by_picture_url || "").trim().slice(0, 500);
  await env.ACCOUNTING_DB.prepare(
    `INSERT INTO ledger_members (
      trip_id, ledger_id, chat_type, chat_id, user_id, display_name, picture_url,
      role, status, joined_at, last_seen_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'member', 'active', ?, ?)
    ON CONFLICT(trip_id, ledger_id, user_id) DO UPDATE SET
      display_name = excluded.display_name,
      picture_url = COALESCE(NULLIF(excluded.picture_url, ''), ledger_members.picture_url),
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
      pictureUrl,
      now,
      now
    )
    .run();
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
    TWD: { code: "TWD", label: "台幣", symbol: "NT$" },
    JPY: { code: "JPY", label: "日幣", symbol: "¥" },
  };
  return currencies[code] || currencies.TWD;
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
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

function tripId(env, value = "") {
  const candidate = String(value || "").trim();
  if (/^[a-zA-Z0-9._-]{3,80}$/.test(candidate)) {
    return candidate;
  }
  return env.TRIP_ID || ACTIVE_TRIP.trip?.trip_id || "2026-05-turkey";
}

function tripName(activeTripId) {
  if (activeTripId === "dev-sandbox") return "開發沙盒旅程";
  if (activeTripId === ACTIVE_TRIP.trip?.trip_id) {
    return ACTIVE_TRIP.trip?.tour_name || "旅行";
  }
  return "旅行";
}

function isDevelopmentTrip(activeTripId) {
  return activeTripId === "dev-sandbox";
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
