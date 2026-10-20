'use client';

import React from 'react';
import { Ad } from '@/types/database';
import { MapPin, Clock, Building2, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { formatPublicationTime } from '@/lib/formatTimeAgo';

interface AdCardProps {
  ad: Ad;
  onOpenDetails: (ad: Ad) => void;
  searchQuery?: string;
}

export function AdCard({ ad, onOpenDetails }: AdCardProps) {
  // Formato estricto de tiempo:
  // - 0 a 59 mins: SOLO minutos (ej: "Hace 15 mins")
  // - 1 a 23 horas: SOLO horas (ej: "Hace 3 horas")
  // - >= 24 horas: Días (ej: "Hace 2 días")
  const timeFormatted = formatPublicationTime(ad.created_at);
  const isVeryRecent = timeFormatted.includes('min');

  return (
    <article
      onClick={() => onOpenDetails(ad)}
      className="group relative bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-500 transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-[0.99] touch-manipulation w-full min-w-0 max-w-full overflow-hidden"
    >
      <div className="min-w-0 w-full">
        {/* Header de la tarjeta */}
        <div className="flex items-center justify-between gap-2 mb-2.5 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 truncate min-w-0 flex-1">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">{ad.category?.name || 'Aviso Clasificado'}</span>
          </span>

          {/* Badge de Tiempo Publicado */}
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 whitespace-nowrap ${
            isVeryRecent
              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold animate-pulse'
              : 'text-slate-500 bg-slate-100'
          }`}>
            {isVeryRecent && <Sparkles className="w-3 h-3 text-amber-600" />}
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{timeFormatted}</span>
          </span>
        </div>

        {/* Ciudad y Ubicación */}
        <div className="flex items-center gap-2 mb-2 text-xs">
          <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold ${
            ad.city === 'Puno' 
              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
              : ad.city === 'Juliaca' 
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : 'bg-slate-100 text-slate-700'
          }`}>
            <MapPin className="w-3 h-3 mr-1" />
            {ad.city}
          </span>

          {ad.address && (
            <span className="text-slate-400 truncate max-w-[180px] sm:max-w-[240px]" title={ad.address}>
              {ad.address}
            </span>
          )}
        </div>

        {/* Título de la Oferta */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2 leading-snug">
          {ad.title}
        </h3>

        {/* Descripción resumida */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 sm:line-clamp-3 mb-3 leading-relaxed">
          {ad.description}
        </p>

        {/* Sueldo Destacado */}
        {ad.salary_info && (
          <div className="mb-3">
            <span className="inline-block bg-emerald-50 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-lg border border-emerald-200">
              💰 {ad.salary_info}
            </span>
          </div>
        )}
      </div>

      {/* 
        Footer de la tarjeta (Limpio y Profesional):
        - Las métricas de vistas y contactos se removieron (solo visibles por admin).
        - El botón de WhatsApp se trasladó al detalle completo al tocar el aviso.
      */}
      <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-700 group-hover:text-emerald-800 transition-colors flex items-center gap-1.5">
          <span>Ver requisitos y detalles</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
        </span>

        <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </article>
  );
}
