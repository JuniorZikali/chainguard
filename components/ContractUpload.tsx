import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  onAnalysisStarted: (analysisId: string) => void;
}

export default function ContractUpload({ onAnalysisStarted }: Props) {
  const [contractName, setContractName] = useState('');
  const [sourceCode, setSourceCode] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'drop' | 'paste'>('drop');

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    setFileName(file.name);
    if (!contractName) setContractName(file.name.replace('.sol', ''));
    const reader = new FileReader();
    reader.onload = (e) => setSourceCode(e.target?.result as string);
    reader.readAsText(file);
  }, [contractName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/plain': ['.sol'] }, maxFiles: 1,
  });

  const handleSubmit = async () => {
    if (!sourceCode.trim()) return setError('No contract source code provided.');
    if (!contractName.trim()) return setError('Please provide a contract name.');
    setError(''); setIsLoading(true);
    try {
      const cRes = await fetch('/api/contracts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contractName, source_code: sourceCode }),
      });
      const contract = await cRes.json();
      if (!cRes.ok) throw new Error(contract.error || 'Failed to upload contract');

      const aRes = await fetch('/api/analyses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract_id: contract.id }),
      });
      const analysis = await aRes.json();
      if (!aRes.ok) throw new Error(analysis.error || 'Failed to start analysis');
      onAnalysisStarted(analysis.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const panel: React.CSSProperties = {
    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 28,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  };

  return (
    <div style={panel}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#0ea5e9', letterSpacing: 1, marginBottom: 4 }}>
          // AUDIT TARGET
        </h2>
        <p style={{ color: '#64748b', fontSize: 13 }}>Upload a .sol file or paste Solidity code to begin AI-powered analysis</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['drop', 'paste'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{
            fontFamily: 'Space Mono, monospace', fontSize: 11, padding: '6px 16px',
            borderRadius: 6, border: '1px solid',
            borderColor: mode === m ? '#0ea5e9' : '#e2e8f0',
            background: mode === m ? '#eff6ff' : '#f8fafc',
            color: mode === m ? '#0ea5e9' : '#64748b',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {m === 'drop' ? '📁 FILE UPLOAD' : '📝 PASTE CODE'}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6, fontFamily: 'Space Mono, monospace' }}>
          CONTRACT_NAME
        </label>
        <input
          value={contractName}
          onChange={(e) => setContractName(e.target.value)}
          placeholder="e.g. VulnerableBank"
          style={{
            width: '100%', padding: '10px 14px',
            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
            color: '#0f172a', fontSize: 14, outline: 'none',
            fontFamily: 'Space Mono, monospace',
          }}
        />
      </div>

      {mode === 'drop' ? (
        <div {...getRootProps()} style={{
          border: `2px dashed ${isDragActive ? '#0ea5e9' : '#e2e8f0'}`,
          borderRadius: 10, padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
          background: isDragActive ? '#eff6ff' : '#f8fafc',
          transition: 'all 0.2s', marginBottom: 16,
        }}>
          <input {...getInputProps()} />
          <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
          {fileName ? (
            <p style={{ color: '#0ea5e9', fontFamily: 'Space Mono, monospace', fontSize: 13 }}>{fileName}</p>
          ) : (
            <>
              <p style={{ color: '#0f172a', fontSize: 14, marginBottom: 4 }}>
                {isDragActive ? 'Drop the file here...' : 'Drag & drop your .sol file'}
              </p>
              <p style={{ color: '#64748b', fontSize: 12 }}>or click to browse</p>
            </>
          )}
        </div>
      ) : (
        <textarea
          value={sourceCode}
          onChange={(e) => setSourceCode(e.target.value)}
          placeholder={`// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract MyContract {\n    ...\n}`}
          style={{
            width: '100%', height: 220, padding: '12px 14px',
            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
            color: '#0f172a', fontSize: 13, outline: 'none', resize: 'vertical',
            fontFamily: 'Space Mono, monospace', marginBottom: 16,
          }}
        />
      )}

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 8, padding: '10px 14px', marginBottom: 16,
          color: '#ef4444', fontSize: 13, fontFamily: 'Space Mono, monospace',
        }}>
          ⚠ {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isLoading || !sourceCode.trim()}
        style={{
          width: '100%', padding: '14px',
          background: isLoading || !sourceCode.trim() ? '#e2e8f0' : 'linear-gradient(90deg, #0ea5e9, #7c3aed)',
          border: 'none', borderRadius: 8,
          cursor: isLoading || !sourceCode.trim() ? 'not-allowed' : 'pointer',
          color: isLoading || !sourceCode.trim() ? '#94a3b8' : '#fff',
          fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700,
          letterSpacing: 1, transition: 'all 0.2s',
        }}
      >
        {isLoading ? '⟳ INITIATING ANALYSIS...' : '▶ RUN AI AUDIT'}
      </button>
    </div>
  );
}
