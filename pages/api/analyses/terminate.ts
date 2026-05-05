import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { analysis_id } = req.body as { analysis_id: string };
  if (!analysis_id) return res.status(400).json({ error: 'analysis_id is required' });

  const db = getServerSupabase();

  const { data, error } = await db
    .from('analyses')
    .update({
      status: 'failed',
      summary: 'Scan terminated by user.',
      completed_at: new Date().toISOString(),
    })
    .eq('id', analysis_id)
    .in('status', ['pending', 'running'])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Analysis not found or already completed' });

  return res.status(200).json({ success: true, status: 'failed' });
}
