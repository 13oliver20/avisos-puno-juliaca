'use client';

import React, { useState } from 'react';
import { Ad } from '@/types/database';
import { MapPin, Phone, MessageCircle, Calendar, Eye, Building2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { registerWhatsAppClick, registerAdView } from '@/lib/adService';
import { AdModal } from './AdModal';
import { CountdownBadge } from './CountdownBadge';

interface AdCardProps {
  ad: Ad;
  onUpdate?: () => void;
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
    e.stopPropagation(); // Evitar abrir el modal si se clica el botón
    setClicks(prev => prev + 1);
    try {
      await registerWhatsAppClick(ad.id);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error logging click', err);
    }
    // Abrir WhatsApp en nueva pestaña
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

  const timeAgo = ad.created_at
    ? formatDistanceToNow(parseISO(ad.created_at), { addSuffix: true, locale: es })
    : 'recientemente';

  return (
    <>
      <article
        onClick={handleCardClick}
        className="group relative bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all duration-200 cursor-pointer flex flex-col justify-between"
      >
        <div>
          {/* Header de la tarjeta */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              {ad.category?.name || 'Aviso Clasificado'}
            </span>

            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                ad.city === 'Puno' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : ad.city === 'Juliaca' 
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                <MapPin className="w-3 h-3 mr-1" />
                {ad.city}
              </span>
            </div>
          </div>

          {/* Título */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2 leading-snug">
            {ad.title}
          </h3>

          {/* Descripción resumida */}
          <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
            {ad.description}
          </p>

          {/* Metadatos: Sueldo / Ubicación */}
          <div className="space-y-1.5 mb-4 text-xs sm:text-sm text-slate-500">
            {ad.salary_info && (
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="bg-emerald-100 px-2 py-0.5 rounded">
                  💰 {ad.salary_info}
                </span>
              </div>
            )}
            {ad.address && (
              <div className="flex items-center gap-1 text-slate-500 truncate">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span className="truncate">{ad.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer de la tarjeta con Botón WhatsApp muy visible */}
        <div className="pt-3 border-t border-slate-100 mt-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {timeAgo}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-500 font-medium" title="Visualizaciones">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {views}
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium" title="Contactos por WhatsApp">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                {clicks}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Call to Action WhatsApp destacado */}
            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:shadow transition-all duration-150 text-sm"
              title="Abrir chat en WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Contactar por WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCardClick}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
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
