const CURRENCIES = ['USD', 'JPY', 'EUR', 'CNY', 'GBP', 'HKD', 'SGD', 'AUD', 'THB', 'VND'];

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized');
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  const erRes = await fetch('https://open.er-api.com/v6/latest/KRW');
  const erData = await erRes.json();

  if (erData.result !== 'success') {
    return res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }

  // open.er-api: base=KRW이므로 "1 KRW = X 외화" → 역수 = "1 외화 = X KRW"
  const rates = { KRW: 1 };
  for (const code of CURRENCIES) {
    if (erData.rates[code]) {
      rates[code] = parseFloat((1 / erData.rates[code]).toPrecision(4));
    }
  }

  const upsertRes = await fetch(
    `${supabaseUrl}/rest/v1/exchange_rates`,
    {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ id: 1, rates, updated_at: new Date().toISOString() }),
    }
  );

  if (!upsertRes.ok) {
    const err = await upsertRes.text();
    return res.status(500).json({ error: 'Failed to save rates', detail: err });
  }

  res.json({ success: true, rates });
}
