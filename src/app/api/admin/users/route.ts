import { NextResponse } from 'next/server';
import { getCloudUsers, getCloudAds, deleteCloudUser } from '@/lib/cloudDb';
import { Ad, RegisteredUser, UserWithAdHistory } from '@/types/database';
import { getAdExpirationDetails, extractOnlyFirstName } from '@/lib/adTime';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [rawUsers, rawAds] = await Promise.all([
      getCloudUsers(),
      getCloudAds()
    ]);

    const usersMap = new Map<string, RegisteredUser>();

    // 1. Agregar usuarios registrados existentes
    for (const u of rawUsers) {
      const emailKey = u.email.toLowerCase();
      usersMap.set(emailKey, {
        ...u,
        firstName: extractOnlyFirstName(u.firstName, u.email)
      });
      if (u.id) {
        usersMap.set(u.id, u);
      }
    }

    // 2. Sintetizar cualquier anunciante presente en los anuncios que no esté en la tabla
    for (const ad of rawAds) {
      const email = ad.user_email ? ad.user_email.toLowerCase() : null;
      const advId = ad.advertiser_id;

      const alreadyExists = (email && usersMap.has(email)) || (advId && usersMap.has(advId));
      if (!alreadyExists && (email || advId)) {
        const fallbackEmail = email || `${advId}@anunciante.chambaaltoque.pe`;
        const rawName = ad.advertiser_name || (ad.contact_phone ? `Anunciante ${ad.contact_phone}` : 'Anunciante Registrado');
        const firstName = extractOnlyFirstName(rawName, fallbackEmail);
        const synthUser: RegisteredUser = {
          id: advId || `usr-${Date.now()}`,
          email: fallbackEmail,
          firstName: firstName,
          lastName: rawName.replace(firstName, '').trim(),
          fullName: rawName,
          role: 'anunciante',
          phone: ad.contact_phone || undefined,
          created_at: ad.created_at || new Date().toISOString()
        };
        usersMap.set(fallbackEmail, synthUser);
        if (advId) usersMap.set(advId, synthUser);
      }
    }

    // 3. Obtener lista única de usuarios
    const uniqueUsersList = Array.from(new Set(Array.from(usersMap.values()).map(u => u.email.toLowerCase())))
      .map(email => usersMap.get(email)!)
      .filter(Boolean);

    // 4. Mapear historial completo de anuncios para cada usuario
    const usersWithHistory: UserWithAdHistory[] = uniqueUsersList.map(user => {
      const cleanEmail = user.email.toLowerCase();
      
      const userAds = rawAds.filter(ad => {
        const matchEmail = ad.user_email && ad.user_email.toLowerCase() === cleanEmail;
        const matchId = ad.advertiser_id && ad.advertiser_id === user.id;
        return matchEmail || matchId;
      });

      // Ordenar avisos del usuario del más reciente al más antiguo
      userAds.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      let activeAdsCount = 0;
      let expiredAdsCount = 0;
      let pendingAdsCount = 0;
      let totalViews = 0;
      let totalClicks = 0;

      for (const ad of userAds) {
        const expInfo = getAdExpirationDetails(ad);
        if (expInfo.isPending) {
          pendingAdsCount++;
        } else if (expInfo.isExpired) {
          expiredAdsCount++;
        } else if (expInfo.isActive) {
          activeAdsCount++;
        }

        totalViews += (ad.metrics?.views_count || 0);
        totalClicks += (ad.metrics?.whatsapp_clicks || 0);
      }

      return {
        ...user,
        ads: userAds,
        activeAdsCount,
        expiredAdsCount,
        pendingAdsCount,
        totalViews,
        totalClicks
      };
    });

    // Ordenar usuarios: primero aquellos con avisos activos o más avisos
    usersWithHistory.sort((a, b) => {
      if (b.activeAdsCount !== a.activeAdsCount) {
        return b.activeAdsCount - a.activeAdsCount;
      }
      return b.ads.length - a.ads.length;
    });

    return NextResponse.json(usersWithHistory);
  } catch (err: any) {
    console.error('Error in /api/admin/users:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('id')?.trim() || '';
    let email = searchParams.get('email')?.trim().toLowerCase() || '';

    if (!userId && !email) {
      try {
        const body = await request.json();
        userId = body.id || body.userId || '';
        email = (body.email || '').trim().toLowerCase();
      } catch (e) {
        // Ignorar si no hay cuerpo JSON
      }
    }

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'Se requiere el ID o correo del usuario para eliminarlo.' },
        { status: 400 }
      );
    }

    // Proteger al superadministrador de ser eliminado
    if (email === 'admin@chambaaltoque.pe' || userId === 'usr-admin') {
      return NextResponse.json(
        { error: 'No está permitido eliminar la cuenta del Administrador Principal.' },
        { status: 403 }
      );
    }

    const success = await deleteCloudUser(userId || email, true);
    if (!success) {
      return NextResponse.json(
        { error: 'No se pudo eliminar el usuario de la base de datos.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario y sus publicaciones asociadas eliminados correctamente.'
    });
  } catch (err: any) {
    console.error('Error in DELETE /api/admin/users:', err);
    return NextResponse.json({ error: err.message || 'Error interno al procesar la eliminación.' }, { status: 500 });
  }
}

