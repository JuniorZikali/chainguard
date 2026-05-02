import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabase } from '@/lib/supabase';
import { analyseContract, generateFoundryTests } from '@/lib/llm';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { contract_id } = req.body as { contract_id: string };
  if (!contract_id) return res.status(400).json({ error: 'contract_id is required' });

  const db = getServerSupabase();

  const { data: contract, error: cErr } = await db
    .from('contracts')
    .select('*')
    .eq('id', contract_id)
    .single();
  if (cErr || !contract) return res.status(404).json({ error: 'Contract not found' });

  const { data: analysis, error: aErr } = await db
    .from('analyses')
    .insert({
      contract_id,
      llm_model: 'llama-3.3-70b-versatile',
      prompt_version: 'v2',
      status: 'running',
    })
    .select()
    .single();
  if (aErr || !analysis) return res.status(500).json({ error: 'Failed to create analysis' });

  res.status(202).json({ id: analysis.id, status: 'running' });

  runPipeline(db, analysis.id, contract).catch(console.error);
}

async function runPipeline(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  analysisId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contract: any
) {
  try {
    const llmResult = await analyseContract(contract.source_code, contract.name);

    if (llmResult.invariants?.length) {
      const props = llmResult.invariants.map((inv) => ({
        analysis_id: analysisId,
        name: inv.name,
        description: inv.description,
        category: inv.category,
      }));
      await db.from('properties').insert(props);
    }

    if (llmResult.findings?.length) {
      const findings = llmResult.findings.map((f) => ({
        analysis_id: analysisId,
        vulnerability_class: f.vulnerability_class,
        severity: f.severity,
        affected_function: f.affected_function || null,
        affected_line: f.affected_line || null,
        explanation: f.explanation,
        recommendation: f.recommendation,
      }));
      await db.from('findings').insert(findings);
    }

    let foundryCode = '';
    try {
      foundryCode = await generateFoundryTests(
        contract.source_code,
        contract.name,
        llmResult.invariants || []
      );
    } catch {
      foundryCode = '// Foundry test generation failed — re-run locally';
    }

    const { data: prev } = await db
      .from('audit_logs')
      .select('hash')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const prevHash = prev?.hash || '';
    const summary = llmResult.summary || `Analysis of ${contract.name}`;
    const payload = `${prevHash}|${analysisId}|${contract.id}|${summary}|${llmResult.risk_score}`;
    const entryHash = crypto.createHash('sha256').update(payload).digest('hex');

    await db.from('audit_logs').insert({
      contract_id: contract.id,
      analysis_id: analysisId,
      summary,
      risk_score: llmResult.risk_score,
      hash: entryHash,
      prev_hash: prevHash || null,
    });

    await db
      .from('analyses')
      .update({
        status: 'completed',
        risk_score: llmResult.risk_score,
        summary,
        foundry_test_code: foundryCode,
        completed_at: new Date().toISOString(),
      })
      .eq('id', analysisId);
  } catch (err) {
    console.error('Pipeline error:', err);
    await db
      .from('analyses')
      .update({ status: 'failed', completed_at: new Date().toISOString() })
      .eq('id', analysisId);
  }
}
