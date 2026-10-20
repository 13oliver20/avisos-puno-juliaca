'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { Ad, Category } from '@/types/database';
import { fetchActiveAds, fetchCategories } from '@/lib/adService';
import { AdCard } from '@/components/AdCard';
import { buildAdSearchIndex, searchAndFilterAds, IndexedAd } from '@/lib/searchIndexer';
import { 
  Search, 
  MapPin, 
  X, 
  Sparkles, 
  Briefcase, 
  ArrowUpDown, 
  RefreshCw,
  Flame,
  Clock,
  DollarSign,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import Link from 'next/link';

export default function PublicFeedPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<'all' | 'Puno' | 'Juliaca'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'today' | 'with_salary' | 'urgent'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'clicks' | 'views'>('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, adsList] = await Promise.all([
        fetchCategories(),
        fetchActiveAds()
      ]);
      setCategories(cats);
      setAds(adsList);
    } catch (err) {
      console.error('Error loading public feed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Construir el Índice de Búsqueda de Alto Rendimiento en Memoria
  const searchIndex: IndexedAd[] = useMemo(() => {
    return buildAdSearchIndex(ads);
  }, [ads]);

  // 2. Indexación y Filtrado Reactivo en Tiempo Real (< 1ms)
  const filteredAds = useMemo(() => {
    return searchAndFilterAds(searchIndex, {
      query: searchQuery,
      city: selectedCity,
      categoryId: selectedCategory,
      filterQuick: quickFilter,
      sortBy: sortBy
    });
  }, [searchIndex, searchQuery, selectedCity, selectedCategory, quickFilter, sortBy]);

  // Contadores dinámicos por ciudad
  const cityCounts = useMemo(() => {
    const punoCount = ads.filter(a => a.city === 'Puno' || a.city === 'Ambas').length;
    const juliacaCount = ads.filter(a => a.city === 'Juliaca' || a.city === 'Ambas').length;
    return { all: ads.length, Puno: punoCount, Juliaca: juliacaCount };
  }, [ads]);

  // Manejo de búsqueda en tiempo real
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    startTransition(() => {
      setSearchQuery(val);
    });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-3.5 sm:space-y-5">
      {/* 
        EL BANNER VERDE GIGANTE FUE RETIRADO SEGÚN LA SOLICITUD (IMAGEN 1).
        En su lugar, tenemos un Header Mobile-First súper limpio y rápido.
      */}

      {/* Buscador Indexador Avanzado en Tiempo Real */}
      <section className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs space-y-3 sticky top-16 z-30 backdrop-blur-md bg-white/95">
        {/* Input de Búsqueda Reactivo Principal */}
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-emerald-600 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Buscar oficio o empleo (ej: ayudante de cocina, chofer, soldador, mozo)..."
            className="w-full pl-11 pr-10 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-base font-medium placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
              title="Borrar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Selector de Ciudades Segmentado (Mobile-First: Puno vs Juliaca) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl text-xs font-bold">
          <button
            onClick={() => setSelectedCity('all')}
            className={`flex-1 py-2 px-2.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              selectedCity === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Todas</span>
            <span className="text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
              {cityCounts.all}
            </span>
          </button>

          <button
            onClick={() => setSelectedCity('Puno')}
            className={`flex-1 py-2 px-2.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              selectedCity === 'Puno'
                ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            <span>🌊 Puno</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedCity === 'Puno' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {cityCounts.Puno}
            </span>
          </button>

          <button
            onClick={() => setSelectedCity('Juliaca')}
            className={`flex-1 py-2 px-2.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              selectedCity === 'Juliaca'
                ? 'bg-purple-700 text-white shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            <span>🚂 Juliaca</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedCity === 'Juliaca' ? 'bg-purple-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {cityCounts.Juliaca}
            </span>
          </button>
        </div>

        {/* Chips de Filtrado Rápido para Celular */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          <button
            onClick={() => setQuickFilter(prev => prev === 'today' ? 'all' : 'today')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              quickFilter === 'today'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Publicados hoy</span>
          </button>

          <button
            onClick={() => setQuickFilter(prev => prev === 'urgent' ? 'all' : 'urgent')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              quickFilter === 'urgent'
                ? 'bg-red-100 text-red-900 border border-red-300 font-bold'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-red-600" />
            <span>Urgente / Inmediato</span>
          </button>

          <button
            onClick={() => setQuickFilter(prev => prev === 'with_salary' ? 'all' : 'with_salary')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              quickFilter === 'with_salary'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Con sueldo indicado</span>
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1 flex-shrink-0" />

          {/* Ordenar */}
          <button
            onClick={() => setSortBy(prev => prev === 'recent' ? 'clicks' : prev === 'clicks' ? 'views' : 'recent')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1"
            title="Cambiar orden"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {sortBy === 'recent' ? 'Más recientes' : sortBy === 'clicks' ? '+ WhatsApp' : '+ Vistos'}
            </span>
          </button>
        </div>

        {/* Rubros y Categorías con Barra Desplazable Horizontal en Móvil */}
        <div className="pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos los Rubros
            </button>

            {categories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Barra de Estado de Resultados en Vivo */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
            {searchQuery ? (
              <span>
                Resultados para <span className="text-emerald-700 font-black">"{searchQuery}"</span>
              </span>
            ) : (
              <span>
                Avisos en {selectedCity === 'all' ? 'Puno y Juliaca' : selectedCity}
              </span>
            )}
          </h2>
          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
            {filteredAds.length}
          </span>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="text-xs font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {/* Feed Principal de Anuncios (Tarjetas Optimizadas para Celular) */}
      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                </div>
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-12 bg-slate-100 rounded"></div>
                <div className="h-10 bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                No encontramos avisos con esta búsqueda
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Prueba buscando por palabras clave más sencillas como <span className="font-semibold text-slate-700">"cocina"</span>, <span className="font-semibold text-slate-700">"chofer"</span>, <span className="font-semibold text-slate-700">"mozo"</span> o limpia los filtros.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('all');
                  setSelectedCategory('all');
                  setQuickFilter('all');
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                Limpiar todos los filtros
              </button>

              <Link
                href="/advertiser/nuevo"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
              >
                ¿Buscas personal? Publica tu aviso por S/ 0.50/día
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredAds.map(ad => (
              <AdCard 
                key={ad.id} 
                ad={ad} 
                onUpdate={loadData}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
