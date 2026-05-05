import React, { useState } from 'react';
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
    color: '#0f172a', overflowX: 'auto' as const, lineHeight: 1.7, marginBottom: 0,
  } as React.CSSProperties,
};

const METHOD_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  POST: { text: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
  GET:  { text: '#0ea5e9', bg: '#eff6ff', border: '#bae6fd' },
};

interface Endpoint {
  method: 'GET' | 'POST';
  path: string;
  description: string;
  requestBody?: string;
  response: string;
  notes?: string;
}

const endpoints: Endpoint[] = [
  {
    method: 'POST', path: '/api/contracts',
    description: 'Upload a Solidity contract source. Returns the stored contract record with its UUID.',
    requestBody: `{\n  "name": "VulnerableBank",\n  "source_code": "// SPDX-License-Identifier: MIT\\n...",\n  "benchmark_label": "reentrancy"  // optional\n}`,
    response: `{\n  "id": "3f2a1b4c-...",\n  "name": "VulnerableBank",\n  "benchmark_label": "reentrancy",\n  "created_at": "2025-05-02T10:00:00Z"\n}`,
    notes: 'Use the returned id to start an analysis.',
  },
  {
    method: 'POST', path: '/api/analyses',
    description: 'Start an AI audit on an uploaded contract. Returns immediately — analysis runs asynchronously.',
    requestBody: `{\n  "contract_id": "3f2a1b4c-..."\n}`,
    response: `{\n  "id": "9a8b7c6d-...",\n  "status": "running"\n}`,
    notes: 'Poll GET /api/analyses/:id every 3 seconds until status is "completed" or "failed".',
  },
  {
    method: 'POST', path: '/api/analyses/terminate',
    description: 'Terminate a running or pending analysis. Marks it as failed immediately.',
    requestBody: `{\n  "analysis_id": "9a8b7c6d-..."\n}`,
    response: `{\n  "success": true,\n  "status": "failed"\n}`,
    notes: 'Only works on analyses with status "pending" or "running".',
  },
  {
    method: 'GET', path: '/api/analyses/:id',
    description: 'Get full details of an analysis — findings, invariants, Foundry test code, and audit log.',
    response: `{\n  "analysis": {\n    "id": "9a8b7c6d-...",\n    "status": "completed",\n    "risk_score": 78,\n    "summary": "The contract contains a critical reentrancy...",\n    "foundry_test_code": "// SPDX-License-Identifier: MIT...",\n    "completed_at": "2025-05-02T10:00:12Z"\n  },\n  "contract": { "id": "...", "name": "VulnerableBank" },\n  "properties": [\n    { "name": "balanceSolvency", "category": "funds_invariant", "description": "..." }\n  ],\n  "findings": [\n    { "vulnerability_class": "Reentrancy", "severity": "Critical", "affected_function": "withdraw", "explanation": "...", "recommendation": "..." }\n  ],\n  "logs": [\n    { "hash": "a3f4e5...", "prev_hash": "b2c3d4...", "risk_score": 78 }\n  ]\n}`,
    notes: 'Status values: pending | running | completed | failed',
  },
  {
    method: 'GET', path: '/api/dashboard',
    description: 'List the 50 most recent analyses with their contract info.',
    response: `[\n  {\n    "id": "9a8b7c6d-...",\n    "status": "completed",\n    "risk_score": 78,\n    "created_at": "2025-05-02T10:00:01Z",\n    "contract": { "id": "...", "name": "VulnerableBank" }\n  }\n]`,
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{
        fontFamily: 'Space Mono, monospace', fontSize: 10, padding: '4px 12px', borderRadius: 5,
        border: '1px solid #e2e8f0', background: copied ? '#f0fdf4' : '#f8fafc',
        color: copied ? '#10b981' : '#64748b', cursor: 'pointer', transition: 'all 0.2s',
      }}>
      {copied ? '✓ COPIED' : 'COPY'}
    </button>
  );
}

