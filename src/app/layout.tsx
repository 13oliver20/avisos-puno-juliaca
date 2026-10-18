import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Chamba Al Toque | Avisos Clasificados de Empleo Puno y Juliaca',
  description: 'Plataforma digital de avisos clasificados de empleo tradicional (oficios, gastronomía, hotelería, construcción) para Puno y Juliaca.',
  keywords: ['empleo puno', 'trabajo juliaca', 'clasificados puno', 'chamba altiplano', 'oficios puno'],
  openGraph: {
    title: 'Chamba Al Toque - Puno & Juliaca',
    description: 'Encuentra trabajo u obreros en Puno y Juliaca sin comisiones ni intermediarios.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto space-y-2">
            <p className="font-semibold text-slate-700">
              Chamba Al Toque • Digitalización de Clasificados de Empleo en Puno y Juliaca
            </p>
            <p>
              Conectando trabajadores de oficios, gastronomía, hotelería y construcción directamente por WhatsApp.
            </p>
            <p className="text-[11px] text-slate-400">
              Tarifa para anunciantes: S/ 0.50 PEN por día vía Yape.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
