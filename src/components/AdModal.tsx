'use client';

import React from 'react';
import { Ad } from '@/types/database';
import { X, MessageCircle, MapPin, Calendar, Building2, Phone, CheckCircle2, ShieldCheck, Share2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  ad: Ad;
  views: number;
  clicks: number;
  onWhatsAppClick: (e: React.MouseEvent) => void;
}

export function AdModal({ isOpen, onClose, ad, views, clicks, onWhatsAppClick }: AdModalProps) {
  if (!isOpen) return null;

  const timeAgo = ad.created_at
    ? formatDistanceToNow(parseISO(ad.created_at), { addSuffix: true, locale: es })
    : 'recientemente';

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Barra superior de modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              {ad.category?.name || 'Aviso Clasificado'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
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
              title="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {ad.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                Publicado {timeAgo}
              </span>
              <span>•</span>
              <span>Visto {views} veces</span>
              <span>•</span>
              <span className="text-emerald-600 font-medium">{clicks} contactos</span>
            </div>
          </div>

          {/* Salario y Dirección destacados */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
            {ad.salary_info && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Sueldo / Remuneración:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded">
                  {ad.salary_info}
                </span>
              </div>
            )}
            {ad.address && (
              <div className="flex items-start justify-between text-sm gap-2">
                <span className="text-slate-500 font-medium flex-shrink-0">Ubicación:</span>
                <span className="font-medium text-slate-800 text-right">{ad.address} ({ad.city})</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">Celular de Contacto:</span>
              <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {cleanPhone}
              </span>
            </div>
          </div>

          {/* Descripción completa */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Detalle del Puesto / Requisitos
            </h4>
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-white rounded-xl p-3 border border-slate-100">
              {ad.description}
            </div>
          </div>

          {/* Nota de Seguridad */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-100 text-xs text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p>
              Recomendación de seguridad: Nunca realices pagos previos para postular a una vacante de empleo. Todos los trámites deben ser presenciales y gratuitos.
            </p>
          </div>
        </div>

        {/* Footer fijo con CTA WhatsApp */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onWhatsAppClick}
            className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition text-base"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Contactar por WhatsApp al {cleanPhone}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
