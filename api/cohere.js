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
    const { keyName } = req.body;

    // Return Supabase Anon Key
    if (keyName === 'SUPABASE_ANON_KEY') {
      return res.status(200).json({ key: process.env.VITE_SUPABASE_ANON_KEY });
    }

    // Return Supabase URL
    if (keyName === 'SUPABASE_URL') {
      return res.status(200).json({ key: process.env.VITE_SUPABASE_URL });
    }

    // Return Cohere Key by type
    if (keyName && keyName.includes('COHERE')) {
      let type = 2; // default

      if (keyName === 'COHERE_1') type = 1;
      if (keyName === 'COHERE_2') type = 2;

      const { data: cohereKey, error: rpcError } = await supabase
        .rpc('getcohereapi', { type });

      if (rpcError || !cohereKey) {
        console.error('RPC error:', rpcError);
        return res.status(500).json({ error: 'Failed to retrieve key' });
      }

      return res.status(200).json({ key: cohereKey });
    }

    // Unknown keyName
    return res.status(400).json({ error: 'Invalid keyName' });

  } catch (err) {
    console.error('Key fetch error:', err.message);
    res.status(500).json({ error: 'Key retrieval failed' });
  }
}
