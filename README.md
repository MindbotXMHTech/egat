# IHAMS Web — Next.js Frontend
**Integrated Health of Assets Management System**
กฟผ. ฝ่ายระบบสื่อสาร (อรส.)

## Tech Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** (EGAT CI design tokens)
- **Recharts** (interactive charts)
- **Lucide React** (icons)
- **Mock Data** (no backend required)

## วิธีติดตั้งและรัน

### ต้องการ
- Node.js 18+ → https://nodejs.org

### คำสั่ง
```bash
cd ihams-web
npm install
npm run dev
```
เปิดเบราว์เซอร์: **http://localhost:3000**

## โครงสร้างไฟล์
```
ihams-web/
├── app/
│   ├── dashboard/
│   │   ├── page.jsx          # Overview Dashboard
│   │   ├── anomaly/          # M1 Anomaly Detection
│   │   ├── predictive/       # M2 Predictive Maintenance
│   │   ├── rca/              # M3 Root Cause Analysis
│   │   ├── health/           # M4 Health Score
│   │   └── lifecycle/        # M5 Asset Lifecycle
├── components/               # Shared UI components
└── lib/
    ├── data.js               # Mock data (ปรับแก้ได้)
    └── utils.js              # Color helpers
```

## EGAT Design System
- **Primary**: Navy `#1B3A6B` / Dark `#0D2240`
- **Accent**: Gold `#E8960C`
- **Background**: `#F0F4F8`
- **Font**: IBM Plex Sans Thai + Inter
# egat
