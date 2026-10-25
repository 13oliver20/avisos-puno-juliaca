import { NextResponse } from 'next/server';
import { getCloudAds } from '@/lib/cloudDb';
import { Ad } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim().toLowerCase() || '';
    const userId = searchParams.get('userId')?.trim() || '';

    if (!email && !userId) {
      return NextResponse.json([]);
    }

    const allAds = await getCloudAds();

    // Filtro estricto: Solo anuncios donde el usuario es el autor legítimo
    const userAds = allAds.filter(ad => {
      const matchUserId = Boolean(userId && ad.advertiser_id && ad.advertiser_id === userId);
      const matchEmail = Boolean(email && ad.user_email && ad.user_email.toLowerCase() === email);
      return matchUserId || matchEmail;
    });

    userAds.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(userAds);
  } catch (err: any) {
    console.error('Error in /api/user/ads:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