function EndpointCard({ ep }: { ep: Endpoint }) {
  const [open, setOpen] = useState(false);
  const c = METHOD_COLOR[ep.method];
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, marginBottom: 12, overflow: 'hidden' }}>
      <div onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
        cursor: 'pointer', background: open ? '#f8fafc' : '#fff', transition: 'background 0.2s',
      }}>
        <span style={{
          fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700,
          padding: '3px 10px', borderRadius: 5, border: `1px solid ${c.border}`,
          background: c.bg, color: c.text, minWidth: 52, textAlign: 'center',
        }}>{ep.method}</span>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#0f172a', flex: 1 }}>{ep.path}</span>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
          <p style={{ ...S.p, marginBottom: 16 }}>{ep.description}</p>
          {ep.requestBody && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#7c3aed', margin: 0 }}>REQUEST BODY</p>
                <CopyButton text={ep.requestBody} />
              </div>
              <pre style={S.pre}>{ep.requestBody}</pre>
            </div>
          )}
          <div style={{ marginBottom: ep.notes ? 16 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#10b981', margin: 0 }}>RESPONSE</p>
              <CopyButton text={ep.response} />
            </div>
            <pre style={S.pre}>{ep.response}</pre>
          </div>
          {ep.notes && (
            <div style={{ marginTop: 16, padding: '10px 14px', background: '#eff6ff', border: '1px solid #bae6fd', borderRadius: 8 }}>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#0ea5e9', marginBottom: 4 }}>NOTE</p>
              <p style={{ ...S.p, marginBottom: 0, fontSize: 13 }}>{ep.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApiPage() {
  const example = `// 1. Upload contract
const { id: contractId } = await fetch('/api/contracts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'VulnerableBank', source_code: code }),
}).then(r => r.json());

// 2. Start analysis
const { id: analysisId } = await fetch('/api/analyses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contract_id: contractId }),
}).then(r => r.json());

// 3. Poll until complete
let result;
while (true) {
  result = await fetch(\`/api/analyses/\${analysisId}\`).then(r => r.json());
  if (result.analysis.status === 'completed') break;
  if (result.analysis.status === 'failed') throw new Error('Failed');
  await new Promise(r => setTimeout(r, 3000));
}

// 4. Optionally terminate early
await fetch('/api/analyses/terminate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ analysis_id: analysisId }),
});`;

  return (
    <Layout>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 48px' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#10b981',
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 20, padding: '5px 14px', marginBottom: 20,
          }}>⚡ API REFERENCE</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, marginBottom: 12, color: '#0f172a' }}>
            ChainGuard <span style={{ color: '#10b981' }}>API</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6 }}>
            REST API for programmatic access to the auditing pipeline. All endpoints accept and return JSON.
          </p>
        </div>

        {/* Base URL */}
        <div style={S.panel}>
          <h2 style={S.h2}>// BASE URL</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'LOCAL', url: 'http://localhost:3000' },
              { label: 'PRODUCTION', url: 'https://chainguard-gold.vercel.app/' },
            ].map(({ label, url }) => (
              <div key={label} style={{ flex: 1, padding: '14px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#94a3b8', marginBottom: 6 }}>{label}</p>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#0ea5e9' }}>{url}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Endpoints */}
        <div style={S.panel}>
          <h2 style={S.h2}>// ENDPOINTS</h2>
          {endpoints.map((ep) => <EndpointCard key={ep.method + ep.path} ep={ep} />)}
        </div>

        {/* Example */}
        <div style={S.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ ...S.h2, marginBottom: 0 }}>// COMPLETE EXAMPLE (JavaScript)</h2>
            <CopyButton text={example} />
          </div>
          <pre style={S.pre}>{example}</pre>
        </div>

        {/* Status codes */}
        <div style={S.panel}>
          <h2 style={S.h2}>// STATUS CODES</h2>
          {[
            { code: '200', color: '#10b981', desc: 'OK — request succeeded' },
            { code: '201', color: '#10b981', desc: 'Created — resource created successfully' },
            { code: '202', color: '#0ea5e9', desc: 'Accepted — analysis job queued asynchronously' },
            { code: '400', color: '#f59e0b', desc: 'Bad Request — missing required fields' },
            { code: '404', color: '#f59e0b', desc: 'Not Found — ID does not exist' },
            { code: '405', color: '#f59e0b', desc: 'Method Not Allowed — wrong HTTP method' },
            { code: '500', color: '#ef4444', desc: 'Internal Server Error — check server logs' },
          ].map(({ code, color, desc }) => (
            <div key={code} style={{ display: 'flex', gap: 20, marginBottom: 10, alignItems: 'center' }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color, minWidth: 40 }}>{code}</span>
              <span style={{ color: '#475569', fontSize: 13 }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
