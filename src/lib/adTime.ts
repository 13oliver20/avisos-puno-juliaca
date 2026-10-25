import { Ad } from '@/types/database';
import { differenceInDays, differenceInHours, differenceInMinutes, parseISO, isPast } from 'date-fns';

export interface AdExpirationDetails {
  isExpired: boolean;
  isActive: boolean;
  isPending: boolean;
  timeLabel: string;
  exactElapsedText: string;
  badgeColor: 'emerald' | 'red' | 'amber' | 'slate';
}

/**
 * Extrae estrictamente solo el primer nombre del usuario.
 * Ej: "Oliver Alexis Quispe" -> "Oliver"
 * Ej: "maria.condori@gmail.com" -> "Maria"
 */
export function extractOnlyFirstName(rawName?: string | null, email?: string | null): string {
  if (rawName && rawName.trim().length > 0) {
    const firstWord = rawName.trim().split(/\s+/)[0];
    if (firstWord) {
      return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
    }
  }

  if (email && email.trim().length > 0) {
    const handle = email.split('@')[0] || '';
    const cleanHandle = handle.split(/[._-]/)[0] || handle;
    if (cleanHandle) {
      return cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1);
    }
  }

  return 'Usuario';
}

/**
 * Calcula con precisión si un anuncio expiró y hace cuánto tiempo, o si sigue activo y cuánto le queda.
 */
export function getAdExpirationDetails(ad: Ad): AdExpirationDetails {
  const now = new Date();

  // 1. Si está pendiente de pago o validación
  if (ad.status === 'pendiente_pago') {
    return {
      isExpired: false,
      isActive: false,
      isPending: true,
      timeLabel: 'Pendiente de pago Yape',
      exactElapsedText: 'A la espera de verificación del código Yape',
      badgeColor: 'amber'
    };
  }

  if (!ad.end_date) {
    if (ad.status === 'activo') {
      return {
        isExpired: false,
        isActive: true,
        isPending: false,
        timeLabel: 'Activo',
        exactElapsedText: 'Vigencia activa indefinida',
        badgeColor: 'emerald'
      };
    }
    return {
      isExpired: true,
      isActive: false,
      isPending: false,
      timeLabel: 'Expirado',
      exactElapsedText: 'Finalizó vigencia contratada',
      badgeColor: 'slate'
    };
  }

  const endDate = typeof ad.end_date === 'string' ? parseISO(ad.end_date) : new Date(ad.end_date);
  const isExpired = ad.status === 'expirado' || isPast(endDate);

  // 2. Si el anuncio ya expiró
  if (isExpired) {
    const diffMins = Math.max(0, differenceInMinutes(now, endDate));
    const diffHrs = Math.max(0, differenceInHours(now, endDate));
    const diffDys = Math.max(0, differenceInDays(now, endDate));

    let text = '';
    if (diffMins < 60) {
      text = `Expiró hace ${Math.max(1, diffMins)} min`;
    } else if (diffHrs < 24) {
      text = `Expiró hace ${diffHrs} ${diffHrs === 1 ? 'hora' : 'horas'}`;
    } else {
      text = `Expiró hace ${diffDys} ${diffDys === 1 ? 'día' : 'días'}`;
    }

    return {
      isExpired: true,
      isActive: false,
      isPending: false,
      timeLabel: text,
      exactElapsedText: text,
      badgeColor: 'red'
    };
  }

  // 3. Si el anuncio sigue activo
  const diffMins = Math.max(0, differenceInMinutes(endDate, now));
  const diffHrs = Math.max(0, differenceInHours(endDate, now));
  const diffDys = Math.max(0, differenceInDays(endDate, now));

  let text = '';
  if (diffDys > 0) {
    text = `Finaliza en ${diffDys} ${diffDys === 1 ? 'día' : 'días'}`;
  } else if (diffHrs > 0) {
    text = `Finaliza en ${diffHrs} ${diffHrs === 1 ? 'hora' : 'horas'}`;
  } else {
    text = `Finaliza en ${Math.max(1, diffMins)} min`;
  }

  return {
    isExpired: false,
    isActive: true,
    isPending: false,
    timeLabel: text,
    exactElapsedText: text,
    badgeColor: 'emerald'
  };
}
