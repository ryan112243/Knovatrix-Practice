# Knovatrix 刷題站

可依學段、科目、單元與題型建立專屬練習任務的純前端題庫工作台。

## 主要頁面

- 總覽：題庫規模、學段入口與練習紀錄摘要。
- 題庫：只顯示已完成題目化且能自動批改的題目。
- 建立任務：依「學段 → 科目 → 單元 → 題型／題數」逐步建立練習。
- 練習紀錄：作答數、答對數與正確率。

## 題庫收錄原則

外部 PDF 需完成「題面、答案、題型、解說」結構化後才會加入互動題庫。沒有答案、屬於多重選擇、計算證明或尚待核對的資料不會先顯示為可作答題目。

## 發布

GitHub Pages 使用 `main` 分支根目錄，網址：
`https://ryan112243.github.io/Knovatrix-Practice/`

## 廣告設定

`ads.js` 支援 A-ADS、Adsterra 與自有廣告。只會從已填妥資料的來源中隨機選擇：

- 每次開啟網站時，各版位隨機選擇一個可用來源，該次瀏覽期間維持不變。
- 自有廣告可輪替，預設每 45 秒更換；第三方廣告不做自動刷新。
- 桌面使用 `desktop-left`、`desktop-right`，建議 160 x 600。
- 手機使用 `mobile-top`、`mobile-bottom`，建議 320 x 50 或平台提供的自適應格式。
- 1180px 以下只顯示內容上方與題目下方，廣告不固定浮動、不遮住作答控制。

A-ADS：將四個 Ad Unit ID 填入 `AD_CONFIG.providers.aads.units`。

Adsterra：依後台提供的廣告程式碼，把每個版位的 `key`、`scriptUrl`、`width`、`height` 填入 `AD_CONFIG.providers.adsterra.units`。

自有廣告：在 `AD_CONFIG.providers.house.ads` 加入物件：

```js
{ title: "廣告標題", text: "簡短說明", href: "https://example.com", image: "https://example.com/ad.jpg" }
```

若加入多筆，自有廣告會依 `houseRotationMs` 輪替；設為 `0` 可停用輪替。
