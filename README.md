<div align="center">

# ⚡ DROPRUSH

### Flash Drops. Atomic Inventory. Zero Oversells.

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)
![AWS DynamoDB](https://img.shields.io/badge/AWS_DynamoDB-4053D6?style=for-the-badge&logo=amazondynamodb&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

**H0 Hackathon — Track 1: Monetizable B2C App**


</div>

---

## 🎯 The Problem

Every major sneaker drop, limited merch release, or flash sale suffers the same failure: **overselling**. Multiple users hit "Buy" at the same millisecond — and all of them succeed. Orders get cancelled, trust breaks down, brands lose credibility.

## ⚡ Our Solution

DropRush guarantees **zero oversells** using a single atomic DynamoDB write:

```js
UpdateItem({
  UpdateExpression: "SET remainingStock = remainingStock - :one",
  ConditionExpression: "remainingStock > :zero"
})
```

If 1000 users race to claim the last item — **exactly 1 wins**. No locks. No queues. No oversells. Ever.

---


# 🏗️ DropRush Architecture

## Overview

```text
╔════════════════════════════════════════════════════════════════════╗
║                            DROPRUSH                              ║
║                    Real-Time Flash Sale Platform                 ║
╚════════════════════════════════════════════════════════════════════╝

                         ┌─────────────────┐
                         │ 🛍️  SHOPPERS   │
                         │ Multi-tab Users │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ 👤 BRAND ADMIN  │
                         │ Product Control │
                         └────────┬────────┘
                                  │
                                  ▼

╔════════════════════════════════════════════════════════════════════╗
║                      VERCEL EDGE NETWORK                         ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  Next.js 15 (App Router)                                           ║
║  ├─ /                → Live Drop Feed                              ║
║  ├─ /drops/[id]      → Product Details                             ║
║  └─ /admin           → Brand Dashboard                             ║
║                                                                    ║
║  API Layer                                                        ║
║  ├─ GET  /api/drops                                               ║
║  ├─ GET  /api/drops/[id]                                          ║
║  ├─ POST /api/drops/[id]/claim                                    ║
║  └─ POST /api/admin/drops                                         ║
║                                                                    ║
╚═══════════════════════════════╦════════════════════════════════════╝
                                ║
                                ▼
                     AWS DynamoDB (Single Table)


---

## Claim Flow

```text
User A ──┐
User B ──┤
User C ──┤──► DynamoDB Conditional Write
User D ──┘

                 stock = 1
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼

      User A Wins          Users B,C,D Lose

 remainingStock = 0      ConditionalCheckFailed

 Claim Saved             SOLD OUT
```

---

## Why It Works

### Problem

Multiple users may click **Claim** at exactly the same moment.

Without protection:

* Stock = 1
* Four users claim simultaneously
* Four orders get created
* Overselling occurs

### Solution

DynamoDB Conditional Writes guarantee:

```text
remainingStock > 0
```

Only one request can decrement inventory successfully.

All other requests automatically fail.



---

## Scalability

* Vercel Edge handles global traffic spikes
* DynamoDB scales automatically
* Conditional writes maintain consistency under heavy load
* No distributed locks required

**Result:** Thousands of users can compete for limited stock without inventory corruption.



---

## 🛠 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Next.js 15 + TypeScript | App Router, Server Actions |
| **UI Scaffold** | Vercel v0 | Rapid UI generation |
| **Deployment** | Vercel | Edge network, instant deploys |
| **Database** | AWS DynamoDB | Atomic writes, infinite scale |
| **Design** | Custom dark theme | Tailwind + CSS variables |

---

## 🗄 DynamoDB Single-Table Design

| Entity | PK | SK | Key Attributes |
|---|---|---|---|
| Drop metadata | `DROP#<dropId>` | `META` | name, brand, price, totalStock, **remainingStock**, startTime |
| Claim record | `DROP#<dropId>` | `CLAIM#<userId>` | claimedAt, status |

**GSI1** — Powers the live drop feed:
- `GSI1PK` = `STATUS#active`
- `GSI1SK` = `<startTimeISO>#<dropId>`

---

## 📱 Pages

| URL | Who | What |
|---|---|---|
| `/` | Shoppers | Live feed, countdown timers, claim button |
| `/drops/[id]` | Shoppers | Drop detail, live stock bar, atomic claim |
| `/admin` | Brand | Stats dashboard, drops table, create form |

---

## 💰 Business Model

- **Commission** — 5-10% per successful drop transaction
- **Listing fee** — Brands pay to list exclusive drops
- **Featured placement** — Premium spots for high-demand drops
- **Analytics** — Real-time claim data sold back to brands

---

## 🚀 Local Setup

```bash
npm install
cp .env.local.example .env.local
node scripts/setup-dynamo.mjs
node scripts/seed.mjs
npm run dev
```

---

## 🔑 Environment Variables

```bash
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
DROPRUSH_TABLE_NAME=DropRush
```

---

## 🏆 Why DropRush Wins

| Criteria | How We Nail It |
|---|---|
| **Technical** | DynamoDB conditional writes solve a real distributed systems problem |
| **Design** | Dark, high-contrast UI built for urgency and scarcity |
| **Impact** | Real monetizable B2C — brands + shoppers both win |
| **Originality** | Race condition as a feature, not a bug |

---

<div align="center">

Built with ⚡ for the **H0: Hack the Zero Stack with Vercel v0 and AWS Databases** — [Hackathon](https://h01.devpost.com/?ref_content=featured&ref_feature=challenge&ref_medium=portfolio&_gl=1*1rkifi5*_gcl_au*MTM2NjE0NzQ2OS4xNzgwOTIxOTAx*_ga*MTU4NzI3MzA4OC4xNzgwOTIxOTAx*_ga_0YHJK3Y10M*czE3ODE3ODc3MzIkbzI5JGcxJHQxNzgxNzg3NzU4JGozNCRsMCRoMA..)

*Powered by AWS DynamoDB + Vercel*

</div>