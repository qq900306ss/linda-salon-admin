# Linda Salon 管理後台

Linda Salon 美髮沙龍的管理後台，採用深色玻璃擬態（Glassmorphism）設計風格，支援靜態匯出並部署至 AWS S3 + CloudFront。

## 技術棧

- **Next.js 14**（App Router、靜態匯出 `output: 'export'`）
- **TypeScript**
- **Tailwind CSS** — 深色玻璃擬態主題（玫瑰粉品牌色）
- **framer-motion** — 頁面轉場與微動畫
- **recharts** — 營收圖表
- **lucide-react** — 圖示
- **date-fns** — 日期處理（自製月曆元件）

## 功能頁面

| 路徑 | 功能 |
| --- | --- |
| `/login` | 管理員登入 |
| `/` | 總覽：今日／本週／本月統計、30 天營收趨勢、熱門服務與設計師排行、最近預約 |
| `/calendar` | 月曆檢視預約，點擊日期顯示當日預約清單 |
| `/bookings` | 預約管理：日期／狀態／設計師篩選、確認／完成／取消、顧客明細展開 |
| `/services` | 服務項目卡片管理（含圖片上傳、上下架） |
| `/stylists` | 設計師管理（專長標籤、評分、排班設定、休假日） |
| `/customers` | 顧客列表搜尋與消費紀錄抽屜 |
| `/statistics` | 自訂日期區間營收統計與服務／設計師營收占比 |
| `/settings` | 沙龍基本資訊、營業時間、預約間隔、公休日 |

## 開發環境設定

```bash
# 1. 安裝依賴
npm install

# 2. 設定環境變數
cp .env.local.example .env.local
# 編輯 .env.local，填入後端 API 位址

# 3. 啟動開發伺服器（埠 3001）
npm run dev
```

### 環境變數

| 變數 | 說明 | 預設值 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | 後端 API 位址（不含結尾斜線） | `http://localhost:4000` |

## 建置（靜態匯出）

```bash
npm run build
```

建置完成後，靜態檔案會輸出至 `out/` 目錄，可直接上傳至任何靜態網站主機。

## 部署（S3 + CloudFront 摘要）

1. 將 `out/` 目錄內容同步至 S3 bucket：
   ```bash
   aws s3 sync out/ s3://<your-bucket> --delete
   ```
2. CloudFront 指向該 bucket（建議搭配 OAC），預設根物件設為 `index.html`。
3. 部署後清除 CloudFront 快取：
   ```bash
   aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"
   ```

> 完整部署流程（含 IAM、OAC、自訂網域與 HTTPS 設定）請參閱 API 倉庫中的 `AWS-DEPLOYMENT-GUIDE.md`。

## 認證機制

- 登入後 JWT 儲存於 `localStorage`（key：`linda_admin_token`），所有管理 API 以 `Authorization: Bearer` 夾帶。
- 收到 `401` 時自動清除 token 並導回 `/login`。
