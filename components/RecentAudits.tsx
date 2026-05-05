import React, { useEffect, useState } from 'react';
import type { Analysis } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  onSelect: (id: string) => void;
  selectedId?: string;
  refreshKey: number;
}

const STATUS: Record<string, { color: string; bg: string; border: string }> = {
  completed: { color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
  running:   { color: '#0ea5e9', bg: '#eff6ff', border: '#bae6fd' },
  pending:   { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  failed:    { color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
};

export default function RecentAudits({ onSelect, selectedId, refreshKey }: Props) {
  const [audits, setAudits] = useState<Analysis[]>([]);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((data) => setAudits(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [refreshKey]);

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <h3 style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#64748b', letterSpacing: 2, marginBottom: 16 }}>
        // RECENT AUDITS
      </h3>

      {audits.length === 0 && (
        <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
          No audits yet. Upload a contract to begin.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {audits.map((audit) => {
          const st = STATUS[audit.status] || STATUS.pending;
          return (
            <div
              key={audit.id}
              onClick={() => onSelect(audit.id)}
              style={{
                padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                border: '1px solid',
                borderColor: selectedId === audit.id ? '#0ea5e9' : '#e2e8f0',
                background: selectedId === audit.id ? '#eff6ff' : '#f8fafc',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                  {audit.contract?.name || 'Unknown'}
                </span>
                <span style={{
                  fontSize: 9, fontFamily: 'Space Mono, monospace',
                  color: st.color, background: st.bg,
                  border: `1px solid ${st.border}`,
                  borderRadius: 10, padding: '2px 7px',
                }}>
                  {audit.status.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'Space Mono, monospace' }}>
                  {audit.id.slice(0, 8)}...
                </span>
                {audit.risk_score !== null && (
                  <span style={{
                    fontSize: 11, fontFamily: 'Space Mono, monospace', fontWeight: 700,
                    color: (audit.risk_score ?? 0) >= 70 ? '#ef4444' : (audit.risk_score ?? 0) >= 40 ? '#f59e0b' : '#10b981',
                  }}>
                    {audit.risk_score}/100
                  </span>
                )}
              </div>
              <p style={{ fontSize: 10, color: '#cbd5e1', marginTop: 4, fontFamily: 'Space Mono, monospace' }}>
                {formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
