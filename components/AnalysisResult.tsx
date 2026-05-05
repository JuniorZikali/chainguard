import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { AnalysisDetails, Finding } from '@/lib/types';

interface Props {
  analysisId: string;
  onBack: () => void;
}

const SEV_COLOR: Record<string, string> = {
  Critical: '#ef4444', High: '#f59e0b', Medium: '#f59e0b', Low: '#10b981', Info: '#0ea5e9',
};
const SEV_BG: Record<string, string> = {
  Critical: '#fef2f2', High: '#fffbeb', Medium: '#fffbeb', Low: '#f0fdf4', Info: '#eff6ff',
};
const SEV_BORDER: Record<string, string> = {
  Critical: '#fecaca', High: '#fde68a', Medium: '#fde68a', Low: '#bbf7d0', Info: '#bae6fd',
};

const TIMEOUT_SECONDS = 120; // 2 minutes

export default function AnalysisResult({ analysisId, onBack }: Props) {
  const [data, setData] = useState<AnalysisDetails | null>(null);
  const [polling, setPolling] = useState(true);
  const [activeTab, setActiveTab] = useState<'findings' | 'invariants' | 'foundry' | 'log'>('findings');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [terminating, setTerminating] = useState(false);
  const startTime = useRef(Date.now());

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/analyses/${analysisId}`);
    if (!res.ok) return;
    const d: AnalysisDetails = await res.json();
    setData(d);
    if (d.analysis.status === 'completed' || d.analysis.status === 'failed') {
      setPolling(false);
    }
  }, [analysisId]);

  // Polling
  useEffect(() => {
    fetchData();
    if (!polling) return;
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData, polling]);

  // Elapsed timer + auto-timeout
  useEffect(() => {
    if (!polling) return;
    const timer = setInterval(() => {
      const secs = Math.floor((Date.now() - startTime.current) / 1000);
      setElapsed(secs);
      if (secs >= TIMEOUT_SECONDS) {
        setTimedOut(true);
        setPolling(false);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [polling]);

  const handleTerminate = async () => {
    setTerminating(true);
    try {
      await fetch(`/api/analyses/terminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_id: analysisId }),
      });
      setPolling(false);
      await fetchData();
    } catch (err) {
      console.error('Terminate error:', err);
    } finally {
      setTerminating(false);
    }
  };

  const panel: React.CSSProperties = {
    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 28,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  };

  if (!data) {
    return (
      <div style={{ ...panel, textAlign: 'center', padding: '60px 28px' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⟳</div>
        <p style={{ fontFamily: 'Space Mono, monospace', color: '#0ea5e9', fontSize: 13 }}>LOADING...</p>
      </div>
    );
  }

  const { analysis, properties, findings } = data;
  const isRunning = analysis.status === 'running' || analysis.status === 'pending';
  const score = analysis.risk_score ?? 0;
  const riskColour = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#10b981';
  const counts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0, Info: 0 };
  findings.forEach((f) => { counts[f.severity] = (counts[f.severity] || 0) + 1; });
  const progressPct = Math.min((elapsed / TIMEOUT_SECONDS) * 100, 100);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={onBack} style={{
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6,
          color: '#64748b', cursor: 'pointer', padding: '6px 14px', fontSize: 12,
          fontFamily: 'Space Mono, monospace',
        }}>← BACK</button>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2, color: '#0f172a' }}>
            {data.contract?.name}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
            ID: {analysisId.slice(0, 8)}...
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {isRunning && (
            <span style={{
              fontFamily: 'Space Mono, monospace', fontSize: 11,
              color: '#0ea5e9', background: '#eff6ff',
              border: '1px solid #bae6fd', borderRadius: 20, padding: '4px 12px',
            }}>⟳ ANALYSING... {elapsed}s</span>
          )}
          {analysis.status === 'failed' && (
            <span style={{
              fontFamily: 'Space Mono, monospace', fontSize: 11,
              color: '#ef4444', background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: 20, padding: '4px 12px',
            }}>✗ FAILED</span>
          )}
          {analysis.status === 'completed' && (
            <span style={{
              fontFamily: 'Space Mono, monospace', fontSize: 11,
              color: '#10b981', background: '#f0fdf4',
              border: '1px solid #bbf7d0', borderRadius: 20, padding: '4px 12px',
            }}>✓ COMPLETE</span>
          )}
        </div>
      </div>

      {/* Running state with progress + terminate */}
      {isRunning && (
        <div style={{ ...panel, marginBottom: 24, background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#0ea5e9', marginBottom: 4 }}>
                AI ANALYSIS IN PROGRESS
              </p>
              <p style={{ color: '#64748b', fontSize: 13 }}>
                Groq AI is scanning your contract for vulnerabilities and invariants...
              </p>
            </div>
            <button
              onClick={handleTerminate}
              disabled={terminating}
              style={{
                fontFamily: 'Space Mono, monospace', fontSize: 11, padding: '8px 16px',
                background: terminating ? '#f1f5f9' : '#fef2f2',
                border: `1px solid ${terminating ? '#e2e8f0' : '#fecaca'}`,
                borderRadius: 8, color: terminating ? '#94a3b8' : '#ef4444',
                cursor: terminating ? 'wait' : 'pointer', transition: 'all 0.2s',
              }}
            >
              {terminating ? '⟳ STOPPING...' : '■ TERMINATE SCAN'}
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontFamily: 'Space Mono, monospace', color: '#64748b' }}>
                Elapsed: {elapsed}s
              </span>
              <span style={{ fontSize: 11, fontFamily: 'Space Mono, monospace', color: '#64748b' }}>
                Timeout: {TIMEOUT_SECONDS}s
              </span>
            </div>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3, transition: 'width 1s linear',
                width: `${progressPct}%`,
                background: progressPct > 80 ? '#ef4444' : progressPct > 50 ? '#f59e0b' : '#0ea5e9',
              }} />
            </div>
          </div>

          {timedOut && (
            <div style={{
              marginTop: 12, padding: '10px 14px',
              background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8,
              color: '#c2410c', fontSize: 13, fontFamily: 'Space Mono, monospace',
            }}>
              ⚠ SCAN TIMED OUT after {TIMEOUT_SECONDS}s. The analysis was marked as failed.
              You can try again with a shorter contract.
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {analysis.status === 'completed' && (
        <>
          {/* Score cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ ...panel, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>RISK SCORE</div>
              <div style={{ fontSize: 42, fontWeight: 800, color: riskColour, fontFamily: 'Space Mono, monospace' }}>{score}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>/ 100</div>
            </div>
            {Object.entries(counts).filter(([, v]) => v > 0).map(([sev, cnt]) => (
              <div key={sev} style={{
                ...panel, textAlign: 'center',
                borderColor: SEV_BORDER[sev], background: SEV_BG[sev],
              }}>
                <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>{sev.toUpperCase()}</div>
                <div style={{ fontSize: 42, fontWeight: 800, color: SEV_COLOR[sev], fontFamily: 'Space Mono, monospace' }}>{cnt}</div>
              </div>
            ))}
            <div style={{ ...panel, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>INVARIANTS</div>
              <div style={{ fontSize: 42, fontWeight: 800, color: '#7c3aed', fontFamily: 'Space Mono, monospace' }}>{properties.length}</div>
            </div>
          </div>

          {/* Summary */}
          {analysis.summary && (
            <div style={{ ...panel, marginBottom: 24, background: '#faf5ff', borderColor: '#e9d5ff' }}>
              <p style={{ fontSize: 12, color: '#7c3aed', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>// EXECUTIVE SUMMARY</p>
              <p style={{ color: '#0f172a', fontSize: 14, lineHeight: 1.7 }}>{analysis.summary}</p>
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
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '8px 18px', borderRadius: 8, border: '1px solid',
                borderColor: activeTab === tab ? '#0ea5e9' : '#e2e8f0',
                background: activeTab === tab ? '#eff6ff' : '#f8fafc',
                color: activeTab === tab ? '#0ea5e9' : '#64748b',
                fontFamily: 'Space Mono, monospace', fontSize: 12, cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Findings */}
          {activeTab === 'findings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {findings.length === 0 && (
                <div style={{ ...panel, textAlign: 'center', color: '#10b981', padding: 40 }}>
                  <div style={{ fontSize: 32 }}>✓</div>
                  <p style={{ fontFamily: 'Space Mono, monospace', marginTop: 8 }}>No vulnerabilities detected</p>
                </div>
              )}
              {findings.map((f: Finding) => (
                <div key={f.id} style={{
                  ...panel, borderColor: SEV_BORDER[f.severity], cursor: 'pointer',
                  background: expanded === f.id ? SEV_BG[f.severity] : '#fff',
                }}
                  onClick={() => setExpanded(expanded === f.id ? null : f.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontFamily: 'Space Mono, monospace', fontSize: 10, fontWeight: 700,
                      padding: '3px 10px', borderRadius: 20,
                      border: `1px solid ${SEV_BORDER[f.severity]}`,
                      background: SEV_BG[f.severity], color: SEV_COLOR[f.severity],
                    }}>{f.severity}</span>
                    <span style={{ fontWeight: 600, flex: 1, color: '#0f172a' }}>{f.vulnerability_class}</span>
                    {f.affected_function && (
                      <span style={{
                        fontSize: 12, fontFamily: 'Space Mono, monospace', color: '#64748b',
                        background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 8px',
                      }}>{f.affected_function}()</span>
                    )}
                    <span style={{ color: '#94a3b8' }}>{expanded === f.id ? '▲' : '▼'}</span>
                  </div>
                  {expanded === f.id && (
                    <div style={{ marginTop: 16, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                      <p style={{ fontSize: 11, color: '#64748b', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>EXPLANATION</p>
                      <p style={{ fontSize: 13, color: '#0f172a', lineHeight: 1.7, marginBottom: 16 }}>{f.explanation}</p>
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 14 }}>
                        <p style={{ fontSize: 11, color: '#10b981', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>RECOMMENDATION</p>
                        <p style={{ fontSize: 13, color: '#0f172a', lineHeight: 1.7 }}>{f.recommendation}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Invariants */}
          {activeTab === 'invariants' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {properties.map((p, i) => (
                <div key={p.id} style={{ ...panel, borderColor: '#e9d5ff', background: '#faf5ff' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: '#ede9fe', border: '1px solid #c4b5fd',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#7c3aed', fontFamily: 'Space Mono, monospace', flexShrink: 0,
                    }}>{i + 1}</span>
                    <div>
                      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#7c3aed', marginBottom: 4 }}>{p.name}</p>
                      <p style={{ fontSize: 13, color: '#0f172a', lineHeight: 1.6 }}>{p.description}</p>
                      {p.category && (
                        <span style={{
                          display: 'inline-block', marginTop: 8, fontSize: 10,
                          fontFamily: 'Space Mono, monospace', color: '#64748b',
                          background: '#f1f5f9', border: '1px solid #e2e8f0',
                          borderRadius: 4, padding: '2px 8px',
                        }}>{p.category}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Foundry */}
          {activeTab === 'foundry' && (
            <div>
              <div style={{
                background: '#eff6ff', border: '1px solid #bae6fd', borderRadius: 8,
                padding: '12px 16px', marginBottom: 16,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontSize: 12, color: '#0ea5e9', fontFamily: 'Space Mono, monospace', marginBottom: 4 }}>
                    FOUNDRY FUZZ TEST · LOCAL EXECUTION
                  </p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>
                    Run: <code style={{ fontFamily: 'Space Mono, monospace', color: '#0ea5e9' }}>forge test --match-contract Fuzz</code>
                  </p>
                </div>
                <button onClick={() => {
                  const blob = new Blob([analysis.foundry_test_code || ''], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = `${data.contract?.name}FuzzTest.t.sol`; a.click();
                }} style={{
                  fontFamily: 'Space Mono, monospace', fontSize: 11, padding: '8px 16px',
                  background: '#fff', border: '1px solid #0ea5e9',
                  borderRadius: 6, color: '#0ea5e9', cursor: 'pointer',
                }}>↓ DOWNLOAD</button>
              </div>
              <pre style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
                padding: 20, overflowX: 'auto', fontSize: 12, lineHeight: 1.6,
                fontFamily: 'Space Mono, monospace', color: '#0f172a', maxHeight: 500,
              }}>
                {analysis.foundry_test_code || '// Test generation pending...'}
              </pre>
            </div>
          )}

          {/* Audit Log */}
          {activeTab === 'log' && (
            <div>
              {data.logs.map((log) => (
                <div key={log.id} style={{ ...panel, marginBottom: 12, background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <p style={{ fontSize: 12, color: '#10b981', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>// IMMUTABLE LOG ENTRY</p>
                  <p style={{ fontSize: 13, color: '#0f172a', marginBottom: 12 }}>{log.summary}</p>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#64748b' }}>
                    <p>HASH: <span style={{ color: '#0ea5e9' }}>{log.hash}</span></p>
                    {log.prev_hash && <p>PREV: <span style={{ color: '#94a3b8' }}>{log.prev_hash}</span></p>}
                    <p>RISK: <span style={{ color: riskColour, fontWeight: 700 }}>{log.risk_score}/100</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Failed state */}
      {analysis.status === 'failed' && (
        <div style={{ ...panel, background: '#fef2f2', borderColor: '#fecaca', textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✗</div>
          <p style={{ fontFamily: 'Space Mono, monospace', color: '#ef4444', marginBottom: 8 }}>ANALYSIS FAILED</p>
          <p style={{ color: '#64748b', fontSize: 13 }}>The scan was terminated or encountered an error. Please try again.</p>
          <button onClick={onBack} style={{
            marginTop: 16, fontFamily: 'Space Mono, monospace', fontSize: 12,
            padding: '8px 20px', background: '#fff', border: '1px solid #fecaca',
            borderRadius: 8, color: '#ef4444', cursor: 'pointer',
          }}>← TRY AGAIN</button>
        </div>
      )}
    </div>
  );
}
