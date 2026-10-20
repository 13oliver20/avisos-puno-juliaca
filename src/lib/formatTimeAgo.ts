import { differenceInMinutes, differenceInHours, differenceInDays, parseISO } from 'date-fns';

/**
 * Formatea el tiempo de publicación según la regla estricta:
 * - Si es reciente (< 1 hora): muestra SOLO minutos (ej: "Hace 1 min", "Hace 25 mins", "Hace 59 mins"). Llega hasta el minuto 59.
 * - De ahí en adelante (>= 1 hora y < 24 horas): muestra SOLO horas sin minutos (ej: "Hace 1 hora", "Hace 3 horas", "Hace 23 horas").
 * - Si es de días anteriores (>= 24 horas): muestra días (ej: "Hace 1 día", "Hace 2 días", "Hace 5 días").
 */
export function formatPublicationTime(createdAtString?: string | null): string {
  if (!createdAtString) return 'Hace un momento';

  try {
    const createdDate = parseISO(createdAtString);
    const now = new Date();

    const diffMinutes = Math.max(0, differenceInMinutes(now, createdDate));
    const diffHours = Math.max(0, differenceInHours(now, createdDate));
    const diffDays = Math.max(0, differenceInDays(now, createdDate));

    // 1. Menos de 60 minutos (0 a 59 minutos): SOLO MINUTOS
    if (diffMinutes < 60) {
      if (diffMinutes <= 1) {
        return 'Hace 1 min';
      }
      return `Hace ${diffMinutes} mins`;
    }

    // 2. De 1 a 23 horas: SOLO HORAS (sin mostrar minutos)
    if (diffHours < 24) {
      if (diffHours === 1) {
        return 'Hace 1 hora';
      }
      return `Hace ${diffHours} horas`;
    }

    // 3. De 1 día en adelante: DÍAS
    if (diffDays <= 1) {
      return 'Hace 1 día';
    }
    if (diffDays < 30) {
      return `Hace ${diffDays} días`;
    }

    const diffMonths = Math.floor(diffDays / 30);
    return diffMonths === 1 ? 'Hace 1 mes' : `Hace ${diffMonths} meses`;
  } catch (err) {
    return 'Reciente';
  }
}
