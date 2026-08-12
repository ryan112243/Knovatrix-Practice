# Knovatrix 刷題站

純前端、手機優先的練習網站。題目與作答紀錄均保存在瀏覽器；不需要登入。

## 發布

GitHub Pages 建議從 `main` 分支的根目錄發布，網址為：
`https://ryan112243.github.io/Knovatrix-Practice/`

主網站入口：
`https://ryan112243.github.io/Knovatrix/`

## A-ADS 廣告設定

在 `ads.js` 的 `AADS_UNITS` 填入 A-ADS 後台建立的四個 Ad Unit ID：

- `desktop-left`：160 x 600
- `desktop-right`：160 x 600
- `mobile-top`：320 x 100
- `mobile-bottom`：320 x 100

版面會自動切換：寬於 1180px 時只顯示左右側欄；1180px 以下時只顯示內容上方與題目下方。廣告不採固定浮動，永遠不會遮住作答按鈕。

請在 A-ADS 建立單元時填入已發布的刷題站網址，並把後台提供的 ID 貼入 `ads.js`；網站已使用 A-ADS 的 Adaptive iframe 格式。
