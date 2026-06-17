import { ACTIVE_TRIP, FLEX_MESSAGES, TRIPS } from "./trip-data.js";
import { accountingPage } from "./accounting-page.js";

const COMMANDS = {
  today: new Set(["今日行程", "今天行程", "today"]),
  tomorrow: new Set(["明日行程", "明天行程", "tomorrow"]),
  accounting: new Set(["阿珠", "阿珠媽", "珠珠", "豬豬", "記帳本", "記帳", "旅行記帳本", "accounting"]),
};

const AVAILABLE_TRIPS = tripSummariesFromTrips(TRIPS);

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
    if (url.pathname === "/settings") {
      return new Response(settingsPage(), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    if (url.pathname === "/itinerary") {
      return new Response(itineraryPage(url), {
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
    const context = chatContextFromEvent(event);
    return travelToolsFlex({
      activeTripId,
      accountingUrl,
      itineraryUrl: itineraryUrlForTrip(env, activeTripId),
      settingsUrl: settingsUrlForTrip(env, activeTripId, context),
    });
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

function settingsUrlForTrip(env, activeTripId, chatContext = {}) {
  const params = new URLSearchParams({ trip: activeTripId });
  if (chatContext.chatType) params.set("chatType", chatContext.chatType);
  if (chatContext.groupId) params.set("groupId", chatContext.groupId);
  if (chatContext.roomId) params.set("roomId", chatContext.roomId);
  return `${workerBaseUrl(env)}/settings?${params.toString()}`;
}

function itineraryUrlForTrip(env, activeTripId) {
  const trip = tripInfo(activeTripId);
  if (trip?.itineraryUrl) return trip.itineraryUrl;
  const params = new URLSearchParams({ trip: activeTripId });
  return `${workerBaseUrl(env)}/itinerary?${params.toString()}`;
}

function workerBaseUrl(env) {
  return env.WORKER_BASE_URL || "https://lize-tour-bot-webhook.retniw72.workers.dev";
}

function tripSummariesFromTrips(trips = {}) {
  return Object.values(trips)
    .map((trip) => {
      const meta = trip.trip || {};
      return {
        tripId: meta.trip_id || "",
        tripName: meta.tour_name || meta.trip_id || "旅行",
        startDate: meta.start_date || "",
        endDate: meta.end_date || "",
        itineraryUrl: meta.itinerary_url || "",
      };
    })
    .filter((trip) => trip.tripId && !isDevelopmentTrip(trip.tripId))
    .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
}

function settingsPage() {
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>旅程設定</title>
  <style>
    :root { color-scheme: light; --green: #15803d; --ink: #1f2937; --muted: #667085; --line: #e5e7eb; --bg: #f7f8fa; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--ink); background: var(--bg); }
    main { max-width: 560px; margin: 0 auto; padding: 20px 16px 32px; }
    h1 { margin: 0 0 8px; font-size: 24px; line-height: 1.25; }
    .note { margin: 0 0 18px; color: var(--muted); line-height: 1.5; }
    .status, .trip { background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 14px; margin-bottom: 12px; }
    .label { color: var(--muted); font-size: 13px; margin-bottom: 4px; }
    .value { font-weight: 700; line-height: 1.4; }
    .trip { display: grid; gap: 10px; }
    .trip-title { font-size: 17px; font-weight: 700; }
    .trip-dates { color: var(--muted); font-size: 14px; }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; }
    button, a.button { appearance: none; border: 1px solid var(--green); background: var(--green); color: #fff; border-radius: 7px; padding: 10px 12px; font-weight: 700; text-decoration: none; font-size: 15px; }
    button.secondary, a.button.secondary { background: #fff; color: var(--green); }
    button:disabled { opacity: .55; }
    .message { min-height: 22px; color: var(--muted); line-height: 1.5; margin-top: 12px; }
  </style>
</head>
<body>
  <main>
    <h1>旅程設定</h1>
    <p class="note">設定這個 LINE 群組目前使用的旅程。切換後，完整行程與旅行記帳本會一起切到該旅程；不同群組的帳本仍會分開保存。</p>
    <section class="status">
      <div class="label">目前旅程</div>
      <div class="value" id="activeTrip">讀取中...</div>
    </section>
    <section id="trips"></section>
    <div class="message" id="message"></div>
  </main>
  <script>
    const params = new URLSearchParams(location.search);
    const chatType = params.get("chatType") || "";
    const groupId = params.get("groupId") || "";
    const roomId = params.get("roomId") || "";
    const explicitTrip = params.get("trip") || params.get("tripId") || "";
    const state = { trips: [], activeTripId: explicitTrip };

    function setMessage(text) {
      document.getElementById("message").textContent = text || "";
    }

    function render() {
      const active = state.trips.find((trip) => trip.tripId === state.activeTripId);
      document.getElementById("activeTrip").textContent = active ? active.tripName : state.activeTripId || "目前無資料，開始著手規劃下一趟旅程吧 :D";
      const list = document.getElementById("trips");
      list.innerHTML = "";
      if (!state.trips.length) {
        const empty = document.createElement("article");
        empty.className = "trip";
        empty.textContent = "目前無資料，開始著手規劃下一趟旅程吧 :D";
        list.appendChild(empty);
      }
      for (const trip of state.trips) {
        const card = document.createElement("article");
        card.className = "trip";
        const title = document.createElement("div");
        title.className = "trip-title";
        title.textContent = trip.tripName;
        const dates = document.createElement("div");
        dates.className = "trip-dates";
        dates.textContent = trip.startDate + " - " + trip.endDate;
        const actions = document.createElement("div");
        actions.className = "actions";
        const button = document.createElement("button");
        button.textContent = trip.tripId === state.activeTripId ? "目前使用中" : "設為目前旅程";
        button.disabled = trip.tripId === state.activeTripId || !chatType || (!groupId && !roomId);
        button.addEventListener("click", () => saveTrip(trip.tripId));
        actions.appendChild(button);
        const link = document.createElement("a");
        link.className = "button secondary";
        link.href = "/itinerary?trip=" + encodeURIComponent(trip.tripId);
        link.textContent = "查看行程";
        actions.appendChild(link);
        card.append(title, dates, actions);
        list.appendChild(card);
      }
      if (!chatType || (!groupId && !roomId)) {
        setMessage("缺少群組資訊。請從 LINE 群組中的「旅程設定」按鈕開啟，才可以切換旅程。");
      }
    }

    async function load() {
      try {
        const tripResponse = await fetch("/api/trips");
        const tripPayload = await tripResponse.json();
        state.trips = tripPayload.trips || [];
        if (chatType && (groupId || roomId)) {
          const settingParams = new URLSearchParams({ chatType });
          if (groupId) settingParams.set("groupId", groupId);
          if (roomId) settingParams.set("roomId", roomId);
          const settingResponse = await fetch("/api/group-trip-setting?" + settingParams.toString());
          const setting = await settingResponse.json();
          state.activeTripId = setting.activeTripId || state.activeTripId;
        }
        render();
      } catch (error) {
        setMessage("讀取旅程設定失敗：" + (error.message || "未知錯誤"));
      }
    }

    async function saveTrip(tripId) {
      setMessage("儲存中...");
      try {
        const response = await fetch("/api/group-trip-setting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tripId, chatType, groupId, roomId })
        });
        const payload = await response.json();
        if (!response.ok || payload.error) throw new Error(payload.error || "儲存失敗");
        state.activeTripId = payload.setting.activeTripId;
        setMessage("已切換為「" + payload.setting.activeTripName + "」。");
        render();
      } catch (error) {
        setMessage("儲存失敗：" + (error.message || "未知錯誤"));
      }
    }

    load();
  </script>
</body>
</html>`;
}

function itineraryPage(url) {
  const activeTripId = tripId({}, url.searchParams.get("trip") || url.searchParams.get("tripId"));
  const tripData = tripDataForId(activeTripId);
  const meta = tripData?.trip || {};
  const title = meta.tour_name || tripName(activeTripId);
  const dateText = meta.start_date && meta.end_date ? `${meta.start_date} - ${meta.end_date}` : "";
  const days = Array.isArray(tripData?.daily_itinerary) ? tripData.daily_itinerary : [];
  const dayList = days.length
    ? days.map(renderItineraryDay).join("")
    : `<section class="empty">目前無資料，開始著手規劃下一趟旅程吧 :D</section>`;
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; --ink: #1f2937; --muted: #667085; --line: #e5e7eb; --bg: #f7f8fa; --green: #15803d; --soft: #ecfdf3; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--ink); background: var(--bg); }
    main { max-width: 760px; margin: 0 auto; padding: 20px 14px 36px; }
    h1 { margin: 0 0 6px; font-size: 25px; line-height: 1.25; }
    .date { color: var(--muted); margin-bottom: 18px; }
    .day { background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 16px; margin-bottom: 14px; }
    .day h2 { margin: 0 0 6px; font-size: 20px; line-height: 1.35; }
    .theme { color: var(--green); font-weight: 700; margin-bottom: 8px; }
    .route { color: var(--muted); line-height: 1.45; margin-bottom: 14px; }
    .section { border-top: 1px solid var(--line); padding-top: 12px; margin-top: 12px; }
    .section h3 { margin: 0 0 8px; font-size: 16px; }
    ul { margin: 0; padding-left: 19px; line-height: 1.55; }
    li { margin: 0 0 6px; }
    .spot { border: 1px solid var(--line); border-radius: 8px; padding: 10px; margin-bottom: 8px; }
    .spot-title { font-weight: 700; line-height: 1.4; margin-bottom: 6px; }
    .buttons { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .button { display: inline-block; border: 1px solid var(--green); border-radius: 999px; padding: 6px 10px; color: var(--green); text-decoration: none; font-size: 13px; font-weight: 700; background: #fff; }
    .pill { display: inline-block; background: var(--soft); color: var(--green); border-radius: 999px; padding: 3px 8px; font-size: 12px; font-weight: 700; margin-right: 6px; }
    .empty { background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 16px; line-height: 1.6; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <div class="date">${escapeHtml(dateText)}</div>
    ${dayList}
  </main>
</body>
</html>`;
}

function tripDataForId(activeTripId) {
  return TRIPS?.[activeTripId] || (activeTripId === ACTIVE_TRIP.trip?.trip_id ? ACTIVE_TRIP : null);
}

function renderItineraryDay(day) {
  return `<article class="day">
    <h2>Day ${escapeHtml(day.day)}｜${escapeHtml(day.date)}（${escapeHtml(day.weekday || "")}）</h2>
    ${day.theme ? `<div class="theme">${escapeHtml(day.theme)}</div>` : ""}
    ${day.route ? `<div class="route">${escapeHtml(day.route)}</div>` : ""}
    ${renderLinkedList("今日重點", day.highlights || day.activities)}
    ${renderSights(day.sights)}
    ${renderLinkedList("交通", day.transportation)}
    ${renderLinkedList("晚間安排", day.evening)}
    ${renderMeals(day.meals)}
    ${renderLinkedList("午餐建議", day.lunch_suggestions)}
    ${renderLinkedList("點心推薦", day.snack_suggestions)}
    ${renderLinkedList("自駕資訊", day.driving || day.driving_time)}
    ${renderLinkedList("停車場建議", day.parking)}
    ${renderLinkedList("建議時程", day.schedule)}
    ${renderHotel(day.hotel)}
    ${renderLinkedList("備註", day.notes)}
    ${renderLinkedList("返國提醒", day.return_notes)}
  </article>`;
}

function renderSights(sights = []) {
  if (!Array.isArray(sights) || !sights.length) return "";
  const spots = sights.map((spot) => {
    const links = spot.links || (spot.google_maps_url ? [{ label: "Google Maps", url: spot.google_maps_url }] : []);
    return `<div class="spot">
      <div class="spot-title">${escapeHtml(spot.title || spot.name || "")}</div>
      ${renderLinkedList("", spot.items, false)}
      ${renderButtons(links)}
    </div>`;
  }).join("");
  return `<section class="section"><h3>景點</h3>${spots}</section>`;
}

function renderMeals(meals) {
  if (!meals) return "";
  if (Array.isArray(meals)) return renderLinkedList("餐食", meals);
  const labels = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐" };
  const items = Object.entries(labels)
    .filter(([key]) => meals[key])
    .map(([key, label]) => ({ text: `${label}：${meals[key]}`, links: [] }));
  return renderLinkedList("餐食", items);
}

function renderHotel(hotel) {
  if (!hotel) return "";
  if (Array.isArray(hotel)) return renderLinkedList("住宿", hotel);
  const links = hotel.google_maps_url ? [{ label: "Google Maps", url: hotel.google_maps_url }] : [];
  return renderLinkedList("住宿", [{ text: hotel.name || "", links }]);
}

function renderLinkedList(title, items = [], wrap = true) {
  if (!Array.isArray(items) || !items.length) return "";
  const body = `<ul>${items.map(renderLinkedItem).join("")}</ul>`;
  if (!wrap) return body;
  return `<section class="section">${title ? `<h3>${escapeHtml(title)}</h3>` : ""}${body}</section>`;
}

function renderLinkedItem(item) {
  if (typeof item === "string") return `<li>${escapeHtml(item)}</li>`;
  if (item?.from || item?.to) {
    const text = `${item.from || ""} → ${item.to || ""}${item.duration ? `：${item.duration}` : ""}`;
    return `<li>${escapeHtml(text)}</li>`;
  }
  const text = item?.text || item?.name || "";
  return `<li>${escapeHtml(text)}${renderButtons(item?.links || [])}</li>`;
}

function renderButtons(links = []) {
  const validLinks = (links || []).filter((link) => link?.url);
  if (!validLinks.length) return "";
  return `<div class="buttons">${validLinks.map((link) => {
    const label = normalizeLinkLabel(link.label);
    return `<a class="button" href="${escapeHtml(link.url)}">${escapeHtml(label)}</a>`;
  }).join("")}</div>`;
}

function normalizeLinkLabel(label) {
  if (!label || label === "開啟地圖") return "Google Maps";
  return label;
}

function travelToolsFlex(options = {}) {
  const activeTripId = options.activeTripId || "";
  return {
    type: "flex",
    altText: "阿珠媽旅行工具",
    contents: {
      type: "bubble",
      size: "mega",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          { type: "text", text: "阿珠媽旅行工具", weight: "bold", size: "xl", wrap: true },
          { type: "text", text: tripName(activeTripId), size: "sm", color: "#667085", wrap: true },
          {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            margin: "lg",
            contents: [
              flexUriButton("旅行記帳本", options.accountingUrl),
              flexUriButton("完整行程", options.itineraryUrl),
              flexUriButton("旅程設定", options.settingsUrl),
            ],
          },
        ],
      },
    },
  };
}

function flexUriButton(label, uri) {
  return {
    type: "button",
    style: "primary",
    height: "sm",
    action: {
      type: "uri",
      label,
      uri,
    },
  };
}

async function activeTripIdForEvent(env, event) {
  const context = chatContextFromEvent(event);
  const chatType = context.chatType;
  const chatId = context.groupId || context.roomId || "";
  const defaultTripId = tripId(env);
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

    if (url.pathname === "/api/trips" && request.method === "GET") {
      return jsonResponse({ trips: AVAILABLE_TRIPS });
    }

    if (!env.ACCOUNTING_DB) {
      return jsonResponse({ error: "Cloudflare D1 尚未綁定 ACCOUNTING_DB。" }, 503);
    }

    if (url.pathname === "/api/group-trip-setting" && request.method === "GET") {
      const chatType = url.searchParams.get("chatType") || "";
      const chatId = url.searchParams.get("groupId") || url.searchParams.get("roomId") || "";
      return jsonResponse(await getGroupTripSetting(env, { chatType, chatId }));
    }

    if (url.pathname === "/api/group-trip-setting" && request.method === "POST") {
      const payload = await request.json();
      return jsonResponse({
        setting: await saveGroupTripSetting(env, payload),
      });
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
      const expense = await deleteExpense(env, Number(expenseIdMatch[1]), {
        tripId: url.searchParams.get("trip") || url.searchParams.get("tripId") || "",
      });
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

async function getGroupTripSetting(env, options = {}) {
  const chatType = normalizeChatType(options.chatType);
  const chatId = String(options.chatId || "").trim();
  const fallbackTripId = tripId(env);
  if (!chatType || !chatId) {
    return {
      chatType,
      chatId: "",
      activeTripId: fallbackTripId,
      activeTripName: tripName(fallbackTripId),
      hasGroupContext: false,
    };
  }

  const setting = await env.ACCOUNTING_DB.prepare(
    `SELECT active_trip_id, updated_by_user_id, updated_at
      FROM group_trip_settings
      WHERE chat_type = ? AND chat_id = ?
      LIMIT 1`
  )
    .bind(chatType, chatId)
    .first();
  const activeTripId = tripId(env, setting?.active_trip_id || fallbackTripId);
  return {
    chatType,
    chatId,
    activeTripId,
    activeTripName: tripName(activeTripId),
    updatedByUserId: setting?.updated_by_user_id || "",
    updatedAt: setting?.updated_at || "",
    hasGroupContext: true,
  };
}

async function saveGroupTripSetting(env, payload = {}) {
  const chatType = normalizeChatType(payload.chatType);
  const chatId = String(payload.groupId || payload.roomId || payload.chatId || "").trim();
  const activeTripId = tripId(env, payload.tripId || payload.trip);
  if (!chatType || !chatId) {
    throw new Error("缺少 LINE 群組或聊天室資訊，請從群組中的旅程設定按鈕開啟。");
  }
  if (!tripInfo(activeTripId)) {
    throw new Error("這個旅程尚未開放設定。");
  }

  const now = new Date().toISOString();
  const updatedByUserId = String(payload.userId || "").trim().slice(0, 80);
  await env.ACCOUNTING_DB.prepare(
    `INSERT INTO group_trip_settings (
      chat_type, chat_id, active_trip_id, updated_by_user_id, updated_at
    ) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(chat_type, chat_id) DO UPDATE SET
      active_trip_id = excluded.active_trip_id,
      updated_by_user_id = excluded.updated_by_user_id,
      updated_at = excluded.updated_at`
  )
    .bind(chatType, chatId, activeTripId, updatedByUserId, now)
    .run();

  return getGroupTripSetting(env, { chatType, chatId });
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
  const existing = await getEditableExpense(env, id, { tripId: payload.tripId || payload.trip || "" });
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

async function deleteExpense(env, id, options = {}) {
  const existing = await getEditableExpense(env, id, options);
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

async function getEditableExpense(env, id, options = {}) {
  const activeTripId = tripId(env, options.tripId || options.trip);
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

function normalizeChatType(value) {
  return ["group", "room", "user"].includes(value) ? value : "";
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
  return defaultTripId(env);
}

function defaultTripId(env = {}) {
  const nearest = nearestAvailableTripId();
  if (nearest) return nearest;
  const envTripId = String(env.TRIP_ID || "").trim();
  if (envTripId && !isDevelopmentTrip(envTripId)) return envTripId;
  return ACTIVE_TRIP.trip?.trip_id || "2026-05-turkey";
}

function nearestAvailableTripId(todayText = formatLocalDate(new Date())) {
  const trips = AVAILABLE_TRIPS.filter((trip) => trip.startDate && trip.endDate);
  const active = trips
    .filter((trip) => trip.startDate <= todayText && trip.endDate >= todayText)
    .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)))[0];
  if (active) return active.tripId;

  const future = trips
    .filter((trip) => trip.startDate >= todayText)
    .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)))[0];
  if (future) return future.tripId;

  const past = trips
    .filter((trip) => trip.endDate < todayText)
    .sort((a, b) => String(b.endDate).localeCompare(String(a.endDate)))[0];
  return past?.tripId || "";
}

function tripName(activeTripId) {
  if (activeTripId === "dev-sandbox") return "開發沙盒旅程";
  const trip = tripInfo(activeTripId);
  if (trip) return trip.tripName;
  if (activeTripId === ACTIVE_TRIP.trip?.trip_id) {
    return ACTIVE_TRIP.trip?.tour_name || "旅行";
  }
  return "旅行";
}

function tripInfo(activeTripId) {
  return AVAILABLE_TRIPS.find((trip) => trip.tripId === activeTripId) || null;
}

function isDevelopmentTrip(activeTripId) {
  return activeTripId === "dev-sandbox";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
