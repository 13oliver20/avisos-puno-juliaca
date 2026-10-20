import { NextResponse } from 'next/server';
import { INITIAL_ADS, INITIAL_CATEGORIES } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export async function GET() {
  const edgeConfigId = process.env.EDGE_CONFIG_ID || 'ecfg_i0fqeyobzgfcswph8erbthzkcswz';
  const vercelToken = process.env.VERCEL_API_TOKEN;

  if (!vercelToken) {
    return NextResponse.json({ error: 'VERCEL_API_TOKEN not configured' }, { status: 500 });
  }

  try {
    const items = [
      { operation: 'upsert', key: 'categories', value: INITIAL_CATEGORIES },
      { operation: 'upsert', key: 'ads', value: INITIAL_ADS }
    ];

    const res = await fetch(`https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items })
    });

    const data = await res.json();
    return NextResponse.json({ success: true, count: INITIAL_ADS.length, result: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
