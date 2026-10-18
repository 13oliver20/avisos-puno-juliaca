'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ad } from '@/types/database';
import { fetchAllAdsAdmin } from '@/lib/adService';
import { CountdownBadge } from '@/components/CountdownBadge';
import { 
  PlusCircle, 
  Eye, 
  MessageCircle, 
  Calendar, 
  Building2, 
  TrendingUp, 
  Sparkles,
  QrCode,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdvertiserDashboardPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAllAdsAdmin();
        setAds(data);
      } catch (e) {
        console.error('Error loading advertiser ads', e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const totalViews = ads.reduce((acc, a) => acc + (a.metrics?.views_count || 0), 0);
  const totalClicks = ads.reduce((acc, a) => acc + (a.metrics?.whatsapp_clicks || 0), 0);
  const activeCount = ads.filter(a => a.status === 'activo').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Portal para Dueños de Negocios y Empleadores
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Dashboard del Anunciante
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestiona tus clasificados de empleo en Puno y Juliaca con tarifa plana de S/ 0.50 PEN por día.
          </p>
        </div>

        {/* Botón Principal Destacado: Coloca tu anuncio */}
        <Link
          href="/advertiser/nuevo"
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3 px-6 rounded-2xl shadow-md transition text-sm whitespace-nowrap"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Coloca tu anuncio</span>
        </Link>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Avisos Activos</span>
            <p className="text-2xl font-black text-slate-900">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Visualizaciones Totales</span>
            <p className="text-2xl font-black text-slate-900">{totalViews}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Contactos WhatsApp</span>
            <p className="text-2xl font-black text-slate-900">{totalClicks}</p>
          </div>
        </div>
      </div>

      {/* Lista de Anuncios */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">
            Mis Avisos Clasificados
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Total: {ads.length} avisos
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Cargando tus publicaciones...
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-600 text-sm">
              Aún no has colocado ningún aviso clasificado.
            </p>
            <Link
              href="/advertiser/nuevo"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow"
            >
              <PlusCircle className="w-4 h-4" />
              Publicar mi primer aviso por S/ 0.50/día
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {ads.map(ad => (
              <div key={ad.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <CountdownBadge endDate={ad.end_date} status={ad.status} />
                    <span className="text-xs font-semibold text-slate-500">
                      📍 {ad.city}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {ad.category?.name}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">
                    {ad.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {ad.description}
                  </p>

                  {ad.payment && (
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span>Yape: {ad.payment.yape_validation_code}</span>
                      <span>S/ {Number(ad.payment.amount_paid).toFixed(2)} PEN</span>
                      <span>{ad.payment.days_contracted} días</span>
                    </div>
                  )}
                </div>

                {/* Métricas por anuncio */}
                <div className="flex items-center gap-6 sm:justify-end bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                  <div className="text-center">
                    <span className="text-[11px] text-slate-400 font-semibold block">Vistas</span>
                    <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {ad.metrics?.views_count || 0}
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="text-[11px] text-slate-400 font-semibold block">WhatsApp</span>
                    <span className="font-bold text-emerald-600 text-sm flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                      {ad.metrics?.whatsapp_clicks || 0}
                    </span>
                  </div>

                  {ad.end_date && (
                    <div className="text-center hidden lg:block">
                      <span className="text-[11px] text-slate-400 font-semibold block">Vence</span>
                      <span className="text-xs text-slate-600">
                        {format(parseISO(ad.end_date), 'd MMM', { locale: es })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
