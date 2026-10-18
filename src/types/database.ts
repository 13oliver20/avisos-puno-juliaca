export type UserRole = 'admin' | 'anunciante';

export type AdStatus = 'activo' | 'pendiente_pago' | 'expirado' | 'rechazado';

export type PaymentStatus = 'pendiente' | 'aprobado' | 'rechazado';

export type CityOption = 'Puno' | 'Juliaca' | 'Ambas';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  created_at: string;
}

export interface Ad {
  id: string;
  advertiser_id?: string | null;
  category_id: string;
  title: string;
  description: string;
  city: CityOption;
  contact_phone: string;
  status: AdStatus;
  start_date?: string | null;
  end_date?: string | null;
  salary_info?: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category;
  metrics?: AdMetric;
  payment?: Payment;
}

export interface AdMetric {
  id: string;
  ad_id: string;
  views_count: number;
  whatsapp_clicks: number;
  updated_at: string;
}

export interface Payment {
  id: string;
  ad_id: string;
  yape_validation_code: string;
  amount_paid: number;
  days_contracted: number;
  status: PaymentStatus;
  reviewed_by?: string | null;
  created_at: string;
  updated_at: string;
}
