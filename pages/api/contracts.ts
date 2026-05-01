import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabase } from '@/lib/supabase';

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, source_code, benchmark_label } = req.body as {
    name: string;
    source_code: string;
    benchmark_label?: string;
  };

  if (!name || !source_code) {
    return res.status(400).json({ error: 'name and source_code are required' });
  }

  const db = getServerSupabase();
  const { data, error } = await db
    .from('contracts')
    .insert({ name, source_code, benchmark_label: benchmark_label || null })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
}
