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
    const baseName = file.name.replace('.sol', '');
    if (!contractName) setContractName(baseName);
    const reader = new FileReader();
    reader.onload = (e) => setSourceCode(e.target?.result as string);
    reader.readAsText(file);
  }, [contractName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.sol'] },
    maxFiles: 1,
  });

  const handleSubmit = async () => {
    if (!sourceCode.trim()) return setError('No contract source code provided.');
    if (!contractName.trim()) return setError('Please provide a contract name.');
    setError('');
    setIsLoading(true);

    try {
      // 1. Upload contract
      const cRes = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contractName, source_code: sourceCode }),
      });
      const contract = await cRes.json();
      if (!cRes.ok) throw new Error(contract.error || 'Failed to upload contract');

      // 2. Start analysis
      const aRes = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    background: '#0b1020',
    border: '1px solid #1e2d4a',
    borderRadius: 12,
    padding: 28,
  };

  return (
    <div style={panel}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, color: '#00e5ff', letterSpacing: 2, marginBottom: 4 }}>
          // AUDIT TARGET
        </h2>
        <p style={{ color: '#5c6b8a', fontSize: 13 }}>Upload a .sol file or paste Solidity code to begin AI-powered analysis</p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['drop', 'paste'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              fontFamily: 'Space Mono, monospace', fontSize: 11, padding: '6px 16px',
              borderRadius: 6, border: '1px solid',
              borderColor: mode === m ? '#00e5ff' : '#1e2d4a',
              background: mode === m ? 'rgba(0,229,255,0.1)' : 'transparent',
              color: mode === m ? '#00e5ff' : '#5c6b8a',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {m === 'drop' ? '📁 FILE UPLOAD' : '📝 PASTE CODE'}
          </button>
        ))}
      </div>

      {/* Contract name input */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#5c6b8a', display: 'block', marginBottom: 6, fontFamily: 'Space Mono, monospace' }}>
          CONTRACT_NAME
        </label>
        <input
          value={contractName}
          onChange={(e) => setContractName(e.target.value)}
          placeholder="e.g. VulnerableBank"
          style={{
            width: '100%', padding: '10px 14px',
            background: '#050810', border: '1px solid #1e2d4a', borderRadius: 8,
            color: '#e8edf5', fontSize: 14, outline: 'none',
            fontFamily: 'Space Mono, monospace',
          }}
        />
      </div>

      {/* File drop or paste */}
      {mode === 'drop' ? (
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? '#00e5ff' : '#1e2d4a'}`,
            borderRadius: 10,
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragActive ? 'rgba(0,229,255,0.05)' : 'transparent',
            transition: 'all 0.2s',
            marginBottom: 16,
          }}
        >
          <input {...getInputProps()} />
          <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
          {fileName ? (
            <p style={{ color: '#00e5ff', fontFamily: 'Space Mono, monospace', fontSize: 13 }}>{fileName}</p>
          ) : (
            <>
              <p style={{ color: '#e8edf5', fontSize: 14, marginBottom: 4 }}>
                {isDragActive ? 'Drop the file here...' : 'Drag & drop your .sol file'}
              </p>
              <p style={{ color: '#5c6b8a', fontSize: 12 }}>or click to browse</p>
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
            background: '#050810', border: '1px solid #1e2d4a', borderRadius: 8,
            color: '#e8edf5', fontSize: 13, outline: 'none', resize: 'vertical',
            fontFamily: 'Space Mono, monospace', marginBottom: 16,
          }}
        />
      )}

      {error && (
        <div style={{
          background: 'rgba(255,59,92,0.1)', border: '1px solid #ff3b5c',
          borderRadius: 8, padding: '10px 14px', marginBottom: 16,
          color: '#ff3b5c', fontSize: 13, fontFamily: 'Space Mono, monospace',
        }}>
          ⚠ {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isLoading || !sourceCode.trim()}
        style={{
          width: '100%', padding: '14px',
          background: isLoading ? '#1e2d4a' : 'linear-gradient(90deg, #00e5ff, #7b61ff)',
          border: 'none', borderRadius: 8, cursor: isLoading ? 'wait' : 'pointer',
          color: isLoading ? '#5c6b8a' : '#050810',
          fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700,
          letterSpacing: 1, transition: 'all 0.2s',
          opacity: !sourceCode.trim() ? 0.5 : 1,
        }}
      >
        {isLoading ? '⟳ INITIATING ANALYSIS...' : '▶ RUN AI AUDIT'}
      </button>
    </div>
  );
}
