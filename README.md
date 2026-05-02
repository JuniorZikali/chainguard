# ChainGuard — AI-Powered Smart Contract Auditor (v2)

> **HIT Honours Project · Information Security & Assurance · 2025**  
> Built with Next.js · Deployed on Vercel · Supabase PostgreSQL · Groq AI

---

## 🚀 Quick Deploy (15 minutes)

### Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Go to **SQL Editor** → paste the entire contents of `supabase/schema.sql` → **Run**
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2 — Get Groq API Key (free)

1. Go to [console.groq.com](https://console.groq.com) → Sign up (free, no card needed)
2. Click **API Keys** → **Create Key** → copy it → `GROQ_API_KEY`

### Step 3 — Deploy to Vercel

```bash
git add .
git commit -m "chainguard v2 - groq + supabase"
git push
```

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import repo
2. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   GROQ_API_KEY=...
   ```
3. Click **Deploy**

### Step 4 — Run locally

```bash
cp .env.example .env.local
# Fill in your keys in .env.local
npm install
npm run dev
# Open http://localhost:3000
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                       │
│              Next.js (React + TypeScript)               │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│                VERCEL SERVERLESS                        │
│  /api/contracts     → Upload .sol source code           │
│  /api/analyses      → Trigger AI analysis pipeline      │
│  /api/analyses/[id] → Poll for results                  │
│  /api/dashboard     → List all audits                   │
└──────────┬─────────────────────────────────┬────────────┘
           │                                 │
┌──────────▼──────────┐         ┌────────────▼────────────┐
│   SUPABASE DB       │         │   GROQ API              │
│   PostgreSQL        │         │   llama-3.3-70b         │
│                     │         │                         │
│  contracts          │         │  • Invariant discovery  │
│  analyses           │         │  • Vulnerability scan   │
│  properties         │         │  • Foundry test gen     │
│  findings           │         │  • Risk scoring         │
│  audit_logs         │         │                         │
└─────────────────────┘         └─────────────────────────┘
```

### Pipeline (per audit)
```
.sol upload → Supabase(contracts) → Groq LLM analysis →
  Invariants → Supabase(properties)
  Findings   → Supabase(findings)
  Summary    → analyses.summary
  Risk score → analyses.risk_score
  Foundry tests → analyses.foundry_test_code
  Audit log  → Supabase(audit_logs) [SHA-256 chain]
```

---

## 📁 Project Structure

```
chainguard/
├── pages/
│   ├── _app.tsx              # Next.js app wrapper
│   ├── index.tsx             # Dashboard page
│   └── api/
│       ├── contracts.ts      # POST /api/contracts
│       ├── analyses.ts       # POST /api/analyses
│       ├── analyses/[id].ts  # GET  /api/analyses/:id
│       └── dashboard.ts      # GET  /api/dashboard
├── components/
│   ├── Layout.tsx            # Nav + background
│   ├── ContractUpload.tsx    # Dropzone + upload form
│   ├── AnalysisResult.tsx    # Findings, invariants, Foundry code, log
│   └── RecentAudits.tsx      # Sidebar with audit history
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── llm.ts                # Groq AI client + prompts
│   └── types.ts              # Shared TypeScript types
├── styles/
│   └── globals.css
├── supabase/
│   └── schema.sql            # ← Run this first in Supabase
└── .env.example
```

---

## 🔧 Running Foundry Tests Locally

Download the generated fuzz test file from the UI and run it locally:

```bash
# Install Foundry (Linux/WSL2)
curl -L https://foundry.paradigm.xyz | bash
foundryup

forge init audit-workspace
cd audit-workspace
cp YourContract.sol src/
cp YourContractFuzzTest.t.sol test/
forge test --match-contract Fuzz -vvv
```

---

## 📊 Database Schema

| Table | Purpose |
|-------|---------|
| `contracts` | Uploaded Solidity source code |
| `analyses` | Audit jobs with status, risk score, summary |
| `properties` | Discovered invariants (from LLM) |
| `findings` | Vulnerabilities with severity + remediation |
| `audit_logs` | Immutable SHA-256 chained audit trail |

---

*Built by [Your Name] (H2XXXXXXQ) · Department of ISA · HIT · 2025*
