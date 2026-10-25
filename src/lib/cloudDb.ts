import { Ad, Category, RegisteredUser } from '@/types/database';
import { INITIAL_ADS, INITIAL_CATEGORIES, INITIAL_USERS } from './mockData';

const EDGE_CONFIG_URL = process.env.EDGE_CONFIG || '';
const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID || '';
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN || '';

export interface AppConfig {
  pricePerDay: number;
  yapePhone: string;
  yapeHolder: string;
  autoApprove: boolean;
  minDays: number;
  maxDays: number;
}

export const DEFAULT_CONFIG: AppConfig = {
  pricePerDay: 0.50,
  yapePhone: '951 847 210',
  yapeHolder: 'Avisos Clasificados Puno',
  autoApprove: false,
  minDays: 1,
  maxDays: 30
};

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
  // Si Edge Config está configurado, SIEMPRE usar Edge Config como fuente de verdad.
  // No caer al mockData aunque el array esté vacío.
  if (!EDGE_CONFIG_URL) return [];
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
  return [];
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

export async function getCloudConfig(): Promise<AppConfig> {
  if (!EDGE_CONFIG_URL) return DEFAULT_CONFIG;
  try {
    const [baseUrl, query] = EDGE_CONFIG_URL.split('?');
    const res = await fetch(`${baseUrl}/item/config?${query}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.pricePerDay === 'number') {
        return { ...DEFAULT_CONFIG, ...data };
      }
    }
  } catch (err) {
    console.error('Error fetching config from Edge Config:', err);
  }
  return DEFAULT_CONFIG;
}

export async function updateCloudConfig(newConfig: Partial<AppConfig>): Promise<boolean> {
  if (!EDGE_CONFIG_ID || !VERCEL_API_TOKEN) return false;
  try {
    const current = await getCloudConfig();
    const merged = { ...current, ...newConfig };

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
            key: 'config',
            value: merged
          }
        ]
      })
    });
    return res.ok;
  } catch (err) {
    console.error('Error updating config in Edge Config:', err);
    return false;
  }
}

export async function getCloudUsers(): Promise<RegisteredUser[]> {
  // Si Edge Config está configurado, SIEMPRE usar Edge Config como fuente de verdad.
  // No caer al mockData aunque el array esté vacío (panel limpio es válido).
  if (!EDGE_CONFIG_URL) return [];
  try {
    const [baseUrl, query] = EDGE_CONFIG_URL.split('?');
    const res = await fetch(`${baseUrl}/item/users?${query}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      // Retornar el array directamente (puede ser [] si no hay usuarios aún)
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.error('Error fetching users from Edge Config:', err);
  }
  return [];
}

export async function updateCloudUsers(updatedUsers: RegisteredUser[]): Promise<boolean> {
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
            key: 'users',
            value: updatedUsers
          }
        ]
      })
    });
    return res.ok;
  } catch (err) {
    console.error('Error writing users to Edge Config:', err);
    return false;
  }
}

export async function saveCloudUser(user: RegisteredUser): Promise<boolean> {
  try {
    const current = await getCloudUsers();
    const index = current.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase() || u.id === user.id);
    let updated: RegisteredUser[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = { ...updated[index], ...user };
    } else {
      updated = [user, ...current];
    }
    return await updateCloudUsers(updated);
  } catch (err) {
    console.error('Error saving user to Edge Config:', err);
    return false;
  }
}

export async function deleteCloudUser(userIdOrEmail: string, deleteUserAds = true): Promise<boolean> {
  try {
    const key = userIdOrEmail.trim().toLowerCase();

    // 1. Eliminar de la lista de usuarios en Edge Config
    const currentUsers = await getCloudUsers();
    const updatedUsers = currentUsers.filter(u => 
      u.id.toLowerCase() !== key && u.email.toLowerCase() !== key
    );
    await updateCloudUsers(updatedUsers);

    // 2. Si deleteUserAds es true, eliminar también sus anuncios asociados
    if (deleteUserAds) {
      const currentAds = await getCloudAds();
      const updatedAds = currentAds.filter(ad => {
        const matchId = ad.advertiser_id && ad.advertiser_id.toLowerCase() === key;
        const matchEmail = ad.user_email && ad.user_email.toLowerCase() === key;
        return !matchId && !matchEmail;
      });
      await updateCloudAds(updatedAds);
    }

    return true;
  } catch (err) {
    console.error('Error deleting user from Edge Config:', err);
    return false;
  }
}


