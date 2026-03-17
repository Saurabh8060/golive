# 🚀 GoLiveHub — Stock Sentiment Dashboard

🔗 **Live Demo:** https://golivehub.vercel.app/

GoLiveHub is a web dashboard that visualizes sentiment from financial news for a given stock keyword.
It consumes a backend API and presents sentiment insights through charts, KPIs, and article-level data.

---

## 🧠 What It Does

* Search for a stock (e.g., `AAPL`, `TSLA`)
* Fetch recent news sentiment data from an API
* Display:

  * Sentiment distribution (positive / neutral / negative)
  * Sentiment trends over time
  * Latest articles with confidence scores
* Request sentiment reports via email

---

## 🛠️ Tech Stack

**Frontend**

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Recharts

**Architecture**

* API-driven frontend
* Service layer for API calls
* Typed data models

---

## 📂 Project Structure

```
├── app/                # Next.js entry and layout
├── components/         # Dashboard UI
├── services/           # API calls
├── types/              # Data models
└── next.config.ts
```

---

## ⚙️ Running Locally

### Install dependencies

```
npm install
```

### Set environment variable

Create `.env.local`:

```
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

### Start development server

```
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 🔌 API Endpoints

### GET `/dashboard?keyword=XYZ`

Returns aggregated sentiment data including KPIs, trends, and articles.

---

### POST `/email/request`

Request payload:

```
{
  "keyword": "AAPL",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "email": "user@example.com",
  "max_records": 1000
}
```

Queues a sentiment report to be sent via email.

---

## 📊 Dashboard Components

* KPI summary cards
* Sentiment distribution chart
* Trend line chart
* News table with sentiment + confidence

---

## ⚠️ Limitations

* Requires backend API
* Sentiment output depends on model accuracy
* Focused on recent data

---

## 👤 Author

Saurabh Manchanda
