-- ============================================================
-- ChainGuard · Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── CONTRACTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contracts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  source_code   TEXT NOT NULL,
  benchmark_label TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── ANALYSES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analyses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id     UUID REFERENCES contracts(id) ON DELETE CASCADE,
  llm_model       TEXT NOT NULL DEFAULT 'gemini-1.5-pro',
  prompt_version  TEXT NOT NULL DEFAULT 'v2',
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','running','completed','failed')),
  risk_score      INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  summary         TEXT,
  foundry_test_code TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

-- ── PROPERTIES (invariants) ────────────────────────────────
CREATE TABLE IF NOT EXISTS properties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id   UUID REFERENCES analyses(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL,
  category      TEXT
);

-- ── FINDINGS (vulnerabilities) ────────────────────────────
CREATE TABLE IF NOT EXISTS findings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id         UUID REFERENCES analyses(id) ON DELETE CASCADE,
  vulnerability_class TEXT NOT NULL,
  severity            TEXT NOT NULL
                        CHECK (severity IN ('Critical','High','Medium','Low','Info')),
  affected_function   TEXT,
  affected_line       INTEGER,
  explanation         TEXT NOT NULL,
  recommendation      TEXT NOT NULL
);

-- ── AUDIT LOGS (immutable chain) ──────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id   UUID NOT NULL,
  analysis_id   UUID NOT NULL,
  summary       TEXT NOT NULL,
  risk_score    INTEGER,
  hash          TEXT UNIQUE NOT NULL,
  prev_hash     TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_analyses_contract ON analyses(contract_id);
CREATE INDEX IF NOT EXISTS idx_properties_analysis ON properties(analysis_id);
CREATE INDEX IF NOT EXISTS idx_findings_analysis ON findings(analysis_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_analysis ON audit_logs(analysis_id);

-- ── ROW LEVEL SECURITY ─────────────────────────────────────
-- For a public demo, disable RLS so the API can read/write freely.
-- In production, enable RLS and add proper policies.
ALTER TABLE contracts    DISABLE ROW LEVEL SECURITY;
ALTER TABLE analyses     DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties   DISABLE ROW LEVEL SECURITY;
ALTER TABLE findings     DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs   DISABLE ROW LEVEL SECURITY;

-- To enable later with service role bypass:
-- ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Service role full access" ON contracts USING (true) WITH CHECK (true);

SELECT 'ChainGuard schema installed successfully ✓' AS status;
