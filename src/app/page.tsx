'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Ad, Category, CityOption } from '@/types/database';
import { fetchActiveAds, fetchCategories } from '@/lib/adService';
import { AdCard } from '@/components/AdCard';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  SlidersHorizontal, 
  RefreshCw, 
  Briefcase, 
  ArrowUpDown,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function PublicFeedPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'clicks'>('recent');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, adsList] = await Promise.all([
        fetchCategories(),
        fetchActiveAds({
          categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
          city: selectedCity === 'all' ? undefined : selectedCity,
          search: searchQuery.trim() || undefined
        })
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
  }, [selectedCategory, selectedCity]);

  // Filtrado y ordenamiento en cliente para máxima fluidez
  const filteredAds = useMemo(() => {
    let result = [...ads];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ad =>
        ad.title.toLowerCase().includes(query) ||
        ad.description.toLowerCase().includes(query) ||
        ad.address?.toLowerCase().includes(query) ||
        ad.category?.name.toLowerCase().includes(query)
      );
    }

    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'clicks') {
      result.sort((a, b) => (b.metrics?.whatsapp_clicks || 0) - (a.metrics?.whatsapp_clicks || 0));
    }

    return result;
  }, [ads, searchQuery, sortBy]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Hero Banner Mobile-First */}
      <section className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digitalizando los clasificados del diario y afiches</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Chambas y Oficios en <span className="text-emerald-400">Puno & Juliaca</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Encuentra trabajo en restaurantes, hoteles, construcción, talleres y comercio. Contacta directamente al dueño por WhatsApp sin intermediarios ni cobros.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-xs">
              ⚡ Contacto directo por WhatsApp
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-xs">
              📍 Puno • Juliaca • Desaguadero
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-xs">
              💰 Anuncios desde S/ 0.50/día
            </span>
          </div>
        </div>
      </section>

      {/* Barra de Filtros y Búsqueda */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-4">
        {/* Buscador y Ciudad */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="relative sm:col-span-8">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar empleo (ej: ayudante de cocina, albañil, chofer, mozo)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
            />
          </div>

          <div className="sm:col-span-4 flex gap-2">
            {/* Selector de Ciudad */}
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition appearance-none cursor-pointer"
              >
                <option value="all">Todas las ciudades</option>
                <option value="Juliaca">Juliaca</option>
                <option value="Puno">Puno</option>
              </select>
            </div>

            {/* Ordenar */}
            <button
              onClick={() => setSortBy(prev => prev === 'recent' ? 'clicks' : 'recent')}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 text-slate-700 whitespace-nowrap"
              title="Cambiar orden"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">
                {sortBy === 'recent' ? 'Recientes' : '+ Populares'}
              </span>
            </button>
          </div>
        </div>

        {/* Rubros / Categorías (Scroll Horizontal en Móvil) */}
        <div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
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
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
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

      {/* Feed Principal de Anuncios */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900">
              Avisos Disponibles
            </h2>
            <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
              {filteredAds.length}
            </span>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="text-xs font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-16 bg-slate-100 rounded"></div>
                <div className="h-10 bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                No hay avisos con estos filtros
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Prueba cambiando la ciudad o seleccionando "Todos los Rubros".
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/advertiser/nuevo"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow hover:bg-emerald-700 transition"
              >
                ¿Buscas personal? Publica tu aviso por S/ 0.50/día
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredAds.map(ad => (
              <AdCard key={ad.id} ad={ad} onUpdate={loadData} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
