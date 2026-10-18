'use client';

import React, { useState, useEffect } from 'react';
import { Ad } from '@/types/database';
import { fetchAllAdsAdmin, approvePaymentAndAd } from '@/lib/adService';
import { CountdownBadge } from '@/components/CountdownBadge';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MessageCircle, 
  Clock, 
  DollarSign, 
  Filter, 
  Calendar,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { differenceInDays, differenceInHours, parseISO, isPast } from 'date-fns';

export default function AdminDashboardPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadAds = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllAdsAdmin();
      setAds(data);
    } catch (e) {
      console.error('Error fetching admin ads', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const handleApprovePayment = async (ad: Ad) => {
    if (!ad.payment) {
      alert('Este anuncio no tiene registro de pago.');
      return;
    }
    setProcessingId(ad.id);
    try {
      const success = await approvePaymentAndAd(
        ad.payment.id,
        ad.id,
        ad.payment.days_contracted || 7
      );
      if (success) {
        await loadAds();
      } else {
        alert('Hubo un error al aprobar el pago.');
      }
    } catch (err) {
      console.error('Error approving payment', err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredAds = ads.filter(ad => {
    if (filterStatus === 'all') return true;
    return ad.status === filterStatus;
  });

  const totalRevenue = ads.reduce((acc, a) => {
    if (a.payment?.status === 'aprobado') {
      return acc + Number(a.payment.amount_paid || 0);
    }
    return acc;
  }, 0);

  const totalViews = ads.reduce((acc, a) => acc + (a.metrics?.views_count || 0), 0);
  const totalClicks = ads.reduce((acc, a) => acc + (a.metrics?.whatsapp_clicks || 0), 0);
  const pendingCount = ads.filter(a => a.status === 'pendiente_pago').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Panel Maestro de Administración
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Gestión Global de Clasificados
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Validación de pagos Yape, métricas de conversión y control de vigencias de Puno y Juliaca.
          </p>
        </div>

        <button
          onClick={loadAds}
          disabled={isLoading}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Recargar Datos</span>
        </button>
      </div>

      {/* Métricas Globales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Ingresos Yape</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            S/ {totalRevenue.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400">Total recaudado</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Por Validar</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">
            {pendingCount}
          </p>
          <span className="text-[11px] text-amber-700 font-medium">Pagos pendientes</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Vistas Globales</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {totalViews}
          </p>
          <span className="text-[11px] text-slate-400">En todo el tablón</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Contactos WhatsApp</span>
            <MessageCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {totalClicks}
          </p>
          <span className="text-[11px] text-slate-400">
            {totalViews > 0 ? `${((totalClicks / totalViews) * 100).toFixed(1)}% tasa conversión` : 'Sin vistas'}
          </span>
        </div>
      </div>

      {/* Tabla y Gestión de Anuncios */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Barra de Filtro de Estados */}
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Filtrar por Estado:
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['all', 'pendiente_pago', 'activo', 'expirado'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'Todos' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Listado Consolidado */}
        <div className="divide-y divide-slate-100">
          {filteredAds.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No se encontraron avisos en esta categoría.
            </div>
          ) : (
            filteredAds.map(ad => {
              const contractedDays = ad.payment?.days_contracted || 0;
              let daysLeft = 0;
              let hoursLeft = 0;
              if (ad.end_date) {
                const end = parseISO(ad.end_date);
                const now = new Date();
                daysLeft = Math.max(0, differenceInDays(end, now));
                hoursLeft = Math.max(0, differenceInHours(end, now));
              }

              return (
                <div key={ad.id} className="p-5 sm:p-6 hover:bg-slate-50/70 transition space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Info Básica del Aviso */}
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Countdown Badge con lógica condicional >24h vs <24h */}
                        <CountdownBadge endDate={ad.end_date} status={ad.status} />

                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {ad.city}
                        </span>

                        <span className="text-xs text-slate-500 font-medium">
                          {ad.category?.name}
                        </span>

                        <span className="text-xs text-slate-400 font-mono">
                          Tel: +51 {ad.contact_phone}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base">
                        {ad.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {ad.description}
                      </p>
                    </div>

                    {/* Validación de Pago y Acciones */}
                    <div className="flex flex-wrap items-center gap-3">
                      {ad.payment && (
                        <div className="bg-purple-50 border border-purple-200 p-2.5 rounded-xl text-xs space-y-0.5">
                          <span className="text-purple-700 font-bold block">
                            Yape: {ad.payment.yape_validation_code}
                          </span>
                          <span className="text-purple-900 font-semibold font-mono block">
                            S/ {Number(ad.payment.amount_paid).toFixed(2)} PEN ({ad.payment.days_contracted} días)
                          </span>
                          <span className={`text-[10px] font-bold uppercase ${
                            ad.payment.status === 'aprobado' ? 'text-emerald-700' : 'text-amber-700'
                          }`}>
                            Estado: {ad.payment.status}
                          </span>
                        </div>
                      )}

                      {ad.status === 'pendiente_pago' && (
                        <button
                          type="button"
                          disabled={processingId === ad.id}
                          onClick={() => handleApprovePayment(ad)}
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Aprobar y Activar</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Panel de Métricas y Gestión de Tiempos */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block">Vistas:</span>
                      <p className="font-bold text-slate-800 text-sm flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {ad.metrics?.views_count || 0}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">WhatsApp:</span>
                      <p className="font-bold text-emerald-600 text-sm flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                        {ad.metrics?.whatsapp_clicks || 0}
                      </p>
                    </div>

                    {/* Días contratados vs restantes */}
                    <div>
                      <span className="text-slate-400 font-medium block">Días Contratados:</span>
                      <p className="font-bold text-slate-800 text-sm">
                        {contractedDays > 0 ? `${contractedDays} días` : 'N/A'}
                      </p>
                    </div>

                    {/* Cuenta Regresiva Condicional: >24h Faltan X días, <24h Finaliza en X horas */}
                    <div>
                      <span className="text-slate-400 font-medium block">Tiempo Restante:</span>
                      <p className="font-bold text-slate-800 text-sm">
                        {ad.status !== 'activo' ? (
                          <span className="text-slate-400 font-normal">No activo</span>
                        ) : hoursLeft <= 0 ? (
                          <span className="text-red-600">Expirado</span>
                        ) : hoursLeft <= 24 ? (
                          <span className="text-orange-600 font-black animate-pulse">
                            Finaliza en {hoursLeft} {hoursLeft === 1 ? 'hora' : 'horas'}
                          </span>
                        ) : (
                          <span className="text-emerald-700">
                            Faltan {daysLeft} {daysLeft === 1 ? 'día' : 'días'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
