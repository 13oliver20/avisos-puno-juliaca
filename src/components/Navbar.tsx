'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, PlusCircle, ShieldAlert, LogIn, User } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isPublic = pathname === '/' || pathname.startsWith('/public');
  const isAdmin = pathname.startsWith('/admin');
  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/panel';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo y título */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                  Chamba<span className="text-emerald-600">AlToque</span>
                </span>
                <span className="bg-amber-100 text-amber-800 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                  Puno & Juliaca
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:block mt-0.5">
                Avisos clasificados de empleo local
              </span>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <nav className="flex items-center gap-1.5">
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

              {/* Botón Iniciar Sesión / Nombre de Usuario si está logeado */}
              {user ? (
                <Link
                  href="/panel"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition max-w-[190px] ${
                    pathname === '/panel'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100'
                  }`}
                  title={`Conectado como ${user.fullName || user.email}`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    pathname === '/panel' ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
                  }`}>
                    {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <span className="truncate">{user.firstName || user.email.split('@')[0]}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                    isAuthRoute
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Iniciar Sesión</span>
                </Link>
              )}

              <Link
                href="/admin"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  isAdmin
                    ? 'bg-purple-100 text-purple-900'
                    : 'text-slate-500 hover:text-purple-700 hover:bg-purple-50'
                }`}
                title="Panel de Administración"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            </nav>
          </div>

          {/* Botón CTA: "Publicar" en móvil, "Publicar anuncio" en desktop */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/advertiser/nuevo"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs sm:text-sm font-bold py-1.5 px-3 sm:py-2 sm:px-4 rounded-xl shadow-xs transition-all whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 flex-shrink-0" />
              <span>Publicar</span>
              <span className="hidden sm:inline">anuncio</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
