import { Ad, Category } from '@/types/database';
import { INITIAL_ADS, INITIAL_CATEGORIES } from './mockData';

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch('/api/categories', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn('Falling back to local categories', err);
  }
  return INITIAL_CATEGORIES;
}

export async function fetchActiveAds(filters?: { categoryId?: string; city?: string; search?: string }): Promise<Ad[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.categoryId && filters.categoryId !== 'all') params.set('categoryId', filters.categoryId);
    if (filters?.city && filters.city !== 'all') params.set('city', filters.city);
    if (filters?.search) params.set('search', filters.search);

    const res = await fetch(`/api/ads?${params.toString()}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('Falling back to local ads', err);
  }

  let ads = INITIAL_ADS.filter(ad => ad.status === 'activo');
  if (filters?.categoryId && filters.categoryId !== 'all') {
    ads = ads.filter(ad => ad.category_id === filters.categoryId);
  }
  if (filters?.city && filters.city !== 'all') {
    ads = ads.filter(ad => ad.city === filters.city || ad.city === 'Ambas');
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    ads = ads.filter(ad => 
      ad.title.toLowerCase().includes(s) || 
      ad.description.toLowerCase().includes(s)
    );
  }
  return ads;
}

export async function fetchAllAdsAdmin(): Promise<Ad[]> {
  try {
    const res = await fetch('/api/admin/ads', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('Falling back to local all ads', err);
  }
  return INITIAL_ADS;
}

export async function registerWhatsAppClick(adId: string): Promise<void> {
  try {
    await fetch(`/api/ads/${adId}/click`, { method: 'POST' });
  } catch (err) {
    console.error('Error registering click', err);
  }
}

export async function registerAdView(adId: string): Promise<void> {
  try {
    await fetch(`/api/ads/${adId}/view`, { method: 'POST' });
  } catch (err) {
    console.error('Error registering view', err);
  }
}

export async function createAdWithPayment(params: {
  title: string;
  description: string;
  categoryId: string;
  city: 'Puno' | 'Juliaca' | 'Ambas';
  contactPhone: string;
  address?: string;
  salaryInfo?: string;
  daysContracted: number;
  yapeValidationCode: string;
}): Promise<{ success: boolean; adId: string }> {
  try {
    const res = await fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, adId: data.ad.id };
    }
    const err = await res.json();
    throw new Error(err.error || 'Error al guardar aviso');
  } catch (e: any) {
    console.error('API create ad error', e);
    throw e;
  }
}

export async function approvePaymentAndAd(paymentId: string, adId: string, daysContracted: number): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, adId, daysContracted })
    });
    return res.ok;
  } catch (err) {
    console.error('Error approving payment', err);
    return false;
  }
}

export interface PlatformConfig {
  pricePerDay: number;
  yapePhone: string;
  yapeHolder: string;
  autoApprove: boolean;
  minDays: number;
  maxDays: number;
}

export const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  pricePerDay: 0.50,
  yapePhone: '951 847 210',
  yapeHolder: 'Avisos Clasificados Puno',
  autoApprove: false,
  minDays: 1,
  maxDays: 30
};

export async function fetchPlatformConfig(): Promise<PlatformConfig> {
  try {
    const res = await fetch('/api/config', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.pricePerDay === 'number') {
        return { ...DEFAULT_PLATFORM_CONFIG, ...data };
      }
    }
  } catch (err) {
    console.warn('Falling back to default platform config', err);
  }
  return DEFAULT_PLATFORM_CONFIG;
}

export async function updatePlatformConfig(newConfig: Partial<PlatformConfig>): Promise<boolean> {
  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    });
    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
    return false;
  } catch (err) {
    console.error('Error updating platform config', err);
    return false;
  }
}

