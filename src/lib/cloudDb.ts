import { Ad, Category } from '@/types/database';
import { INITIAL_ADS, INITIAL_CATEGORIES } from './mockData';

const EDGE_CONFIG_URL = process.env.EDGE_CONFIG || '';
const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID || '';
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN || '';

export async function getCloudCategories(): Promise<Category[]> {
  if (!EDGE_CONFIG_URL) return INITIAL_CATEGORIES;
  try {
    const [baseUrl, query] = EDGE_CONFIG_URL.split('?');
    const res = await fetch(`${baseUrl}/item/categories?${query}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.error('Error fetching categories from Edge Config:', err);
  }
  return INITIAL_CATEGORIES;
}

export async function getCloudAds(): Promise<Ad[]> {
  if (!EDGE_CONFIG_URL) return INITIAL_ADS;
  try {
    const [baseUrl, query] = EDGE_CONFIG_URL.split('?');
    const res = await fetch(`${baseUrl}/item/ads?${query}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.error('Error fetching ads from Edge Config:', err);
  }
  return INITIAL_ADS;
}

export async function updateCloudAds(updatedAds: Ad[]): Promise<boolean> {
  if (!EDGE_CONFIG_ID || !VERCEL_API_TOKEN) return false;
  try {
    const res = await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'upsert',
            key: 'ads',
            value: updatedAds
          }
        ]
      })
    });
    return res.ok;
  } catch (err) {
    console.error('Error writing to Edge Config:', err);
    return false;
  }
}
