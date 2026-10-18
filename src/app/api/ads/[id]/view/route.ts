import { NextResponse } from 'next/server';
import { getCloudAds, updateCloudAds } from '@/lib/cloudDb';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ads = await getCloudAds();
    const updated = ads.map(ad => {
      if (ad.id === id) {
        const views = (ad.metrics?.views_count || 0) + 1;
        return {
          ...ad,
          metrics: {
            id: ad.metrics?.id || `met-${Date.now()}`,
            ad_id: ad.id,
            views_count: views,
            whatsapp_clicks: ad.metrics?.whatsapp_clicks || 0,
            updated_at: new Date().toISOString()
          }
        };
      }
      return ad;
    });

    await updateCloudAds(updated);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
