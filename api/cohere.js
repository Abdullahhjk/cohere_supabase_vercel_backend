import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { type, keyName } = req.body;

    // Handle special keys
    if (keyName === 'SUPABASE_ANON_KEY') {
      return res.status(200).json({ key: process.env.VITE_SUPABASE_ANON_KEY });
    }

    if (keyName === 'SUPABASE_URL') {
      return res.status(200).json({ key: process.env.VITE_SUPABASE_URL });
    }

    // Default: fetch Cohere key by type
    const { data: cohereKey, error: rpcError } = await supabase
      .rpc('getcohereapi', { type: type || 2 });

    if (rpcError || !cohereKey) {
      console.error('RPC error:', rpcError);
      return res.status(500).json({ error: 'Failed to retrieve key' });
    }

    return res.status(200).json({ key: cohereKey });

  } catch (err) {
    console.error('Key fetch error:', err.message);
    res.status(500).json({ error: 'Key retrieval failed' });
  }
}
