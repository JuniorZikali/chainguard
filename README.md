# ChainGuard — AI-Powered Smart Contract Auditor (v2)

> **HIT Honours Project · Information Security & Assurance · 2025**  
> Built with Next.js · Deployed on Vercel · Supabase PostgreSQL

---

## 🚀 Quick Deploy (15 minutes)

### Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name (e.g. `chainguard`) and set a strong DB password
3. Wait ~2 minutes for it to spin up
4. Go to **SQL Editor** → paste the entire contents of `supabase/schema.sql` → **Run**
5. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2 — Get Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com/app/apikey)
2. Click **Create API Key** (free tier is sufficient for demo)
3. Copy it → `GEMINI_API_KEY`

### Step 3 — Deploy to Vercel

#### Option A: GitHub (recommended)
```bash
git init
git add .
git commit -m "initial chainguard deploy"
gh repo create chainguard --public --push   # requires GitHub CLI
```
Then:
1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Import your GitHub repo
3. Add environment variables (from step 1 & 2):
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   GEMINI_API_KEY=...
   ```
4. Click **Deploy** → done!

#### Option B: Vercel CLI
```bash
npm i -g vercel
vercel                    # follow prompts
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GEMINI_API_KEY
vercel --prod
```

### Step 4 — Test locally first
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
│  /api/contracts  → Upload .sol source code              │
│  /api/analyses   → Trigger AI analysis pipeline         │
│  /api/analyses/[id] → Poll for results                  │
│  /api/dashboard  → List all audits                      │
└──────────┬─────────────────────────────────┬────────────┘
           │                                 │
┌──────────▼──────────┐         ┌────────────▼────────────┐
│   SUPABASE DB       │         │   GOOGLE GEMINI API     │
│   PostgreSQL        │         │   gemini-1.5-pro        │
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
.sol upload → Supabase(contracts) → Gemini analysis →
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
│   ├── gemini.ts             # Gemini API + prompts
│   └── types.ts              # Shared TypeScript types
├── styles/
│   └── globals.css
├── supabase/
│   └── schema.sql            # ← Run this first in Supabase
└── .env.example
```

---

## 🔧 Running Foundry Tests Locally

The AI generates Foundry fuzz test files that you can download and run locally:

```bash
# Install Foundry (Linux/WSL2)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Create a Foundry project
forge init audit-workspace
cd audit-workspace

# Copy your contract
cp YourContract.sol src/

# Paste the downloaded fuzz test into test/
cp YourContractFuzzTest.t.sol test/

# Run!
forge test --match-contract Fuzz -vvv
```

---

## 📊 Database Schema (Supabase)

| Table | Purpose |
|-------|---------|
| `contracts` | Uploaded Solidity source code |
| `analyses` | Audit jobs with status, risk score, summary |
| `properties` | Discovered invariants (from LLM) |
| `findings` | Vulnerabilities with severity + remediation |
| `audit_logs` | Immutable SHA-256 chained audit trail |

---

## 🎓 Academic Context

This project is submitted as the practical component of a Bachelor of Technology (Honours) in Information Security and Assurance at the **Harare Institute of Technology**.

The system implements the **Invariant Transpilation Pipeline** described in Chapter 4:
1. `extract_ast` → Gemini parses Solidity semantics
2. `generate_prompt` → Structured system prompt for invariant discovery  
3. `parse_llm_response` → JSON extraction + validation
4. `write_test_file` → Foundry-compatible test generation
5. `audit_log` → SHA-256 chained immutable log (no Merkle tree needed for scope)

---

*Built by [Your Name] (H2XXXXXXQ) · Department of ISA · HIT · 2025*
