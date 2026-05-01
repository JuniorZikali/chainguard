import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query as { id: string };
  const db = getServerSupabase();

  const [analysisRes, propertiesRes, findingsRes, logsRes] = await Promise.all([
    db.from('analyses').select('*, contract:contracts(*)').eq('id', id).single(),
    db.from('properties').select('*').eq('analysis_id', id),
    db.from('findings').select('*').eq('analysis_id', id),
    db.from('audit_logs').select('*').eq('analysis_id', id),
  ]);

  if (analysisRes.error) return res.status(404).json({ error: 'Analysis not found' });

  return res.status(200).json({
    analysis: analysisRes.data,
    contract: analysisRes.data.contract,
    properties: propertiesRes.data || [],
    findings: findingsRes.data || [],
    logs: logsRes.data || [],
  });
}
