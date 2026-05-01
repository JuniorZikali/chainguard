import React from 'react';
import Head from 'next/head';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>ChainGuard — Smart Contract Auditor</title>
        <meta name="description" content="AI-Powered Smart Contract Auditing Framework" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%2300e5ff'/><text y='24' font-size='20' fill='%23050810'>⬡</text></svg>" />
      </Head>

      {/* Background effects */}
      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="bg-glow2" />

      {/* Navigation */}
      <nav
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 48px',
          borderBottom: '1px solid #1e2d4a',
          background: 'rgba(5,8,16,0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #00e5ff, #7b61ff)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: '#050810',
            }}
          >
            ⬡
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>
            Chain<span style={{ color: '#00e5ff' }}>Guard</span>
          </span>
          <span
            style={{
              fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#5c6b8a',
              border: '1px solid #1e2d4a', borderRadius: 4, padding: '3px 8px',
            }}
          >
            v2.0 · HIT
          </span>
        </div>

        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {['Dashboard', 'Docs', 'API'].map((item) => (
            <a
              key={item}
              href={item === 'Dashboard' ? '/' : '#'}
              style={{
                fontSize: 13, fontWeight: 600, color: '#5c6b8a',
                textDecoration: 'none', letterSpacing: 0.5, textTransform: 'uppercase',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#e8edf5')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#5c6b8a')}
            >
              {item}
            </a>
          ))}
        </div>

        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#00e5ff',
          }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: '#00ff94',
            display: 'inline-block', animation: 'pulse 2s infinite',
          }} />
          LIVE · SUPABASE
        </div>
      </nav>

      {/* Main content */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </main>
    </>
  );
}
