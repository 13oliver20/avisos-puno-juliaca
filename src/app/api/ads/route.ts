import { NextResponse } from 'next/server';
import { getCloudAds, getCloudCategories, updateCloudAds } from '@/lib/cloudDb';
import { Ad } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');
  const city = searchParams.get('city');
  const search = searchParams.get('search');

  let ads = await getCloudAds();

  // Filtrar activos
  ads = ads.filter(a => a.status === 'activo');

  if (categoryId && categoryId !== 'all') {
    ads = ads.filter(a => a.category_id === categoryId);
  }
  if (city && city !== 'all') {
    ads = ads.filter(a => a.city === city || a.city === 'Ambas');
  }
  if (search) {
    const q = search.toLowerCase();
    ads = ads.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.description.toLowerCase().includes(q) ||
      a.address?.toLowerCase().includes(q)
    );
  }

  ads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return NextResponse.json(ads);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      city,
      contactPhone,
      address,
      salaryInfo,
      daysContracted,
      yapeValidationCode
    } = body;

    const categories = await getCloudCategories();
    const category = categories.find(c => c.id === categoryId) || categories[0];

    const pricePerDay = 0.50;
    const totalAmount = Number((daysContracted * pricePerDay).toFixed(2));
    const now = new Date();
    const newAdId = `ad-${Date.now()}`;

    const newAd: Ad = {
      id: newAdId,
      category_id: categoryId,
      category,
      title,
      description,
      city,
      contact_phone: contactPhone,
      address,
      salary_info: salaryInfo,
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
        yape_validation_code: yapeValidationCode,
        amount_paid: totalAmount,
        days_contracted: daysContracted,
        status: 'pendiente',
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }
    };

    const currentAds = await getCloudAds();
    const updatedAds = [newAd, ...currentAds];
    await updateCloudAds(updatedAds);

    return NextResponse.json({ success: true, ad: newAd });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating ad' }, { status: 500 });
  }
}
