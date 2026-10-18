import { CreateAdWizard } from '@/components/CreateAdWizard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coloca tu Anuncio | Chamba Al Toque Puno & Juliaca',
  description: 'Publica tu aviso de empleo por S/ 0.50 PEN al día vía Yape y llega a miles de trabajadores.',
};

export default function NuevoAvisoPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <CreateAdWizard />
    </div>
  );
}
