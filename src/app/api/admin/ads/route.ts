import { NextResponse } from 'next/server';
import { getCloudAds, updateCloudAds } from '@/lib/cloudDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ads = await getCloudAds();
  ads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return NextResponse.json(ads);
}

export async function POST(request: Request) {
  try {
    const { adId, paymentId, daysContracted } = await request.json();
    const startDate = new Date();
    const days = daysContracted || 7;
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

    const ads = await getCloudAds();
    const updated = ads.map(ad => {
      if (ad.id === adId) {
        return {
          ...ad,
          status: 'activo' as const,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          updated_at: startDate.toISOString(),
          payment: ad.payment ? {
            ...ad.payment,
            status: 'aprobado' as const,
            updated_at: startDate.toISOString()
          } : undefined
        };
      }
      return ad;
    });

    await updateCloudAds(updated);
    return NextResponse.json({ success: true, startDate, endDate });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
