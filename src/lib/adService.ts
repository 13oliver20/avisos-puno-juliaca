import { supabase, isSupabaseConfigured } from './supabase/client';
import { Ad, Category, Payment } from '@/types/database';
import { INITIAL_ADS, INITIAL_CATEGORIES } from './mockData';

const LOCAL_STORAGE_KEY = 'avisos_puno_juliaca_local_ads';

export const getStoredAds = (): Ad[] => {
  if (typeof window === 'undefined') return INITIAL_ADS;
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!item) return INITIAL_ADS;
    return JSON.parse(item);
  } catch (e) {
    return INITIAL_ADS;
  }
};

export const saveStoredAds = (ads: Ad[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ads));
  } catch (e) {
    console.error('Error saving local ads', e);
  }
};

export async function fetchCategories(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (!error && data && data.length > 0) {
        return data as Category[];
      }
    } catch (e) {
      console.warn('Falling back to local categories', e);
    }
  }
  return INITIAL_CATEGORIES;
}

export async function fetchActiveAds(filters?: { categoryId?: string; city?: string; search?: string }): Promise<Ad[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('ads')
        .select(`
          *,
          category:categories(*),
          metrics(*)
        `)
        .eq('status', 'activo')
        .order('created_at', { ascending: false });

      if (filters?.categoryId && filters.categoryId !== 'all') {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters?.city && filters.city !== 'all') {
        query = query.or(`city.eq.${filters.city},city.eq.Ambas`);
      }

      const { data, error } = await query;
      if (!error && data) {
        let result = data as Ad[];
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          result = result.filter(ad => 
            ad.title.toLowerCase().includes(s) || 
            ad.description.toLowerCase().includes(s) ||
            ad.address?.toLowerCase().includes(s)
          );
        }
        return result;
      }
    } catch (e) {
      console.warn('Falling back to local ads fetch', e);
    }
  }

  // Fallback: Local storage or mock data
  let ads = getStoredAds().filter(ad => ad.status === 'activo');
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
      ad.description.toLowerCase().includes(s) ||
      ad.address?.toLowerCase().includes(s)
    );
  }
  return ads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function fetchAllAdsAdmin(): Promise<Ad[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          category:categories(*),
          metrics(*),
          payment:payments(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Ad[];
      }
    } catch (e) {
      console.warn('Falling back to local all ads', e);
    }
  }

  return getStoredAds().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function registerWhatsAppClick(adId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.rpc('increment_whatsapp_click', { p_ad_id: adId });
      return;
    } catch (e) {
      console.error('Error invoking Supabase RPC increment_whatsapp_click', e);
    }
  }

  // Local fallback
  const ads = getStoredAds();
  const updated = ads.map(ad => {
    if (ad.id === adId) {
      const currentClicks = ad.metrics?.whatsapp_clicks || 0;
      return {
        ...ad,
        metrics: {
          id: ad.metrics?.id || `met-${Date.now()}`,
          ad_id: ad.id,
          views_count: ad.metrics?.views_count || 0,
          whatsapp_clicks: currentClicks + 1,
          updated_at: new Date().toISOString()
        }
      };
    }
    return ad;
  });
  saveStoredAds(updated);
}

export async function registerAdView(adId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.rpc('increment_ad_view', { p_ad_id: adId });
      return;
    } catch (e) {
      console.error('Error invoking Supabase RPC increment_ad_view', e);
    }
  }

  // Local fallback
  const ads = getStoredAds();
  const updated = ads.map(ad => {
    if (ad.id === adId) {
      const currentViews = ad.metrics?.views_count || 0;
      return {
        ...ad,
        metrics: {
          id: ad.metrics?.id || `met-${Date.now()}`,
          ad_id: ad.id,
          views_count: currentViews + 1,
          whatsapp_clicks: ad.metrics?.whatsapp_clicks || 0,
          updated_at: new Date().toISOString()
        }
      };
    }
    return ad;
  });
  saveStoredAds(updated);
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
  const pricePerDay = 0.50;
  const totalAmount = Number((params.daysContracted * pricePerDay).toFixed(2));

  if (isSupabaseConfigured()) {
    try {
      // 1. Insert ad in 'pendiente_pago'
      const { data: adData, error: adError } = await supabase
        .from('ads')
        .insert({
          title: params.title,
          description: params.description,
          category_id: params.categoryId,
          city: params.city,
          contact_phone: params.contactPhone,
          address: params.address,
          salary_info: params.salaryInfo,
          status: 'pendiente_pago',
        })
        .select()
        .single();

      if (adError || !adData) throw adError;

      // 2. Insert payment
      const { error: payError } = await supabase
        .from('payments')
        .insert({
          ad_id: adData.id,
          yape_validation_code: params.yapeValidationCode,
          amount_paid: totalAmount,
          days_contracted: params.daysContracted,
          status: 'pendiente',
        });

      if (payError) throw payError;

      return { success: true, adId: adData.id };
    } catch (e) {
      console.error('Error creating ad on Supabase:', e);
      throw e;
    }
  }

  // Local fallback
  const newAdId = `ad-${Date.now()}`;
  const now = new Date();
  const category = INITIAL_CATEGORIES.find(c => c.id === params.categoryId) || INITIAL_CATEGORIES[0];

  const newAd: Ad = {
    id: newAdId,
    category_id: params.categoryId,
    category,
    title: params.title,
    description: params.description,
    city: params.city,
    contact_phone: params.contactPhone,
    address: params.address,
    salary_info: params.salaryInfo,
    status: 'pendiente_pago',
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    metrics: {
      id: `met-${Date.now()}`,
      ad_id: newAdId,
      views_count: 0,
      whatsapp_clicks: 0,
      updated_at: now.toISOString()
    },
    payment: {
      id: `pay-${Date.now()}`,
      ad_id: newAdId,
      yape_validation_code: params.yapeValidationCode,
      amount_paid: totalAmount,
      days_contracted: params.daysContracted,
      status: 'pendiente',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    }
  };

  const ads = getStoredAds();
  saveStoredAds([newAd, ...ads]);
  return { success: true, adId: newAdId };
}

export async function approvePaymentAndAd(paymentId: string, adId: string, daysContracted: number): Promise<boolean> {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + daysContracted * 24 * 60 * 60 * 1000);

  if (isSupabaseConfigured()) {
    try {
      // Usar RPC o updates combinados
      const { error: payErr } = await supabase
        .from('payments')
        .update({ status: 'aprobado', updated_at: startDate.toISOString() })
        .eq('id', paymentId);
      if (payErr) throw payErr;

      const { error: adErr } = await supabase
        .from('ads')
        .update({
          status: 'activo',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          updated_at: startDate.toISOString()
        })
        .eq('id', adId);
      if (adErr) throw adErr;

      return true;
    } catch (e) {
      console.error('Error approving payment in Supabase', e);
      return false;
    }
  }

  // Local fallback
  const ads = getStoredAds();
  const updated = ads.map(ad => {
    if (ad.id === adId) {
      return {
        ...ad,
        status: 'activo' as const,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        payment: ad.payment ? { ...ad.payment, status: 'aprobado' as const } : undefined
      };
    }
    return ad;
  });
  saveStoredAds(updated);
  return true;
}
