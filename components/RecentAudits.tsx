import React, { useEffect, useState } from 'react';
import type { Analysis } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  onSelect: (id: string) => void;
  selectedId?: string;
  refreshKey: number;
}

const STATUS_COLOR: Record<string, string> = {
  completed: '#00ff94',
  running: '#00e5ff',
  pending: '#ff9f0a',
  failed: '#ff3b5c',
};

export default function RecentAudits({ onSelect, selectedId, refreshKey }: Props) {
  const [audits, setAudits] = useState<Analysis[]>([]);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((data) => setAudits(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [refreshKey]);

  const panel: React.CSSProperties = {
    background: '#0b1020', border: '1px solid #1e2d4a', borderRadius: 12, padding: 20,
  };

  return (
    <div style={panel}>
      <h3 style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#5c6b8a', letterSpacing: 2, marginBottom: 16 }}>
        // RECENT AUDITS
      </h3>

      {audits.length === 0 && (
        <p style={{ color: '#5c6b8a', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
          No audits yet. Upload a contract to begin.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {audits.map((audit) => (
          <div
            key={audit.id}
            onClick={() => onSelect(audit.id)}
            style={{
              padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
              border: '1px solid',
              borderColor: selectedId === audit.id ? '#00e5ff' : '#1e2d4a',
              background: selectedId === audit.id ? 'rgba(0,229,255,0.05)' : '#050810',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#e8edf5' }}>
                {audit.contract?.name || 'Unknown'}
              </span>
              <span style={{
                fontSize: 9, fontFamily: 'Space Mono, monospace',
                color: STATUS_COLOR[audit.status] || '#5c6b8a',
                background: STATUS_COLOR[audit.status] + '22' || 'transparent',
                border: `1px solid ${STATUS_COLOR[audit.status] || '#5c6b8a'}`,
                borderRadius: 10, padding: '2px 7px',
              }}>
                {audit.status.toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#5c6b8a', fontFamily: 'Space Mono, monospace' }}>
                {audit.id.slice(0, 8)}...
              </span>
              {audit.risk_score !== null && (
                <span style={{
                  fontSize: 11, fontFamily: 'Space Mono, monospace',
                  color: audit.risk_score >= 70 ? '#ff3b5c' : audit.risk_score >= 40 ? '#ff9f0a' : '#00ff94',
                }}>
                  {audit.risk_score}/100
                </span>
              )}
            </div>
            <p style={{ fontSize: 10, color: '#3d4f6e', marginTop: 4, fontFamily: 'Space Mono, monospace' }}>
              {formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
