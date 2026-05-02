import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = getServerSupabase();

    const { data: analyses, error } = await db
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!analyses || analyses.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch contracts separately
    const contractIds = Array.from(new Set(analyses.map((a) => a.contract_id)));
    const { data: contracts } = await db
      .from('contracts')
      .select('id, name, benchmark_label, created_at')
      .in('id', contractIds);

    const contractMap = Object.fromEntries((contracts || []).map((c) => [c.id, c]));

    const result = analyses.map((a) => ({
      ...a,
      contract: contractMap[a.contract_id] || null,
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: String(err) });
  }
}