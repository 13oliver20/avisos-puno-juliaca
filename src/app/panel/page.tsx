'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Ad } from '@/types/database';
import { fetchActiveAds } from '@/lib/adService';
import { 
  Building2, 
  PlusCircle, 
  LogOut, 
  Eye, 
  MessageCircle, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Briefcase,
  ShieldCheck,
  User,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import { CountdownBadge } from '@/components/CountdownBadge';

export default function EmployerPanelPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(true);

  // Redirigir a login si no hay sesión activa
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    async function loadUserAds() {
      if (!user) return;
      setIsLoadingAds(true);
      try {
        const all = await fetchActiveAds();
        // Mostrar anuncios asociados o últimos clasificados activos
        setAds(all);
      } catch (err) {
        console.error('Error loading employer ads', err);
      } finally {
        setIsLoadingAds(false);
      }
    }

    if (user) {
      loadUserAds();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Cargando tu panel de empleador...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userDisplayName = user.fullName || `${user.firstName} ${user.lastName}`.trim() || user.email.split('@')[0];
  const userInitial = (user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase();

  const totalViews = ads.reduce((acc, a) => acc + (a.metrics?.views_count || 0), 0);
  const totalClicks = ads.reduce((acc, a) => acc + (a.metrics?.whatsapp_clicks || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header del Panel */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-md flex-shrink-0">
            {userInitial}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Cuenta de Empleador Activa
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Hola, {userDisplayName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/advertiser/nuevo"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs sm:text-sm font-bold py-2.5 px-4 sm:px-5 rounded-xl shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Coloca tu anuncio</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs sm:text-sm font-semibold py-2.5 px-3.5 rounded-xl transition"
            title="Cerrar sesión de mi cuenta"
          >
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Tus Clasificados</span>
            <p className="text-2xl font-black text-slate-900">{ads.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Visualizaciones</span>
            <p className="text-2xl font-black text-slate-900">{totalViews}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Contactos WhatsApp</span>
            <p className="text-2xl font-black text-slate-900">{totalClicks}</p>
          </div>
        </div>
      </div>

      {/* Listado de Ofertas Laborales */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Avisos Clasificados en el Sistema
            </h2>
            <p className="text-xs text-slate-500">
              Publicaciones visibles para buscadores de empleo en Puno y Juliaca.
            </p>
          </div>

          <Link
            href="/"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Ver Tablón Público</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingAds ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Cargando clasificados...
          </div>
        ) : ads.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Aún no tienes clasificados publicados</p>
            <Link
              href="/advertiser/nuevo"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 text-white py-2 px-4 rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              Publicar mi primer aviso
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {ads.slice(0, 6).map(ad => (
              <div key={ad.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CountdownBadge endDate={ad.end_date} status={ad.status} />
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {ad.city}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {ad.category?.name}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{ad.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{ad.description}</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-500 flex-shrink-0">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    {ad.metrics?.views_count || 0}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {ad.metrics?.whatsapp_clicks || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
