import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Check for POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Extract and validate the payload
  const { name, source_code, benchmark_label } = req.body as {
    name: string;
    source_code: string;
    benchmark_label?: string;
  };

  if (!name || !source_code) {
    return res.status(400).json({ error: 'name and source_code are required' });
  }

  // 3. Initialize Supabase Client securely using environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Failsafe to catch missing environment variables early
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables");
    return res.status(500).json({ error: "Server configuration error" });
  }
  
  const db = createClient(supabaseUrl, supabaseKey);

  // 4. Insert the contract into the database
  const { data, error } = await db
    .from('contracts')
    .insert({ 
      name, 
      source_code, 
      benchmark_label: benchmark_label || null 
    })
    .select()
    .single();

  // 5. Handle the response
  if (error) {
    console.error("Database Insert Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  
  return res.status(201).json(data);
}