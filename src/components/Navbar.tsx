'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, PlusCircle, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const isPublic = pathname === '/' || pathname.startsWith('/public');
  const isAdvertiser = pathname.startsWith('/advertiser');
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo y título */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                  Chamba<span className="text-emerald-600">AlToque</span>
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                  Puno & Juliaca
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Avisos clasificados de empleo local
              </p>
            </div>
          </Link>

          {/* Navegación y Botón Principal "Coloca tu anuncio" */}
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                  isPublic
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Buscar Empleos
              </Link>

              <Link
                href="/advertiser"
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                  isAdvertiser
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Anunciantes
              </Link>

              <Link
                href="/admin"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  isAdmin
                    ? 'bg-purple-100 text-purple-900'
                    : 'text-slate-400 hover:text-purple-700 hover:bg-purple-50'
                }`}
                title="Panel de Administración"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            </nav>

            {/* Botón Destacado: Coloca tu anuncio */}
            <Link
              href="/advertiser/nuevo"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs sm:text-sm font-bold py-2 px-3 sm:px-4 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Coloca tu anuncio</span>
              <span className="hidden lg:inline bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                S/ 0.50/día
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
