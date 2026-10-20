import { Ad } from '@/types/database';

export function normalizeSearchText(text?: string | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina tildes
    .replace(/[^a-z0-9ñ\s]/gi, ' ') // Mantener letras, números y espacios
    .replace(/\s+/g, ' ')
    .trim();
}

export interface IndexedAd {
  ad: Ad;
  normalizedTitle: string;
  normalizedDesc: string;
  normalizedCity: string;
  normalizedCategory: string;
  normalizedAddress: string;
  normalizedSalary: string;
  tokens: Set<string>;
  allTextCombined: string;
}

export function buildAdSearchIndex(ads: Ad[]): IndexedAd[] {
  return ads.map(ad => {
    const titleNorm = normalizeSearchText(ad.title);
    const descNorm = normalizeSearchText(ad.description);
    const cityNorm = normalizeSearchText(ad.city);
    const catNorm = normalizeSearchText(ad.category?.name);
    const addrNorm = normalizeSearchText(ad.address);
    const salaryNorm = normalizeSearchText(ad.salary_info);
    const phoneNorm = ad.contact_phone ? ad.contact_phone.replace(/\D/g, '') : '';

    const combined = `${titleNorm} ${descNorm} ${cityNorm} ${catNorm} ${addrNorm} ${salaryNorm} ${phoneNorm}`;
    const tokens = new Set(combined.split(' ').filter(t => t.length > 1));

    return {
      ad,
      normalizedTitle: titleNorm,
      normalizedDesc: descNorm,
      normalizedCity: cityNorm,
      normalizedCategory: catNorm,
      normalizedAddress: addrNorm,
      normalizedSalary: salaryNorm,
      tokens,
      allTextCombined: combined,
    };
  });
}

export interface SearchOptions {
  query?: string;
  city?: string; // 'all' | 'Puno' | 'Juliaca'
  categoryId?: string; // 'all' | category_id
  filterQuick?: 'all' | 'today' | 'with_salary' | 'urgent';
  sortBy?: 'recent' | 'clicks' | 'views';
}

export function searchAndFilterAds(index: IndexedAd[], options: SearchOptions): Ad[] {
  const { query = '', city = 'all', categoryId = 'all', filterQuick = 'all', sortBy = 'recent' } = options;

  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = normalizedQuery.split(' ').filter(t => t.length > 0);

  const now = new Date().getTime();

  let scored: { ad: Ad; score: number; createdTime: number }[] = [];

  for (const item of index) {
    const { ad } = item;

    // 1. Filtro por Ciudad
    if (city !== 'all') {
      if (ad.city !== city && ad.city !== 'Ambas') {
        continue;
      }
    }

    // 2. Filtro por Categoría
    if (categoryId !== 'all') {
      if (ad.category_id !== categoryId) {
        continue;
      }
    }

    // 3. Filtros Rápidos (Chips)
    if (filterQuick === 'today') {
      const createdTime = new Date(ad.created_at).getTime();
      const diffHours = (now - createdTime) / (1000 * 60 * 60);
      if (diffHours > 24) continue;
    } else if (filterQuick === 'with_salary') {
      if (!ad.salary_info || ad.salary_info.trim() === '') continue;
    } else if (filterQuick === 'urgent') {
      const isUrgent = item.allTextCombined.includes('urgente') || 
                       item.allTextCombined.includes('inmediato') || 
                       item.allTextCombined.includes('urgencia');
      if (!isUrgent) continue;
    }

    // 4. Búsqueda Indexada en Tiempo Real (Relevance Scoring)
    let score = 0;

    if (queryTokens.length > 0) {
      let allTokensMatch = true;

      for (const token of queryTokens) {
        let tokenMatch = false;

        // Coincidencia exacta o por prefijo en el título (peso mayor: +10)
        if (item.normalizedTitle.includes(token)) {
          score += 10;
          tokenMatch = true;
        }

        // Coincidencia en Rubro/Categoría (+8)
        if (item.normalizedCategory.includes(token)) {
          score += 8;
          tokenMatch = true;
        }

        // Coincidencia en Ciudad (+6)
        if (item.normalizedCity.includes(token)) {
          score += 6;
          tokenMatch = true;
        }

        // Coincidencia en Dirección (+5)
        if (item.normalizedAddress.includes(token)) {
          score += 5;
          tokenMatch = true;
        }

        // Coincidencia en Salario (+4)
        if (item.normalizedSalary.includes(token)) {
          score += 4;
          tokenMatch = true;
        }

        // Coincidencia en Descripción (+3)
        if (item.normalizedDesc.includes(token)) {
          score += 3;
          tokenMatch = true;
        }

        // Coincidencia por tokens indexados
        if (!tokenMatch) {
          for (const itemToken of item.tokens) {
            if (itemToken.startsWith(token) || itemToken.includes(token)) {
              score += 2;
              tokenMatch = true;
              break;
            }
          }
        }

        if (!tokenMatch) {
          allTokensMatch = false;
          break; // Debe coincidir con todas las palabras clave buscadas
        }
      }

      if (!allTokensMatch) {
        continue;
      }
    } else {
      score = 1;
    }

    scored.push({
      ad,
      score,
      createdTime: new Date(ad.created_at).getTime(),
    });
  }

  // 5. Ordenamiento
  if (sortBy === 'recent') {
    // Si hay búsqueda activa, ponderar relevancia primero y fecha después
    if (queryTokens.length > 0) {
      scored.sort((a, b) => b.score - a.score || b.createdTime - a.createdTime);
    } else {
      scored.sort((a, b) => b.createdTime - a.createdTime);
    }
  } else if (sortBy === 'clicks') {
    scored.sort((a, b) => (b.ad.metrics?.whatsapp_clicks || 0) - (a.ad.metrics?.whatsapp_clicks || 0));
  } else if (sortBy === 'views') {
    scored.sort((a, b) => (b.ad.metrics?.views_count || 0) - (a.ad.metrics?.views_count || 0));
  }

  return scored.map(s => s.ad);
}
