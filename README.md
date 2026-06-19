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

## 🏗 Architecture
╔══════════════════════════════════════════════════════════════╗

║                        DROPRUSH                              ║

║                  Flash Sale Platform                         ║

╚══════════════════════════════════════════════════════════════╝
                ┌─────────────────┐
                │   🛍 SHOPPERS   │
                │  (multi-tab)    │
                └────────┬────────┘
                         │ HTTP
                ┌────────▼────────┐
                │   👤 ADMIN      │
                │  (brand panel)  │
                └────────┬────────┘
                         │
      ╔══════════════════▼═══════════════════╗
      ║         VERCEL EDGE NETWORK          ║
      ║                                      ║
      ║  ┌─────────────────────────────────┐ ║
      ║  │    Next.js 15 — App Router      │ ║
      ║  │                                 │ ║
      ║  │  /              → Drop feed     │ ║
      ║  │  /drops/[id]    → Detail page   │ ║
      ║  │  /admin         → Dashboard     │ ║
      ║  └─────────────────────────────────┘ ║
      ║                                      ║
      ║  ┌─────────────────────────────────┐ ║
      ║  │       API Routes                │ ║
      ║  │                                 │ ║
      ║  │  GET  /api/drops         → List │ ║
      ║  │  GET  /api/drops/[id]    → Get  │ ║
      ║  │  POST /api/drops/[id]/claim      │ ║
      ║  │  POST /api/admin/drops   → Create│ ║
      ║  └─────────────────────────────────┘ ║
      ╚══════════════════╦═══════════════════╝
                         ║
                         ║ AWS SDK v3
                         ║
      ╔══════════════════▼═══════════════════╗
      ║         AWS DYNAMODB                 ║
      ║         Single-Table Design          ║
      ║                                      ║
      ║  ┌─────────────────────────────────┐ ║
      ║  │  TABLE: DropRush                │ ║
      ║  │                                 │ ║
      ║  │  PK=DROP#id  SK=META            │ ║
      ║  │  → name, brand, price           │ ║
      ║  │  → totalStock                   │ ║
      ║  │  → remainingStock ◄─────────┐   │ ║
      ║  │                             │   │ ║
      ║  │  PK=DROP#id  SK=CLAIM#uid   │   │ ║
      ║  │  → claimedAt, status        │   │ ║
      ║  └─────────────────────────────┘   │ ║
      ║                                    │ ║
      ║  ┌─────────────────────────────┐   │ ║
      ║  │  GSI1 (Live Drop Feed)      │   │ ║
      ║  │  GSI1PK = STATUS#active     │   │ ║
      ║  │  GSI1SK = startTime#dropId  │   │ ║
      ║  └─────────────────────────────┘   │ ║
      ║                                    │ ║
      ║  ⚡ ATOMIC CLAIM OPERATION ────────┘ ║
      ║                                      ║
      ║  UpdateItem(                         ║
      ║    Key: { PK: DROP#id, SK: META }    ║
      ║    UpdateExpression:                 ║
      ║      SET remainingStock = remainingStock - 1
      ║    ConditionExpression:              ║
      ║      remainingStock > 0              ║
      ║  )                                   ║
      ║                                      ║
      ║  ✅ Success → CLAIMED                ║
      ║  ❌ Fail    → SOLD OUT               ║
      ╚══════════════════════════════════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLAIM FLOW (Race Condition Proof)
User A ──┐

User B ──┤──► DynamoDB Conditional Write

User C ──┤         │

User D ──┘         ▼

┌────────────┐

│ stock = 1  │

└─────┬──────┘

│

┌───────────┴───────────┐

│                       │

User A wins            Users B,C,D

remainingStock=0       ConditionalCheck

CLAIM record written   Failed → SOLD OUT

│

▼

Zero oversells.

Guaranteed.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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