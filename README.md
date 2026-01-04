# 琳達髮廊管理後台 (Linda Salon Admin)

琳達髮廊的管理後台系統，提供預約管理、統計報表、服務設定等功能。

## 功能特色

- 📊 **儀表板** - 即時統計數據與營收分析
- 📅 **行事曆** - 視覺化預約排程管理
- 📋 **預約管理** - 查詢、確認、取消預約
- 💇‍♀️ **服務管理** - 管理服務項目與價格
- 👥 **設計師管理** - 設計師資料與排班
- 👤 **會員管理** - 客戶資料管理
- 📈 **統計報表** - 詳細業績分析

## 技術棧

- **框架**: Next.js 14 with TypeScript
- **樣式**: Tailwind CSS
- **行事曆**: React Big Calendar
- **日期處理**: date-fns
- **部署**: AWS Amplify

## 本地開發

1. 安裝依賴：
```bash
npm install
```

2. 啟動開發伺服器：
```bash
npm run dev
```

3. 在瀏覽器中打開 [http://localhost:3001](http://localhost:3001)

## 專案結構

```
linda-salon-admin/
├── pages/                    # Next.js 頁面
│   ├── index.tsx            # 儀表板
│   ├── calendar.tsx         # 行事曆
│   ├── bookings/            # 預約管理
│   ├── services/            # 服務管理
│   └── stylists/            # 設計師管理
├── components/              # React 元件
│   ├── Layout/              # 佈局元件
│   ├── Dashboard/           # 儀表板元件
│   └── Calendar/            # 行事曆元件
├── data/                    # 模擬資料
│   ├── mockBookings.ts
│   └── mockStatistics.ts
├── styles/                  # 全域樣式
│   └── globals.css
└── types/                   # TypeScript 型別（從 api-spec 複製）
```

## 頁面說明

### 儀表板 (/)
- 今日/本週/本月預約統計
- 營收趨勢圖表
- 熱門服務排行
- 設計師業績排行
- 最新預約列表

### 行事曆 (/calendar)
- 月/週/日視圖切換
- 視覺化預約排程
- 點擊查看預約詳情
- 預約狀態顏色標示：
  - 🟡 黃色：待確認
  - 🟢 綠色：已確認
  - ⚫ 灰色：已完成
  - 🔴 紅色：已取消

## 資料來源

目前使用模擬資料（mock data），未來將串接真實 API。

資料定義參考：`../linda-salon-api-spec/`

## 部署到 AWS Amplify

1. 將專案推送到 GitHub
2. 登入 AWS Amplify Console
3. 選擇「New app」→「Host web app」
4. 連接 GitHub repository
5. 建置設定會自動偵測 Next.js
6. 部署

## 相關專案

- **用戶端前台**: `../beauty-salon-booking`
- **API 規格文件**: `../linda-salon-api-spec`
- **API 後端**: 待建立

## 授權

MIT License
