import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ContractUpload from '@/components/ContractUpload';
import AnalysisResult from '@/components/AnalysisResult';
import RecentAudits from '@/components/RecentAudits';

export default function Home() {
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAnalysisStarted = (id: string) => {
    setActiveAnalysisId(id);
    setRefreshKey((k) => k + 1);
  };

  const handleBack = () => {
    setActiveAnalysisId(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <Layout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 48px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#0ea5e9',
            background: '#eff6ff', border: '1px solid #bae6fd',
            borderRadius: 20, padding: '5px 14px', marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            AI-POWERED · GROQ LLAMA 3.3 · SUPABASE PERSISTENCE
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, marginBottom: 16, color: '#0f172a' }}>
            Smart Contract<br />
            <span style={{ color: '#0ea5e9' }}>Security</span>{' '}
            <span style={{ color: '#7c3aed' }}>Auditor</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, maxWidth: 560, lineHeight: 1.6 }}>
            Upload a Solidity contract and get an automated security audit powered by Groq AI.
            Detects reentrancy, access control flaws, integer issues, and custom business logic vulnerabilities.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'VULNERABILITY CLASSES', value: '12+', color: '#ef4444' },
            { label: 'LLM MODEL', value: 'Groq', color: '#0ea5e9' },
            { label: 'INVARIANT TYPES', value: '5', color: '#7c3aed' },
            { label: 'AUDIT CHAIN', value: 'SHA-256', color: '#10b981' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10,
              padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <p style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'Space Mono, monospace', marginBottom: 8, letterSpacing: 1 }}>{label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'Space Mono, monospace' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          <div>
            {activeAnalysisId ? (
              <AnalysisResult analysisId={activeAnalysisId} onBack={handleBack} />
            ) : (
              <ContractUpload onAnalysisStarted={handleAnalysisStarted} />
            )}
          </div>

          <div>
            <RecentAudits
              onSelect={(id) => setActiveAnalysisId(id)}
              selectedId={activeAnalysisId ?? undefined}
              refreshKey={refreshKey}
            />
            <div style={{
              marginTop: 16, background: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#7c3aed', marginBottom: 12 }}>// HOW IT WORKS</p>
              {[
                ['01', 'Upload .sol file or paste code'],
                ['02', 'Groq AI discovers invariants'],
                ['03', 'Vulnerabilities are classified'],
                ['04', 'Foundry fuzz tests generated'],
                ['05', 'Results stored in Supabase'],
              ].map(([n, text]) => (
                <div key={n} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#7c3aed', flexShrink: 0 }}>{n}</span>
                  <span style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
