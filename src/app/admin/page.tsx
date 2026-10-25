'use client';

import React, { useState, useEffect } from 'react';
import { Ad } from '@/types/database';
import { 
  fetchAllAdsAdmin, 
  approvePaymentAndAd, 
  fetchPlatformConfig, 
  updatePlatformConfig, 
  PlatformConfig, 
  DEFAULT_PLATFORM_CONFIG 
} from '@/lib/adService';
import { CountdownBadge } from '@/components/CountdownBadge';
import { 
  ShieldCheck, 
  CheckCircle, 
  Eye, 
  EyeOff,
  MessageCircle, 
  Clock, 
  DollarSign, 
  Filter, 
  RefreshCw,
  LogOut,
  Lock,
  User,
  Settings,
  Layers,
  Save,
  Check,
  AlertCircle,
  Plus,
  Minus,
  Smartphone,
  Sliders,
  CheckCircle2,
  Sparkles,
  Users
} from 'lucide-react';
import { differenceInDays, differenceInHours, parseISO } from 'date-fns';
import { UserManagementDirectory } from '@/components/UserManagementDirectory';

export default function AdminDashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab State: 'ads' | 'config' | 'users'
  const [activeTab, setActiveTab] = useState<'ads' | 'config' | 'users'>('ads');

  // Ads & Metrics State
  const [ads, setAds] = useState<Ad[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoadingAds, setIsLoadingAds] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Configuration State
  const [config, setConfig] = useState<PlatformConfig>(DEFAULT_PLATFORM_CONFIG);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSuccessMessage, setConfigSuccessMessage] = useState<string | null>(null);
  const [configErrorMessage, setConfigErrorMessage] = useState<string | null>(null);

  // Check initial authentication
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('chamba_admin_auth');
      if (stored === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('Error checking auth', e);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  // Load Ads & Config once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAds();
      loadConfig();
    }
  }, [isAuthenticated]);

  const loadAds = async () => {
    setIsLoadingAds(true);
    try {
      const data = await fetchAllAdsAdmin();
      setAds(data);
    } catch (e) {
      console.error('Error fetching admin ads', e);
    } finally {
      setIsLoadingAds(false);
    }
  };

  const loadConfig = async () => {
    try {
      const platConfig = await fetchPlatformConfig();
      if (platConfig) {
        setConfig(platConfig);
      }
    } catch (e) {
      console.error('Error loading config', e);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanUser = username.trim();
    if (cleanUser === 'admin123' && password === 'admin123') {
      try {
        sessionStorage.setItem('chamba_admin_auth', 'true');
      } catch (err) {
        console.error('Session storage error', err);
      }
      setIsAuthenticated(true);
    } else {
      setAuthError('Usuario o contraseña incorrectos. Verifica tus credenciales de acceso.');
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('chamba_admin_auth');
    } catch (err) {
      console.error('Logout error', err);
    }
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setAuthError(null);
  };

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

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigSuccessMessage(null);
    setConfigErrorMessage(null);

    try {
      const success = await updatePlatformConfig(config);
      if (success) {
        setConfigSuccessMessage('¡Configuración guardada exitosamente! La nueva tarifa diaria y parámetros de pago ya están activos en toda la plataforma.');
        setTimeout(() => setConfigSuccessMessage(null), 6000);
      } else {
        setConfigErrorMessage('No se pudo guardar la configuración. Intenta nuevamente.');
      }
    } catch (err: any) {
      setConfigErrorMessage(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const adjustPrice = (delta: number) => {
    const current = Number(config.pricePerDay) || 0.50;
    const updated = Math.max(0.10, Math.round((current + delta) * 100) / 100);
    setConfig(prev => ({ ...prev, pricePerDay: updated }));
  };

  // Loading initial state
  if (isCheckingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Verificando acceso...</span>
        </div>
      </div>
    );
  }

  // --- VISTA DE LOGIN ADMINISTRATIVO ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Header del Login */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 text-white text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
              Chamba Al Toque • Puno & Juliaca
            </span>
            <h1 className="text-2xl font-black mt-3">
              Acceso Administrativo
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Ingresa tus credenciales autorizadas para gestionar clasificados, métricas y tarifas.
            </p>
          </div>

          {/* Formulario de Login */}
          <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-5">
            {authError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin123"
                  required
                  autoFocus
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-emerald-600 focus:bg-white focus:outline-none transition font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-emerald-600 focus:bg-white focus:outline-none transition font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition text-sm mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ingresar al Panel</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- VISTA PRINCIPAL AUTENTICADA ---
  const totalRevenue = ads.reduce((acc, a) => {
    if (a.payment?.status === 'aprobado') {
      return acc + Number(a.payment.amount_paid || 0);
    }
    return acc;
  }, 0);

  const totalViews = ads.reduce((acc, a) => acc + (a.metrics?.views_count || 0), 0);
  const totalClicks = ads.reduce((acc, a) => acc + (a.metrics?.whatsapp_clicks || 0), 0);
  const pendingCount = ads.filter(a => a.status === 'pendiente_pago').length;

  const filteredAds = ads.filter(ad => {
    if (filterStatus === 'all') return true;
    return ad.status === filterStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Superadmin Autorizado • Sesión Activa
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Panel de Control Central
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gestión integral de avisos, validaciones Yape, analítica en vivo y configuración de precios para Puno y Juliaca.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAds}
            disabled={isLoadingAds}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl transition"
            title="Recargar avisos y métricas"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingAds ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Recargar</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-red-950/50 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-bold py-2.5 px-4 rounded-xl transition"
            title="Cerrar sesión segura"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl max-w-xl flex-wrap sm:flex-nowrap">
        <button
          onClick={() => setActiveTab('ads')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'ads'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Avisos y Métricas</span>
          {pendingCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-purple-600" />
          <span>Gestión de Usuarios</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'config'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-600" />
          <span>Configuración</span>
        </button>
      </div>

      {/* --- TAB 1: AVISOS Y MÉTRICAS --- */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
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
                              <span className="text-purple-700 font-bold block font-mono">
                                Código Yape: {ad.payment.yape_validation_code}
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
      )}

      {/* --- TAB 2: CONFIGURACIÓN DEL SISTEMA (PRECIOS Y YAPE) --- */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          {configSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="font-bold">{configSuccessMessage}</p>
              </div>
            </div>
          )}

          {configErrorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-bold">{configErrorMessage}</p>
              </div>
            </div>
          )}

          {/* Tarjeta 1: Tarifa por Día de Anuncio */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Modelo de Monetización
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  Tarifa por Día de Anuncio (PEN)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ajusta el precio diario para anunciantes. Se actualizará en el asistente de creación y cálculo de pagos.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* Selector de Precio Interactivo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Precio Actual por Día:
                </label>

                {/* Display y Steppers */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustPrice(-0.50)}
                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold flex items-center justify-center text-xs transition"
                    title="Bajar 0.50 PEN"
                  >
                    -0.50
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustPrice(-0.10)}
                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold flex items-center justify-center text-xs transition"
                    title="Bajar 0.10 PEN"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="flex-1 text-center py-2 px-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl">
                    <span className="text-xs font-bold text-emerald-700 block uppercase">PEN por Día</span>
                    <span className="text-3xl font-black text-emerald-800 font-mono">
                      S/ {Number(config.pricePerDay || 0.50).toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => adjustPrice(0.10)}
                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold flex items-center justify-center text-xs transition"
                    title="Subir 0.10 PEN"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustPrice(0.50)}
                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold flex items-center justify-center text-xs transition"
                    title="Subir 0.50 PEN"
                  >
                    +0.50
                  </button>
                </div>

                {/* Botones de Preselección Rápida */}
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block mb-2">
                    Preselecciones comunes:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[0.50, 0.80, 1.00, 1.50, 2.00].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, pricePerDay: val }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          config.pricePerDay === val
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        S/ {val.toFixed(2)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simulación en Tiempo Real */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Simulación de cobros a anunciantes:
                </span>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span>Aviso de 1 día:</span>
                    <strong className="font-mono text-slate-900">S/ {(config.pricePerDay * 1).toFixed(2)} PEN</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span>Aviso de 7 días (1 semana):</span>
                    <strong className="font-mono text-slate-900">S/ {(config.pricePerDay * 7).toFixed(2)} PEN</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span>Aviso de 15 días (quincena):</span>
                    <strong className="font-mono text-slate-900">S/ {(config.pricePerDay * 15).toFixed(2)} PEN</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Aviso de 30 días (1 mes):</span>
                    <strong className="font-mono text-emerald-700 font-bold">S/ {(config.pricePerDay * 30).toFixed(2)} PEN</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Datos de Yape para Cobros */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                  Pasarela de Cobro Local
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  Datos de Cuenta Yape
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Estos datos se mostrarán en el asistente de creación cuando el anunciante escanee y realice su transferencia.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#742284] flex items-center justify-center font-black text-xl">
                Y
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Número de Celular Yape:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={config.yapePhone || ''}
                    onChange={e => setConfig(prev => ({ ...prev, yapePhone: e.target.value }))}
                    placeholder="951 847 210"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-purple-600 focus:bg-white focus:outline-none transition font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Nombre de Titular o Empresa en Yape:
                </label>
                <input
                  type="text"
                  value={config.yapeHolder || ''}
                  onChange={e => setConfig(prev => ({ ...prev, yapeHolder: e.target.value }))}
                  placeholder="Avisos Clasificados Puno"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-purple-600 focus:bg-white focus:outline-none transition font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Reglas de Aprobación y Duración */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Reglas de Operación
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  Aprobación y Vigencias
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Controla cómo se validan los anuncios y los límites de días que los usuarios pueden contratar.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Sliders className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Flujo de Activación de Avisos:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setConfig(prev => ({ ...prev, autoApprove: false }))}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                    !config.autoApprove
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      !config.autoApprove ? 'border-emerald-600' : 'border-slate-400'
                    }`}>
                      {!config.autoApprove && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                    </div>
                    <span className="text-xs font-bold text-slate-900">Validación Manual (Recomendado)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-6">
                    Los avisos quedan en estado pendiente hasta que el administrador verifique el código de operación Yape en este panel.
                  </p>
                </div>

                <div
                  onClick={() => setConfig(prev => ({ ...prev, autoApprove: true }))}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                    config.autoApprove
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      config.autoApprove ? 'border-emerald-600' : 'border-slate-400'
                    }`}>
                      {config.autoApprove && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                    </div>
                    <span className="text-xs font-bold text-slate-900">Activación Automática Inmediata</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-6">
                    Los avisos se activan en el tablón público al instante de ingresar el código Yape sin esperar revisión.
                  </p>
                </div>
              </div>
            </div>

            {/* Rango de Días Permitidos */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Días Mínimos Contratables:
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={config.minDays || 1}
                  onChange={e => setConfig(prev => ({ ...prev, minDays: Number(e.target.value) }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Días Máximos Contratables:
                </label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={config.maxDays || 30}
                  onChange={e => setConfig(prev => ({ ...prev, maxDays: Number(e.target.value) }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Botón Guardar Cambios */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingConfig}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3.5 px-8 rounded-2xl shadow-md transition text-sm disabled:opacity-50"
            >
              {isSavingConfig ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Guardando cambios en la nube...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Toda la Configuración</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* --- TAB 3: GESTIÓN Y DIRECTORIO DE USUARIOS --- */}
      {activeTab === 'users' && (
        <UserManagementDirectory />
      )}
    </div>
  );
}
