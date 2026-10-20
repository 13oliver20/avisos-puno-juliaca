'use client';

import React, { useEffect } from 'react';
import { Ad } from '@/types/database';
import { X, MessageCircle, MapPin, Calendar, Building2, Phone, ShieldCheck, Share2, Clock } from 'lucide-react';
import { formatPublicationTime } from '@/lib/formatTimeAgo';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  ad: Ad;
  onWhatsAppClick: (e: React.MouseEvent) => void;
}

export function AdModal({ isOpen, onClose, ad, onWhatsAppClick }: AdModalProps) {
  // Prevenir scroll en el fondo cuando el modal está abierto en celular
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const timeAgo = formatPublicationTime(ad.created_at);
  const cleanPhone = ad.contact_phone.replace(/\D/g, '');

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: `Aviso de empleo en ${ad.city}: ${ad.title}`,
          url: window.location.href,
        });
      } catch (e) {
        // Ignored
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 touch-manipulation"
        onClick={e => e.stopPropagation()}
      >
        {/* Barra superior de modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              {ad.category?.name || 'Aviso Clasificado'}
            </span>
            <span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200">
              📍 {ad.city}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              title="Compartir aviso"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
              title="Cerrar detalle"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md w-fit mb-2">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Publicado {timeAgo}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {ad.title}
            </h2>
          </div>

          {/* Salario y Dirección destacados */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 border border-slate-200/80">
            {ad.salary_info && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Sueldo Ofrecido:</span>
                <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                  💰 {ad.salary_info}
                </span>
              </div>
            )}
            {ad.address && (
              <div className="flex items-start justify-between text-sm gap-2">
                <span className="text-slate-500 font-medium flex-shrink-0">Ubicación:</span>
                <span className="font-semibold text-slate-800 text-right">{ad.address} ({ad.city})</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">Celular de Contacto:</span>
              <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                +51 {cleanPhone}
              </span>
            </div>
          </div>

          {/* Descripción completa */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Detalle del Puesto / Requisitos
            </h4>
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
              {ad.description}
            </div>
          </div>

          {/* Nota de Seguridad */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 text-xs text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Recomendación de seguridad:</strong> Nunca realices pagos previos por uniformes, exámenes o trámites para postular a ningún empleo. Todo proceso debe ser gratuito.
            </p>
          </div>
        </div>

        {/* Footer fijo con CTA WhatsApp (Único lugar donde se contacta por WhatsApp) */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onWhatsAppClick}
            className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition text-base touch-manipulation"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Contactar por WhatsApp al {cleanPhone}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
