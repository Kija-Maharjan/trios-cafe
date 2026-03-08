import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://xlerblhqlhkinzquygcm.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (!supabaseKey) {
    return res.status(500).json({ error: 'Supabase key not configured.' });
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { customer_name, table_no, items, total } = req.body;
      if (!items || !total) return res.status(400).json({ error: 'Missing items or total' });
      const { data, error } = await supabase
        .from('orders')
        .insert([{ customer_name: customer_name||'Guest', table_no: table_no||'—', items, total, created_at: new Date().toISOString() }])
        .select();
      if (error) throw error;
      return res.status(201).json(data[0]);
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase.from('orders').delete().neq('id', 0);
      if (error) throw error;
      return res.status(200).json({ message: 'All orders cleared' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}