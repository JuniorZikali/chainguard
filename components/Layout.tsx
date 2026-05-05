import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Docs', href: '/docs' },
    { label: 'API', href: '/api-reference' },
  ];

  return (
    <>
      <Head>
        <title>ChainGuard — Smart Contract Auditor</title>
        <meta name="description" content="AI-Powered Smart Contract Auditing Framework" />
      </Head>

      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="bg-glow2" />

      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 48px',
        borderBottom: '1px solid #e2e8f0',
        background: 'rgba(248,250,252,0.9)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)',
            borderRadius: 8, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff',
          }}>⬡</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: -0.5, color: '#0f172a' }}>
            Chain<span style={{ color: '#0ea5e9' }}>Guard</span>
          </span>
          <span style={{
            fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#64748b',
            border: '1px solid #e2e8f0', borderRadius: 4, padding: '3px 8px',
            background: '#f1f5f9',
          }}>v2.0 · HIT</span>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {navItems.map(({ label, href }) => {
            const active = router.pathname === href;
            return (
              <a key={label} href={href} style={{
                fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 8,
                textDecoration: 'none', letterSpacing: 0.3,
                background: active ? '#0ea5e9' : 'transparent',
                color: active ? '#fff' : '#64748b',
                transition: 'all 0.2s',
                border: active ? '1px solid #0ea5e9' : '1px solid transparent',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = active ? '#fff' : '#0f172a'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? '#fff' : '#64748b'; }}
              >
                {label}
              </a>
            );
          })}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#10b981',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 20, padding: '5px 12px',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          LIVE · SUPABASE
        </div>
      </nav>

      <main style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </main>
    </>
  );
}
