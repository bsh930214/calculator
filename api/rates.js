export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  const response = await fetch(
    `${supabaseUrl}/rest/v1/exchange_rates?id=eq.1&select=rates,updated_at`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    }
  );

  const data = await response.json();

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'No rates found' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');
  res.json({ rates: data[0].rates, updated_at: data[0].updated_at });
}
