import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, type } = req.body;

    const { data: cohereKey, error: rpcError } = await supabase
      .rpc('getCohereAPI', { type: type || 2 });

    if (rpcError || !cohereKey) {
      console.error('RPC error:', rpcError);
      return res.status(500).json({ error: 'Failed to retrieve Cohere key' });
    }

    const response = await axios.post('https://api.cohere.ai/generate', {
      model: 'command',
      prompt,
      max_tokens: 100
    }, {
      headers: {
        'Authorization': `Bearer ${cohereKey}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error('Cohere API error:', err.message);
    res.status(500).json({ error: 'Cohere request failed' });
  }
}
