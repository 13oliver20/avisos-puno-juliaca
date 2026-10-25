'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Ad } from '@/types/database';
import { fetchUserAds } from '@/lib/adService';
import { extractOnlyFirstName, getAdExpirationDetails } from '@/lib/adTime';
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
  ExternalLink,
  Users,
  Layers,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { UserManagementDirectory } from '@/components/UserManagementDirectory';

export default function EmployerPanelPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(true);
  const [panelTab, setPanelTab] = useState<'my_ads' | 'all_users'>('my_ads');

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
        // Carga estricta: Solo anuncios donde el usuario actual es el autor legítimo
        const userSpecificAds = await fetchUserAds(user.email, user.id);
        setAds(userSpecificAds);
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

  // Estricto: Solo el primer nombre del usuario
  const userFirstName = extractOnlyFirstName(user.firstName || user.fullName, user.email);
  const userInitial = userFirstName.charAt(0).toUpperCase();

  // Métricas calculadas ÚNICAMENTE a partir de los anuncios propios del usuario
  const totalViews = ads.reduce((acc, a) => acc + (a.metrics?.views_count || 0), 0);
  const totalClicks = ads.reduce((acc, a) => acc + (a.metrics?.whatsapp_clicks || 0), 0);
  const activeAdsCount = ads.filter(a => {
    const info = getAdExpirationDetails(a);
    return info.isActive;
  }).length;

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
            {/* Saludo mostrando ESTRICTAMENTE SOLO el primer nombre */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Hola, {userFirstName}
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

      {/* Selector de Pestañas del Panel: Mis Anuncios vs Administración Total de Usuarios */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl max-w-lg">
        <button
          onClick={() => setPanelTab('my_ads')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition ${
            panelTab === 'my_ads'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Mis Clasificados</span>
          <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
            panelTab === 'my_ads' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
          }`}>
            {ads.length}
          </span>
        </button>

        <button
          onClick={() => setPanelTab('all_users')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition ${
            panelTab === 'all_users'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-purple-600" />
          <span>Gestión de Usuarios</span>
        </button>
      </div>

      {/* --- PESTAÑA 1: MIS ANUNCIOS PROPIOS --- */}
      {panelTab === 'my_ads' && (
        <div className="space-y-6">
          {/* Métricas Rápidas del Usuario (Si no tiene anuncios, todo está en 0) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Tus Clasificados</span>
                <p className="text-2xl font-black text-slate-900">{ads.length}</p>
                <span className="text-[11px] text-emerald-600 font-medium">
                  {activeAdsCount} activos en tablón
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Visualizaciones</span>
                <p className="text-2xl font-black text-slate-900">{totalViews}</p>
                <span className="text-[11px] text-slate-400">Total en tus ofertas</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Contactos WhatsApp</span>
                <p className="text-2xl font-black text-slate-900">{totalClicks}</p>
                <span className="text-[11px] text-slate-400">Postulantes directos</span>
              </div>
            </div>
          </div>

          {/* Listado de Ofertas Laborales Propias */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Tus Avisos Clasificados
                </h2>
                <p className="text-xs text-slate-500">
                  Solo puedes visualizar y administrar los avisos de tu autoría personal.
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
              <div className="py-12 text-center text-slate-400 text-xs">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Cargando tus clasificados...
              </div>
            ) : ads.length === 0 ? (
              /* ESTADO VACÍO: Cuando no tiene ningún anuncio publicado */
              <div className="py-14 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Aún no tienes clasificados publicados
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    Actualmente no cuentas con anuncios activos ni interacciones registradas. Publica tu primer aviso para recibir candidatos en Puno y Juliaca.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/advertiser/nuevo"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold py-3 px-6 rounded-2xl shadow-md active:scale-95 transition"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Coloca tu anuncio</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* LISTADO DE ANUNCIOS PROPIOS */
              <div className="divide-y divide-slate-100">
                {ads.map(ad => {
                  const expInfo = getAdExpirationDetails(ad);

                  return (
                    <div key={ad.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Badge de Estado y Expiración */}
                          {expInfo.isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              {expInfo.timeLabel}
                            </span>
                          ) : expInfo.isExpired ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md">
                              <Clock className="w-3 h-3 text-red-500" />
                              {expInfo.timeLabel}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                              <AlertCircle className="w-3 h-3" />
                              {expInfo.timeLabel}
                            </span>
                          )}

                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {ad.city}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {ad.category?.name}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">{ad.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{ad.description}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono text-slate-500 flex-shrink-0">
                        <span className="flex items-center gap-1" title="Vistas totales">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {ad.metrics?.views_count || 0}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-600 font-bold" title="Clicks a WhatsApp">
                          <MessageCircle className="w-3.5 h-3.5" />
                          {ad.metrics?.whatsapp_clicks || 0}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- PESTAÑA 2: ADMINISTRACIÓN TOTAL DE USUARIOS E INDEXADOR DE HISTORIAL --- */}
      {panelTab === 'all_users' && (
        <UserManagementDirectory />
      )}
    </div>
  );
}
