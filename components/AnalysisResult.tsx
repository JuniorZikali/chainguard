import React, { useState, useEffect, useCallback } from 'react';
import type { AnalysisDetails, Finding } from '@/lib/types';

interface Props {
  analysisId: string;
  onBack: () => void;
}

const SEV_COLOR: Record<string, string> = {
  Critical: '#ff3b5c',
  High: '#ff9f0a',
  Medium: '#f59e0b',
  Low: '#00ff94',
  Info: '#00e5ff',
};

const SEV_BG: Record<string, string> = {
  Critical: 'rgba(255,59,92,0.1)',
  High: 'rgba(255,159,10,0.1)',
  Medium: 'rgba(245,158,11,0.1)',
  Low: 'rgba(0,255,148,0.1)',
  Info: 'rgba(0,229,255,0.1)',
};

export default function AnalysisResult({ analysisId, onBack }: Props) {
  const [data, setData] = useState<AnalysisDetails | null>(null);
  const [polling, setPolling] = useState(true);
  const [activeTab, setActiveTab] = useState<'findings' | 'invariants' | 'foundry' | 'log'>('findings');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/analyses/${analysisId}`);
    if (!res.ok) return;
    const d: AnalysisDetails = await res.json();
    setData(d);
    if (d.analysis.status === 'completed' || d.analysis.status === 'failed') {
      setPolling(false);
    }
  }, [analysisId]);

  useEffect(() => {
    fetchData();
    if (!polling) return;
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData, polling]);

  const panel: React.CSSProperties = {
    background: '#0b1020', border: '1px solid #1e2d4a', borderRadius: 12, padding: 28,
  };

  if (!data) {
    return (
      <div style={{ ...panel, textAlign: 'center', padding: '60px 28px' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⟳</div>
        <p style={{ fontFamily: 'Space Mono, monospace', color: '#00e5ff', fontSize: 13 }}>
          LOADING ANALYSIS...
        </p>
      </div>
    );
  }

  const { analysis, properties, findings } = data;
  const isRunning = analysis.status === 'running' || analysis.status === 'pending';

  // Risk score colour
  const score = analysis.risk_score ?? 0;
  const riskColour = score >= 70 ? '#ff3b5c' : score >= 40 ? '#ff9f0a' : '#00ff94';

  // Severity counts
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0, Info: 0 };
  findings.forEach((f) => { counts[f.severity] = (counts[f.severity] || 0) + 1; });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent', border: '1px solid #1e2d4a', borderRadius: 6,
            color: '#5c6b8a', cursor: 'pointer', padding: '6px 14px', fontSize: 12,
            fontFamily: 'Space Mono, monospace', transition: 'all 0.2s',
          }}
        >
          ← BACK
        </button>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>
            {data.contract?.name}
          </h2>
          <p style={{ color: '#5c6b8a', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
            Analysis ID: {analysisId.slice(0, 8)}...
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {isRunning ? (
            <span style={{
              fontFamily: 'Space Mono, monospace', fontSize: 11,
              color: '#00e5ff', background: 'rgba(0,229,255,0.1)',
              border: '1px solid #00e5ff', borderRadius: 20, padding: '4px 12px',
            }}>
              ⟳ ANALYSING...
            </span>
          ) : analysis.status === 'failed' ? (
            <span style={{
              fontFamily: 'Space Mono, monospace', fontSize: 11,
              color: '#ff3b5c', background: 'rgba(255,59,92,0.1)',
              border: '1px solid #ff3b5c', borderRadius: 20, padding: '4px 12px',
            }}>
              ✗ FAILED
            </span>
          ) : (
            <span style={{
              fontFamily: 'Space Mono, monospace', fontSize: 11,
              color: '#00ff94', background: 'rgba(0,255,148,0.1)',
              border: '1px solid #00ff94', borderRadius: 20, padding: '4px 12px',
            }}>
              ✓ COMPLETE
            </span>
          )}
        </div>
      </div>

      {/* Running state */}
      {isRunning && (
        <div style={{
          ...panel, textAlign: 'center', padding: '40px 28px', marginBottom: 24,
          background: 'rgba(0,229,255,0.03)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12, animation: 'spin 2s linear infinite', display: 'inline-block' }}>⟳</div>
          <p style={{ fontFamily: 'Space Mono, monospace', color: '#00e5ff', marginBottom: 8 }}>
            AI ANALYSIS IN PROGRESS
          </p>
          <p style={{ color: '#5c6b8a', fontSize: 13 }}>
            Gemini is scanning your contract for vulnerabilities and invariants...
          </p>
        </div>
      )}

      {/* Score cards */}
      {!isRunning && analysis.status === 'completed' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
            {/* Risk score */}
            <div style={{ ...panel, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#5c6b8a', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>RISK SCORE</div>
              <div style={{ fontSize: 42, fontWeight: 800, color: riskColour, fontFamily: 'Space Mono, monospace' }}>
                {score}
              </div>
              <div style={{ fontSize: 11, color: '#5c6b8a' }}>/ 100</div>
            </div>

            {/* Severity counts */}
            {Object.entries(counts).filter(([, v]) => v > 0).map(([sev, cnt]) => (
              <div key={sev} style={{
                ...panel,
                borderColor: SEV_COLOR[sev] + '44',
                background: SEV_BG[sev],
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, color: '#5c6b8a', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>
                  {sev.toUpperCase()}
                </div>
                <div style={{ fontSize: 42, fontWeight: 800, color: SEV_COLOR[sev], fontFamily: 'Space Mono, monospace' }}>
                  {cnt}
                </div>
              </div>
            ))}

            {/* Invariants */}
            <div style={{ ...panel, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#5c6b8a', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>INVARIANTS</div>
              <div style={{ fontSize: 42, fontWeight: 800, color: '#7b61ff', fontFamily: 'Space Mono, monospace' }}>
                {properties.length}
              </div>
            </div>
          </div>

          {/* Summary */}
          {analysis.summary && (
            <div style={{ ...panel, marginBottom: 24, borderColor: '#7b61ff44', background: 'rgba(123,97,255,0.05)' }}>
              <p style={{ fontSize: 12, color: '#7b61ff', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>// EXECUTIVE SUMMARY</p>
              <p style={{ color: '#e8edf5', fontSize: 14, lineHeight: 1.7 }}>{analysis.summary}</p>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
            {([
              ['findings', `Findings (${findings.length})`],
              ['invariants', `Invariants (${properties.length})`],
              ['foundry', 'Foundry Tests'],
              ['log', 'Audit Log'],
            ] as const).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 18px', borderRadius: 8, border: '1px solid',
                  borderColor: activeTab === tab ? '#00e5ff' : '#1e2d4a',
                  background: activeTab === tab ? 'rgba(0,229,255,0.1)' : 'transparent',
                  color: activeTab === tab ? '#00e5ff' : '#5c6b8a',
                  fontFamily: 'Space Mono, monospace', fontSize: 12, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Findings tab */}
          {activeTab === 'findings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {findings.length === 0 && (
                <div style={{ ...panel, textAlign: 'center', color: '#00ff94', padding: 40 }}>
                  <div style={{ fontSize: 32 }}>✓</div>
                  <p style={{ fontFamily: 'Space Mono, monospace', marginTop: 8 }}>No vulnerabilities detected</p>
                </div>
              )}
              {findings.map((f: Finding) => (
                <div
                  key={f.id}
                  style={{
                    ...panel,
                    borderColor: SEV_COLOR[f.severity] + '55',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setExpanded(expanded === f.id ? null : f.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontFamily: 'Space Mono, monospace', fontSize: 10, fontWeight: 700,
                      padding: '3px 10px', borderRadius: 20, border: '1px solid',
                      borderColor: SEV_COLOR[f.severity],
                      background: SEV_BG[f.severity],
                      color: SEV_COLOR[f.severity],
                    }}>
                      {f.severity}
                    </span>
                    <span style={{ fontWeight: 600, flex: 1 }}>{f.vulnerability_class}</span>
                    {f.affected_function && (
                      <span style={{
                        fontSize: 12, fontFamily: 'Space Mono, monospace', color: '#5c6b8a',
                        background: '#050810', border: '1px solid #1e2d4a', borderRadius: 4, padding: '2px 8px',
                      }}>
                        {f.affected_function}()
                      </span>
                    )}
                    <span style={{ color: '#5c6b8a', fontSize: 14 }}>{expanded === f.id ? '▲' : '▼'}</span>
                  </div>

                  {expanded === f.id && (
                    <div style={{ marginTop: 16, borderTop: '1px solid #1e2d4a', paddingTop: 16 }}>
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 11, color: '#5c6b8a', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>EXPLANATION</p>
                        <p style={{ fontSize: 13, color: '#e8edf5', lineHeight: 1.7 }}>{f.explanation}</p>
                      </div>
                      <div style={{
                        background: 'rgba(0,255,148,0.05)', border: '1px solid rgba(0,255,148,0.2)',
                        borderRadius: 8, padding: 14,
                      }}>
                        <p style={{ fontSize: 11, color: '#00ff94', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>RECOMMENDATION</p>
                        <p style={{ fontSize: 13, color: '#e8edf5', lineHeight: 1.7 }}>{f.recommendation}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Invariants tab */}
          {activeTab === 'invariants' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {properties.map((p, i) => (
                <div key={p.id} style={{
                  ...panel, borderColor: '#7b61ff44',
                  background: 'rgba(123,97,255,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'rgba(123,97,255,0.2)', border: '1px solid #7b61ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#7b61ff', fontFamily: 'Space Mono, monospace', flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <div>
                      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#7b61ff', marginBottom: 4 }}>
                        {p.name}
                      </p>
                      <p style={{ fontSize: 13, color: '#e8edf5', lineHeight: 1.6 }}>{p.description}</p>
                      {p.category && (
                        <span style={{
                          display: 'inline-block', marginTop: 8, fontSize: 10,
                          fontFamily: 'Space Mono, monospace', color: '#5c6b8a',
                          background: '#050810', border: '1px solid #1e2d4a',
                          borderRadius: 4, padding: '2px 8px',
                        }}>
                          {p.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Foundry tests tab */}
          {activeTab === 'foundry' && (
            <div>
              <div style={{
                background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.2)',
                borderRadius: 8, padding: '12px 16px', marginBottom: 16,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontSize: 12, color: '#00e5ff', fontFamily: 'Space Mono, monospace', marginBottom: 4 }}>
                    FOUNDRY FUZZ TEST · LOCAL EXECUTION
                  </p>
                  <p style={{ fontSize: 12, color: '#5c6b8a' }}>
                    Save this file to your Foundry project and run: <code style={{ color: '#00e5ff' }}>forge test --match-contract Fuzz</code>
                  </p>
                </div>
                <button
                  onClick={() => {
                    const blob = new Blob([analysis.foundry_test_code || ''], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${data.contract?.name}FuzzTest.t.sol`;
                    a.click();
                  }}
                  style={{
                    fontFamily: 'Space Mono, monospace', fontSize: 11, padding: '8px 16px',
                    background: 'rgba(0,229,255,0.1)', border: '1px solid #00e5ff',
                    borderRadius: 6, color: '#00e5ff', cursor: 'pointer',
                  }}
                >
                  ↓ DOWNLOAD
                </button>
              </div>
              <pre style={{
                background: '#050810', border: '1px solid #1e2d4a', borderRadius: 10,
                padding: 20, overflowX: 'auto', fontSize: 12, lineHeight: 1.6,
                fontFamily: 'Space Mono, monospace', color: '#e8edf5', maxHeight: 500,
              }}>
                {analysis.foundry_test_code || '// Test generation pending...'}
              </pre>
            </div>
          )}

          {/* Audit log tab */}
          {activeTab === 'log' && (
            <div>
              {data.logs.map((log) => (
                <div key={log.id} style={{
                  ...panel, marginBottom: 12,
                  borderColor: '#00ff9444', background: 'rgba(0,255,148,0.03)',
                }}>
                  <p style={{ fontSize: 12, color: '#00ff94', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>
                    // IMMUTABLE LOG ENTRY
                  </p>
                  <p style={{ fontSize: 13, color: '#e8edf5', marginBottom: 12 }}>{log.summary}</p>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#5c6b8a' }}>
                    <p>HASH: <span style={{ color: '#00e5ff' }}>{log.hash}</span></p>
                    {log.prev_hash && <p>PREV: <span style={{ color: '#5c6b8a' }}>{log.prev_hash}</span></p>}
                    <p>RISK: <span style={{ color: riskColour }}>{log.risk_score}/100</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
