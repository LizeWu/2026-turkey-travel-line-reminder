# 天氣預報功能

## 功能

每日行程提醒會在發送當下查詢目的地天氣，並在 LINE Flex Message 中加入 `天氣` 區塊。

Rich Menu 的 `今日行程`、`明日行程` 也會在點擊當下查詢天氣。

## 資料來源

使用 Open-Meteo Forecast API：

- 免 API key。
- 適合私人、非商業用途。
- 支援全球天氣預報。
- 最長可查詢約 16 天預報。

查詢欄位：

- `weather_code`
- `temperature_2m_max`
- `temperature_2m_min`
- `precipitation_probability_max`

## 行程資料欄位

每一天行程可設定 `weather_location`：

```json
"weather_location": {
  "name": "卡帕多奇亞",
  "latitude": 38.6431,
  "longitude": 34.8283
}
```

顯示格式：

```text
天氣：
卡帕多奇亞：陰天，8-20°C，降雨機率 30%
```

## 限制

- 天氣是即時外部資料，可能因 API 暫時失敗而缺席。
- 若查詢失敗，行程仍會正常發送，只是不顯示天氣。
- 太遠的未來日期可能尚未有預報資料，通常接近旅行日期時才會準確。
