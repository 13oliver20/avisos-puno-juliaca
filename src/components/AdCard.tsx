'use client';

import React, { useState } from 'react';
import { Ad } from '@/types/database';
import { MapPin, Phone, MessageCircle, Clock, Eye, Building2, ChevronRight, Sparkles } from 'lucide-react';
import { registerWhatsAppClick, registerAdView } from '@/lib/adService';
import { formatPublicationTime } from '@/lib/formatTimeAgo';
import { AdModal } from './AdModal';

interface AdCardProps {
  ad: Ad;
  onUpdate?: () => void;
  searchQuery?: string;
}

export function AdCard({ ad, onUpdate }: AdCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clicks, setClicks] = useState(ad.metrics?.whatsapp_clicks || 0);
  const [views, setViews] = useState(ad.metrics?.views_count || 0);

  const cleanPhone = ad.contact_phone.replace(/\D/g, '');
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Chamba Al Toque Puno-Juliaca';
  const defaultMessage = `Vi esta publicación por ${appName}, ¿está disponible la oferta laboral?`;
  const whatsappUrl = `https://wa.me/51${cleanPhone}?text=${encodeURIComponent(defaultMessage)}`;

  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setClicks(prev => prev + 1);
    try {
      await registerWhatsAppClick(ad.id);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error logging click', err);
    }
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCardClick = async () => {
    setIsModalOpen(true);
    setViews(prev => prev + 1);
    try {
      await registerAdView(ad.id);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error logging view', err);
    }
  };

  // Formato estricto requerido:
  // - 0 a 59 mins: SOLO minutos (ej: "Hace 15 mins")
  // - 1 a 23 horas: SOLO horas (ej: "Hace 3 horas")
  // - >= 24 horas: Días (ej: "Hace 2 días")
  const timeFormatted = formatPublicationTime(ad.created_at);
  const isVeryRecent = timeFormatted.includes('min');

  return (
    <>
      <article
        onClick={handleCardClick}
        className="group relative bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-[0.99] touch-manipulation"
      >
        <div>
          {/* Header de la tarjeta */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 truncate max-w-[65%]">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">{ad.category?.name || 'Aviso Clasificado'}</span>
            </span>

            {/* Badge de Tiempo Publicado */}
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
              isVeryRecent
                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold animate-pulse'
                : 'text-slate-500 bg-slate-100'
            }`}>
              {isVeryRecent && <Sparkles className="w-3 h-3 text-amber-600" />}
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{timeFormatted}</span>
            </span>
          </div>

          {/* Ciudad y Dirección */}
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
              <span className="text-slate-400 truncate max-w-[200px]" title={ad.address}>
                {ad.address}
              </span>
            )}
          </div>

          {/* Título */}
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

        {/* Footer de la tarjeta con Botón WhatsApp muy visible (Mobile-First) */}
        <div className="pt-3 border-t border-slate-100 mt-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
            <span className="text-slate-400 text-[11px]">
              Toca para ver detalle
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-500 font-medium text-[11px]" title="Visualizaciones">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {views}
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]" title="Contactos por WhatsApp">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                {clicks}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Call to Action WhatsApp destacado en móvil */}
            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow transition-all duration-150 text-sm touch-manipulation"
              title="Abrir chat en WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Contactar por WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCardClick}
              className="p-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              title="Ver detalle completo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </article>

      {/* Modal de Detalle Completo */}
      <AdModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ad={ad}
        views={views}
        clicks={clicks}
        onWhatsAppClick={handleWhatsAppClick}
      />
    </>
  );
}
