import React from 'react';
import Layout from '@/components/Layout';

const S = {
  panel: {
    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12,
    padding: 28, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  } as React.CSSProperties,
  h2: {
    fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#0ea5e9',
    letterSpacing: 2, marginBottom: 16,
  } as React.CSSProperties,
  p: { color: '#475569', fontSize: 14, lineHeight: 1.8, marginBottom: 12 } as React.CSSProperties,
  pre: {
    fontFamily: 'Space Mono, monospace', fontSize: 12, background: '#f8fafc',
    border: '1px solid #e2e8f0', borderRadius: 8, padding: 20,
    color: '#0f172a', overflowX: 'auto' as const, lineHeight: 1.7, marginBottom: 16,
  } as React.CSSProperties,
  code: {
    fontFamily: 'Space Mono, monospace', fontSize: 12, background: '#f1f5f9',
    border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 8px', color: '#0ea5e9',
  } as React.CSSProperties,
};

const SEV_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Critical: { text: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  High:     { text: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  Medium:   { text: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
};

export default function DocsPage() {
  return (
    <Layout>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 48px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#7c3aed',
            background: '#faf5ff', border: '1px solid #e9d5ff',
            borderRadius: 20, padding: '5px 14px', marginBottom: 20,
          }}>📖 DOCUMENTATION</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, marginBottom: 12, color: '#0f172a' }}>
            ChainGuard <span style={{ color: '#7c3aed' }}>Docs</span>
          </h1>
          <p style={{ ...S.p, fontSize: 16 }}>
            Everything you need to understand and use the AI-Powered Smart Contract Auditing Framework.
          </p>
        </div>

        {/* Overview */}
        <div style={S.panel}>
          <h2 style={S.h2}>// OVERVIEW</h2>
          <p style={S.p}>
            ChainGuard is a hybrid AI auditing framework that combines the semantic understanding of
            Large Language Models with the rigour of formal verification tooling. It automatically
            discovers invariants, classifies vulnerabilities, and generates Foundry fuzz test files
            for any Solidity smart contract.
          </p>
          <p style={S.p}>
            Built on Next.js, deployed on Vercel, and backed by Supabase PostgreSQL — all audit
            results are stored persistently and accessible from anywhere.
          </p>
        </div>

        {/* Pipeline */}
        <div style={S.panel}>
          <h2 style={S.h2}>// THE AUDIT PIPELINE</h2>
          {[
            { n: '01', title: 'Contract Upload', color: '#0ea5e9', desc: 'The Solidity source code is stored in Supabase with a unique contract ID.' },
            { n: '02', title: 'Analysis Job Created', color: '#7c3aed', desc: 'An analysis record is created with status "running". The API returns immediately (202 Accepted) so the UI can begin polling.' },
            { n: '03', title: 'LLM Invariant Discovery', color: '#10b981', desc: 'The contract is sent to Groq (Llama 3.3 70B). The model returns JSON containing safety invariants — properties that must always hold.' },
            { n: '04', title: 'Vulnerability Classification', color: '#f59e0b', desc: 'In the same call, the model analyses all functions for reentrancy, access control flaws, integer overflow, gas DoS, front-running, and business logic errors.' },
            { n: '05', title: 'Foundry Test Generation', color: '#0ea5e9', desc: 'A second LLM call generates a Foundry-compatible .t.sol fuzz test file. Each invariant becomes an invariant_() function.' },
            { n: '06', title: 'Immutable Audit Log', color: '#7c3aed', desc: 'A SHA-256 chained log entry is written to Supabase, creating a tamper-evident chain of all audits.' },
            { n: '07', title: 'Analysis Complete', color: '#10b981', desc: 'The analysis record is updated with status "completed", risk score, and summary. The UI polling detects completion and renders results.' },
          ].map(({ n, title, color, desc }, i, arr) => (
            <div key={n} style={{
              display: 'flex', gap: 20, marginBottom: 20,
              paddingBottom: 20,
              borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: color + '15', border: `1px solid ${color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Space Mono, monospace', fontSize: 10, color,
              }}>{n}</div>
              <div>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color, marginBottom: 4 }}>{title}</p>
                <p style={{ ...S.p, marginBottom: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Scan Termination */}
        <div style={S.panel}>
          <h2 style={S.h2}>// SCAN TERMINATION & TIMEOUT</h2>
          <p style={S.p}>
            Every scan has a built-in <strong>2-minute timeout</strong>. A progress bar is shown during analysis
            indicating elapsed time vs the timeout limit. The colour changes from blue → orange → red as
            the timeout approaches.
          </p>
          <p style={S.p}>
            You can also manually terminate a running scan at any time using the <strong>■ TERMINATE SCAN</strong> button.
            This immediately marks the analysis as failed in Supabase and stops polling. Useful for large contracts
            or if you uploaded the wrong file.
          </p>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px' }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#f59e0b', marginBottom: 4 }}>NOTE</p>
            <p style={{ ...S.p, marginBottom: 0, fontSize: 13 }}>
              Terminating a scan does not interrupt the LLM call already in-flight — it marks the DB record as
              failed so the UI stops waiting. For very large contracts, consider splitting them into smaller files.
            </p>
          </div>
        </div>

        {/* Vulnerability Classes */}
        <div style={S.panel}>
          <h2 style={S.h2}>// VULNERABILITY CLASSES</h2>
          {[
            { name: 'Reentrancy', sev: 'Critical', desc: 'External calls made before state updates, enabling recursive draining of funds.' },
            { name: 'Access Control', sev: 'High', desc: 'Missing onlyOwner, onlyRole modifiers on sensitive functions.' },
            { name: 'Integer Overflow', sev: 'High', desc: 'Unchecked arithmetic that can wrap in Solidity <0.8.0 contracts.' },
            { name: 'Flash Loan Attack', sev: 'Critical', desc: 'Price oracle manipulation using single-transaction flash loans.' },
            { name: 'Front-Running', sev: 'Medium', desc: 'Transactions visible in the mempool that can be exploited by bots.' },
            { name: 'Business Logic', sev: 'High', desc: 'Custom application logic flaws not caught by pattern-matching tools.' },
            { name: 'Gas DoS', sev: 'Medium', desc: 'Unbounded loops that can exhaust block gas limits.' },
            { name: 'Uninitialized Storage', sev: 'High', desc: 'Storage pointer variables left uninitialized, pointing to wrong slots.' },
          ].map(({ name, sev, desc }) => {
            const c = SEV_COLORS[sev] || { text: '#0ea5e9', bg: '#eff6ff', border: '#bae6fd' };
            return (
              <div key={name} style={{ display: 'flex', gap: 16, marginBottom: 14, alignItems: 'flex-start' }}>
                <div style={{ minWidth: 200, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{name}</span>
                  <span style={{
                    fontFamily: 'Space Mono, monospace', fontSize: 9, padding: '2px 8px',
                    borderRadius: 20, border: `1px solid ${c.border}`,
                    background: c.bg, color: c.text,
                  }}>{sev}</span>
                </div>
                <p style={{ ...S.p, marginBottom: 0, fontSize: 13 }}>{desc}</p>
              </div>
            );
          })}
        </div>

        {/* Invariant Categories */}
        <div style={S.panel}>
          <h2 style={S.h2}>// INVARIANT CATEGORIES</h2>
          {[
            ['funds_invariant', '#10b981', 'Properties about token balances, ETH holdings, and fund flows.'],
            ['access_control', '#f59e0b', 'Properties about who can call which functions.'],
            ['reentrancy', '#ef4444', 'Properties about call ordering during external calls.'],
            ['integer_safety', '#0ea5e9', 'Properties about arithmetic bounds and overflow conditions.'],
            ['other', '#7c3aed', 'Custom business logic properties specific to the contract.'],
          ].map(([cat, color, desc]) => (
            <div key={cat} style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'flex-start' }}>
              <code style={{ ...S.code, color, borderColor: color + '44', flexShrink: 0 }}>{cat}</code>
              <p style={{ ...S.p, marginBottom: 0, fontSize: 13 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Foundry */}
        <div style={S.panel}>
          <h2 style={S.h2}>// RUNNING FOUNDRY TESTS LOCALLY</h2>
          <p style={S.p}>Download the generated <code style={S.code}>.t.sol</code> from the Foundry Tests tab and run it locally:</p>
          <pre style={S.pre}>{`# Install Foundry (WSL2 / Linux)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Set up project
forge init audit-workspace && cd audit-workspace
cp YourContract.sol src/
cp YourContractFuzzTest.t.sol test/

# Run fuzz tests
forge test --match-contract Fuzz -vvv
forge test --match-contract Fuzz -vvv --fuzz-runs 10000`}</pre>
        </div>

        {/* Risk Score */}
        <div style={S.panel}>
          <h2 style={S.h2}>// RISK SCORE</h2>
          <p style={S.p}>An integer 0–100 assigned by the LLM based on severity of findings and contract complexity.</p>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { range: '0 – 30', label: 'LOW RISK', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
              { range: '31 – 69', label: 'MEDIUM RISK', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
              { range: '70 – 100', label: 'HIGH RISK', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
            ].map(({ range, label, color, bg, border }) => (
              <div key={label} style={{
                flex: 1, textAlign: 'center', padding: '16px 12px',
                background: bg, border: `1px solid ${border}`, borderRadius: 10,
              }}>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 18, fontWeight: 700, color, marginBottom: 6 }}>{range}</p>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}
