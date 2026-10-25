import { NextResponse } from 'next/server';
import { getCloudAds, getCloudCategories, updateCloudAds, getCloudConfig, saveCloudUser } from '@/lib/cloudDb';
import { Ad } from '@/types/database';
import { extractOnlyFirstName } from '@/lib/adTime';

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
      yapeValidationCode,
      advertiserId,
      advertiserName,
      userEmail
    } = body;

    const categories = await getCloudCategories();
    const category = categories.find(c => c.id === categoryId) || categories[0];

    const config = await getCloudConfig();
    const pricePerDay = typeof config.pricePerDay === 'number' ? config.pricePerDay : 0.50;
    const totalAmount = Number((daysContracted * pricePerDay).toFixed(2));
    const now = new Date();
    const newAdId = `ad-${Date.now()}`;
    const isAutoApprove = Boolean(config.autoApprove);
    const endDate = isAutoApprove 
      ? new Date(now.getTime() + daysContracted * 24 * 60 * 60 * 1000).toISOString() 
      : undefined;

    const newAd: Ad = {
      id: newAdId,
      advertiser_id: advertiserId || null,
      advertiser_name: advertiserName || null,
      user_email: userEmail ? userEmail.trim().toLowerCase() : null,
      category_id: categoryId,
      category,
      title,
      description,
      city,
      contact_phone: contactPhone,
      address,
      salary_info: salaryInfo,
      status: isAutoApprove ? 'activo' : 'pendiente_pago',
      start_date: isAutoApprove ? now.toISOString() : undefined,
      end_date: endDate,
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
        status: isAutoApprove ? 'aprobado' : 'pendiente',
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }
    };

    const currentAds = await getCloudAds();
    const updatedAds = [newAd, ...currentAds];
    await updateCloudAds(updatedAds);

    // Registrar al anunciante como usuario en el panel si tiene email o advertiser_id
    if (userEmail || advertiserId) {
      try {
        const cleanEmail = userEmail
          ? userEmail.trim().toLowerCase()
          : `${advertiserId}@anunciante.chambaaltoque.pe`;
        const rawName = advertiserName || (contactPhone ? `Anunciante ${contactPhone}` : 'Anunciante');
        const firstName = extractOnlyFirstName(rawName, cleanEmail);
        const lastName = rawName.replace(firstName, '').trim();
        await saveCloudUser({
          id: advertiserId || `usr-${Date.now()}`,
          email: cleanEmail,
          firstName,
          lastName,
          fullName: rawName,
          role: 'anunciante',
          phone: contactPhone || undefined,
          created_at: now.toISOString()
        });
      } catch (saveErr) {
        console.warn('Could not auto-register advertiser as user:', saveErr);
      }
    }

    return NextResponse.json({ success: true, ad: newAd });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating ad' }, { status: 500 });
  }
}
